#!/usr/bin/env node
import assert from 'node:assert/strict'
import { mkdirSync, readFileSync } from 'node:fs'
import { chromium, devices } from 'playwright'
import AxeBuilder from '@axe-core/playwright'

const base = process.env.BASE_URL ?? 'http://localhost:4174'
const screenshots = process.env.TUTOR_SCREENSHOTS ?? 'a11y-results/tutor'
mkdirSync(screenshots, { recursive: true })
const catalog = JSON.parse(readFileSync(new URL('../benchmark/medborgarskap-v1.sources.json', import.meta.url), 'utf8'))
const question = catalog.find((entry) => entry.id === 'k1-q1')
assert.ok(question, 'canonical pilot question is required')

const generated = {
  outcome: 'generated',
  explanation: 'Skagerrak and Kattegat are off Sweden’s west coast. The Baltic Sea is off the east coast.',
  example: null,
  checkQuestion: 'Which two seas are off Sweden’s west coast?',
  citations: [{
    sourceId: `uhr:${question.source.pdfVersion}:page:${question.source.page}`,
    quote: question.source.quote,
    quoteOffset: 0,
    url: `https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/sverige-i-fokus_.pdf#page=${question.source.page}`,
    authority: 'UHR',
    checkedAt: question.source.reviewedAt,
  }],
  sourceVersion: question.source.pdfVersion,
  sourceHash: question.canonicalQuestionSha256,
}

async function startQuestion(page) {
  await page.goto(`${base}/ovning/landet-sverige`, { waitUntil: 'networkidle' })
  await page.locator('form input[type="radio"]').first().check()
  await page.getByRole('button', { name: 'Svara', exact: true }).click()
  await page.getByRole('button', { name: 'Nästa fråga', exact: true }).waitFor()
}

async function assertAccessible(page, label) {
  // Revealed content fades in (.mb-enter); axe would measure contrast on a half-faded frame.
  // allSettled: a cancelled animation rejects; finite only and a 2 s cap, so a spinner can never hang the run.
  await page.evaluate(() =>
    Promise.race([
      Promise.allSettled(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
          .map((animation) => animation.finished),
      ),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]),
  )
  const result = await new AxeBuilder({ page }).include('main').analyze()
  assert.deepEqual(result.violations.map((violation) => ({ id: violation.id, targets: violation.nodes.map((node) => node.target) })), [], `${label}: accessibility violations`)
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${label}: horizontal overflow`)
}

async function checkTutor(browser, name, viewport, colorScheme) {
  const context = await browser.newContext({ ...viewport, colorScheme })
  const page = await context.newPage()
  const calls = []
  let getCount = 0
  let postCount = 0
  let analyticsRequests = 0
  page.on('request', (request) => {
    if (new URL(request.url()).hostname.includes('posthog')) analyticsRequests += 1
  })
  await context.route('**/api/tutor', async (route) => {
    if (route.request().method() === 'GET') {
      getCount += 1
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ available: true, chapterSlugs: ['landet-sverige'], privacyVersion: '2026-11-01' }) })
    }
    postCount += 1
    calls.push(route.request().postDataJSON())
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(generated) })
  })

  try {
    await startQuestion(page)
    assert.equal(getCount, 0, 'no background tutor availability request')
    assert.equal(postCount, 0, 'no model request before opt-in')
    await page.getByRole('button', { name: 'Få extra hjälp', exact: true }).click()
    await page.getByRole('checkbox', { name: /Jag förstår vad som skickas/ }).waitFor()
    assert.equal(getCount, 1)
    assert.equal(postCount, 0)
    assert.equal(await page.getByRole('button', { name: 'Be om extra hjälp', exact: true }).isDisabled(), true)
    await assertAccessible(page, `${name}/${colorScheme} disclosure`)
    await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }))
    await page.screenshot({ path: `${screenshots}/${name}-${colorScheme}-consent.png`, fullPage: true })
    await page.getByRole('combobox', { name: /^Språk/ }).selectOption('en')
    await page.getByRole('checkbox', { name: /Jag förstår vad som skickas/ }).check()
    assert.equal(postCount, 0, 'checkbox does not send a request')
    await page.getByRole('button', { name: 'Be om extra hjälp', exact: true }).click()
    await page.getByRole('heading', { name: 'AI-förklaring', exact: true }).waitFor()
    assert.equal(postCount, 1)
    assert.deepEqual(Object.keys(calls[0]).sort(), ['consent', 'intent', 'language', 'privacyVersion', 'questionId', 'selectedOptionId'].sort())
    assert.equal(calls[0].consent, true)
    assert.equal(calls[0].privacyVersion, '2026-11-01')
    assert.equal(calls[0].questionId, question.id)
    assert.equal(calls[0].language, 'en')
    const explanation = page.getByText(generated.explanation, { exact: true })
    assert.equal(await explanation.evaluate((element) => element.closest('[lang]')?.getAttribute('lang')), 'en')
    const resultHeading = page.getByRole('heading', { name: 'AI-förklaring', exact: true })
    assert.notEqual(await resultHeading.evaluate((element) => element.closest('[lang]')?.getAttribute('lang')), 'en')
    assert.equal(await resultHeading.evaluate((element) => document.activeElement === element), true, 'the result receives focus')
    assert.equal(await page.locator('.skip-link').evaluate((element) => element.getBoundingClientRect().bottom <= 0), true, 'the unfocused skip link remains outside the viewport')
    assert.equal(await page.locator(`a[href="${generated.citations[0].url}"]`).count() >= 1, true)
    assert.equal(await page.getByText(question.explanationSv, { exact: true }).first().isVisible(), true, 'authored explanation remains')
    await assertAccessible(page, `${name}/${colorScheme} generated answer`)
    await page.evaluate(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' }))
    await page.screenshot({ path: `${screenshots}/${name}-${colorScheme}-answer.png`, fullPage: true })
    await page.getByRole('button', { name: 'Nästa fråga', exact: true }).click()
    assert.equal(await page.getByText(generated.explanation, { exact: true }).count(), 0, 'answer does not leak to next question')
    assert.equal(await page.getByRole('button', { name: 'Få extra hjälp', exact: true }).count(), 0, 'tutor is absent before checking next answer')
    assert.equal(postCount, 1)
    assert.equal(analyticsRequests, 0, 'AI consent must not grant analytics consent')
  } finally {
    await context.close()
  }
}

async function checkRetry(browser, viewport) {
  const context = await browser.newContext(viewport)
  const page = await context.newPage()
  let gets = 0
  let posts = 0
  await context.route('**/api/tutor', async (route) => {
    if (route.request().method() === 'GET') {
      gets += 1
      if (gets === 1) return route.abort('failed')
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ available: true, chapterSlugs: ['landet-sverige'], privacyVersion: '2026-11-01' }) })
    }
    posts += 1
    return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"not_available"}' })
  })
  try {
    await startQuestion(page)
    await page.getByRole('button', { name: 'Få extra hjälp', exact: true }).click()
    await page.getByRole('button', { name: 'Försök igen', exact: true }).click()
    await page.getByRole('checkbox', { name: /Jag förstår vad som skickas/ }).waitFor()
    assert.equal(gets, 2, 'availability retry performs another GET')
    assert.equal(posts, 0)
    await page.getByRole('checkbox', { name: /Jag förstår vad som skickas/ }).check()
    await page.getByRole('button', { name: 'Be om extra hjälp', exact: true }).click()
    await page.getByRole('button', { name: 'Försök igen', exact: true }).waitFor()
    assert.equal(await page.getByText(question.explanationSv, { exact: true }).first().isVisible(), true)
    await page.getByRole('button', { name: 'Nästa fråga', exact: true }).click()
    assert.equal(posts, 1, 'Next never retries or submits the tutor')
  } finally {
    await context.close()
  }
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
try {
  const viewports = { mobile: { ...devices['Pixel 7'] }, desktop: { viewport: { width: 1366, height: 900 } } }
  for (const [name, viewport] of Object.entries(viewports)) {
    for (const colorScheme of ['light', 'dark']) await checkTutor(browser, name, viewport, colorScheme)
    await checkRetry(browser, viewport)
  }
  console.log('tutor e2e passed: consent, sources, language, retry, Next and axe on mobile/desktop in light/dark; API responses mocked')
} finally {
  await browser.close()
}

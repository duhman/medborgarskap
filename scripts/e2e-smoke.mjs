#!/usr/bin/env node
/**
 * End-to-end smoke test of the production build on a phone and a desktop viewport.
 *
 * - Every sitemap route: loads without console errors (hydration mismatches included), shows its h1,
 *   and has no horizontal scroll.
 * - Main flows: start studying from home, answer a chapter question, mixed practice, the mistakes
 *   list, continuing an unfinished quiz, reopening a visited chapter offline, the "do I need the test" checklist surviving a reload, and client-side navigation into a
 *   chapter whose questions load on demand.
 *
 * Usage: build first, then `BASE_URL=http://localhost:4173 node scripts/e2e-smoke.mjs`
 * (start `npm run preview` yourself). Set CHROMIUM_PATH to use a preinstalled Chromium.
 * Fails with E2E_FAILED and a list of problems.
 */
import { mkdirSync } from 'node:fs'
import { chromium, devices } from 'playwright'
import { getA11yRoutes } from './a11y-routes.mjs'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173'
const problems = []
const fail = (msg) => problems.push(msg)

const viewports = {
  mobile: { ...devices['Pixel 7'] },
  desktop: { viewport: { width: 1366, height: 900 } },
}

function watchConsole(page, label) {
  page.on('console', (msg) => {
    // Analytics may be blocked or unconfigured locally; everything else counts.
    if (msg.type() === 'error' && !/posthog/i.test(msg.text() + (msg.location().url ?? ''))) {
      fail(`${label}: console error: ${msg.text().slice(0, 300)}`)
    }
  })
  page.on('pageerror', (err) => fail(`${label}: page error: ${err.message.slice(0, 300)}`))
  page.on('requestfailed', (req) => {
    // ERR_ABORTED is a request cancelled by navigation, not a failure.
    if (req.url().startsWith(BASE_URL) && req.failure()?.errorText !== 'net::ERR_ABORTED') fail(`${label}: request failed: ${req.url()} (${req.failure()?.errorText})`)
  })
}

async function checkRoutes(browser, name) {
  const context = await browser.newContext(viewports[name])
  const page = await context.newPage()
  for (const route of getA11yRoutes()) {
    const label = `${name} ${route}`
    watchConsole(page, label)
    const res = await page.goto(BASE_URL + route, { waitUntil: 'networkidle' })
    if (!res?.ok()) fail(`${label}: HTTP ${res?.status()}`)
    const h1 = await page.locator('main h1').first().textContent().catch(() => null)
    if (!h1?.trim()) fail(`${label}: no h1`)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    if (overflow > 1) fail(`${label}: horizontal scroll of ${overflow}px`)
    if (await page.getByText('Laddar…').count()) fail(`${label}: stuck on loading`)
    page.removeAllListeners('console')
    page.removeAllListeners('pageerror')
    page.removeAllListeners('requestfailed')
  }
  await context.close()
}

async function checkMissingRoutes(browser, name) {
  const context = await browser.newContext(viewports[name])
  const page = await context.newPage()
  page.on('pageerror', (error) => fail(`${name} missing route: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error' && !/Failed to load resource.*404/.test(message.text())) {
      fail(`${name} missing route: ${message.text().slice(0, 300)}`)
    }
  })
  for (const route of ['/does-not-exist', '/kapitel/does-not-exist', '/ovning/does-not-exist']) {
    const response = await page.goto(BASE_URL + route, { waitUntil: 'networkidle' })
    if (response?.status() !== 404) fail(`${name} ${route}: expected HTTP 404`)
    await page.getByRole('heading', { level: 1, name: 'Sidan hittades inte' }).waitFor()
    if (!(await page.locator('meta[name="robots"]').getAttribute('content'))?.includes('noindex')) {
      fail(`${name} ${route}: missing noindex`)
    }
    await page.getByRole('main').getByRole('link', { name: /^Alla kapitel/ }).click()
    await page.waitForURL('**/kapitel')
    await page.waitForFunction(
      () => document.querySelector('meta[name="robots"]')?.getAttribute('content') === 'index, follow',
      undefined,
      { timeout: 5000 },
    ).catch(() => fail(`${name}: noindex persisted after leaving 404`))
  }
  await context.close()
}

async function answerCurrent(page, pick = 0) {
  await page.locator('form .mb-choice').nth(pick).click()
  await page.getByRole('button', { name: 'Svara' }).click()
}

async function expectBorderToken(page, locator, token, label) {
  const expected = await page.evaluate((token) => {
    const probe = document.createElement('div')
    probe.style.cssText = `position:absolute;visibility:hidden;border:1px solid var(${token})`
    document.body.appendChild(probe)
    const color = getComputedStyle(probe).borderTopColor
    probe.remove()
    return color
  }, token)

  await page.mouse.move(0, 0)
  await locator.hover()
  await locator.evaluate((el) =>
    new Promise((resolve) => {
      const finish = () => resolve()
      el.addEventListener('transitionend', finish, { once: true })
      window.setTimeout(finish, 400)
    }),
  )

  const deadline = Date.now() + 3000
  let actual = ''
  let hover = false
  while (Date.now() < deadline) {
    const reading = await locator.evaluate((el) => ({
      actual: getComputedStyle(el).borderTopColor,
      hover: el.matches(':hover'),
    }))
    actual = reading.actual
    hover = reading.hover
    if (actual === expected) return
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  fail(`${label}: border ${actual}, expected ${expected} for ${token} (hover=${hover})`)
}

async function checkChoiceHoverBorders(browser, name) {
  if (name !== 'desktop') return
  const context = await browser.newContext(viewports[name])
  const page = await context.newPage()
  const label = `${name} choice hover`
  const shotDir = process.env.CHOICE_HOVER_SCREENSHOT_DIR
  if (shotDir) mkdirSync(shotDir, { recursive: true })

  let checkedUnchecked = false
  let graded = false
  for (const pick of [3, 2, 1, 0]) {
    await page.goto(BASE_URL + '/ovning/landet-sverige', { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Svara' }).waitFor()
    await page.waitForFunction(() => {
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.cssText?.includes('mb-choice:where')) return true
          }
        } catch {
          /* cross-origin sheet */
        }
      }
      return false
    })
    await page.locator('form .mb-choice').first().waitFor()
    if (!checkedUnchecked) {
      const unchecked = page.locator('form .mb-choice').first()
      await expectBorderToken(page, unchecked, '--ink-2', `${label} unchecked`)
      if (shotDir) {
        await unchecked.hover()
        await page.screenshot({
          path: `${shotDir}/choice-unchecked-hover-1280.png`,
          fullPage: false,
        })
      }
      checkedUnchecked = true
    }
    await page.locator('form .mb-choice').nth(pick).click()
    await page.getByRole('button', { name: 'Svara' }).click()
    if (await page.locator('form .mb-choice--wrong').count()) {
      graded = true
      break
    }
  }
  if (!graded) fail(`${label}: could not submit a wrong answer`)

  const muted = page.locator('form .mb-choice.mb-choice--muted').first()
  await expectBorderToken(page, muted, '--ink-3', `${label} muted`)
  if (shotDir) {
    await muted.hover()
    await page.screenshot({ path: `${shotDir}/mb-choice-muted-hover-after-1280.png`, fullPage: false })
  }

  const correct = page
    .locator('form .mb-choice.mb-choice--correct')
    .filter({ hasNot: page.locator('input:checked') })
    .first()
  if (!(await correct.count())) fail(`${label}: no unchecked correct row after wrong answer`)
  await expectBorderToken(page, correct, '--ok', `${label} correct unchecked`)
  if (shotDir) {
    await correct.hover()
    await page.screenshot({
      path: `${shotDir}/mb-choice-correct-hover-after-wrong-1280.png`,
      fullPage: false,
    })
  }

  const wrongChecked = page.locator('form .mb-choice.mb-choice--wrong').filter({ has: page.locator('input:checked') }).first()
  if (!(await wrongChecked.count())) fail(`${label}: no checked wrong row after wrong answer`)
  await expectBorderToken(page, wrongChecked, '--error', `${label} wrong checked`)
  if (shotDir) {
    await wrongChecked.hover()
    await page.screenshot({
      path: `${shotDir}/mb-choice-wrong-checked-hover-1280.png`,
      fullPage: false,
    })
  }

  let correctGraded = false
  for (const pick of [0, 1, 2, 3]) {
    await page.goto(BASE_URL + '/ovning/landet-sverige', { waitUntil: 'networkidle' })
    await page.evaluate(() => localStorage.clear())
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Svara' }).waitFor()
    await page.locator('form .mb-choice').first().waitFor()
    await page.locator('form .mb-choice').nth(pick).click()
    await page.getByRole('button', { name: 'Svara' }).click()
    if (await page.locator('form .mb-choice--wrong').count()) continue
    if (await page.locator('form .mb-choice--correct').count()) {
      correctGraded = true
      break
    }
  }
  if (!correctGraded) fail(`${label}: could not submit a correct answer`)

  const correctChecked = page
    .locator('form .mb-choice.mb-choice--correct')
    .filter({ has: page.locator('input:checked') })
    .first()
  if (!(await correctChecked.count())) fail(`${label}: no checked correct row after correct answer`)
  await expectBorderToken(page, correctChecked, '--ok', `${label} correct checked`)
  if (shotDir) {
    await correctChecked.hover()
    await page.screenshot({
      path: `${shotDir}/mb-choice-correct-checked-hover-1280.png`,
      fullPage: false,
    })
  }

  await context.close()
}

async function checkFlows(browser, name) {
  const context = await browser.newContext(viewports[name])
  const page = await context.newPage()
  watchConsole(page, `${name} flows`)

  // Home → chapter list → chapter (client-side navigation, chapter loads on demand).
  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: 'Börja studera' }).click()
  await page.waitForURL('**/kapitel')
  await page.locator('main ol a').nth(4).click()
  await page.waitForURL('**/kapitel/lag-och-ratt')
  await page.getByRole('heading', { level: 1, name: 'Lag och rätt' }).waitFor()
  if (!(await page.getByRole('heading', { name: 'Kapitlet på lätt svenska' }).count())) {
    fail(`${name}: chapter page has no summary after client navigation`)
  }

  // Practise: answer one question, see feedback, move on.
  await page.getByRole('link', { name: /Öva direkt/ }).click()
  await page.waitForURL('**/ovning/lag-och-ratt')
  await answerCurrent(page, 0)
  await page.getByRole('button', { name: /Nästa fråga/ }).waitFor()
  const feedback = await page.locator('form').first().textContent()
  if (!/Rätt|Inte rätt/.test(feedback ?? '')) fail(`${name}: no right/wrong feedback after answering`)

  // Leave mid-quiz and come back: the page offers to continue.
  await page.getByRole('button', { name: /Nästa fråga/ }).click()
  await answerCurrent(page, 0)
  await page.reload({ waitUntil: 'networkidle' })
  const resume = page.getByRole('button', { name: 'Fortsätt där du slutade' })
  // Answering the first question under the offer would overwrite the saved run.
  if (await page.locator('form .mb-choice').count()) fail(`${name}: question shows under the offer to continue`)
  if (await resume.count()) {
    await resume.click()
    if (!(await page.getByText(/Fråga 3 av/).count())) fail(`${name}: continuing did not return to question 3`)
  } else {
    fail(`${name}: no offer to continue an unfinished quiz`)
  }

  // Always pick the last option to get some wrong answers, then finish.
  for (let i = 0; i < 80; i += 1) {
    const next = page.getByRole('button', { name: /Nästa fråga|Visa resultat/ })
    if (await next.count()) {
      await next.first().click()
      continue
    }
    if (!(await page.getByRole('button', { name: 'Svara' }).count())) break
    await answerCurrent(page, 3)
  }
  if (!(await page.locator('#quiz-result').count())) fail(`${name}: no result screen`)

  // Mistakes list now has questions.
  await page.goto(BASE_URL + '/ovning/mina-fel', { waitUntil: 'networkidle' })
  if (await page.getByText('Du har inga sparade fel').count()) fail(`${name}: mistakes not saved`)

  // Progress shows on the chapter list.
  await page.goto(BASE_URL + '/kapitel', { waitUntil: 'networkidle' })
  if (!(await page.getByText(/kapitel övade/).count())) fail(`${name}: progress not shown on chapter list`)

  // Mixed practice starts with 10 questions.
  await page.goto(BASE_URL + '/ovning/blandat', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /10/ }).click()
  if (!(await page.getByText(/Fråga 1 av 10/).count())) fail(`${name}: mixed practice did not start`)
  // A mixed quiz left half way comes back with the same questions.
  await answerCurrent(page, 0)
  await page.getByRole('button', { name: /Nästa fråga/ }).click()
  await answerCurrent(page, 0)
  await page.reload({ waitUntil: 'networkidle' })
  const mixedResume = page.getByRole('button', { name: 'Fortsätt där du slutade' })
  if (await mixedResume.count()) {
    await mixedResume.click()
    if (!(await page.getByText(/Fråga 3 av 10/).count())) fail(`${name}: mixed practice did not continue at question 3`)
  } else {
    fail(`${name}: no offer to continue an unfinished mixed quiz`)
  }

  // Smart practice shows readiness from the answers so far and starts a round.
  await page.goto(BASE_URL + '/ovning/smart', { waitUntil: 'networkidle' })
  if (!(await page.getByText(/frågor sitter säkert/).count())) fail(`${name}: smart practice shows no readiness`)
  if (!(await page.getByText(/att repetera i dag/).count())) fail(`${name}: smart practice shows no due questions`)
  await page.getByRole('button', { name: /10/ }).click()
  if (!(await page.getByText(/Fråga 1 av 10/).count())) fail(`${name}: smart practice did not start`)

  // A study plan is made, survives a reload and ticks off practised chapters.
  await page.goto(BASE_URL + '/studieplan', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /^8\s*veckor$/ }).click()
  await page.reload({ waitUntil: 'networkidle' })
  if (!(await page.getByRole('heading', { name: /Vecka 1 av 8/ }).count())) fail(`${name}: study plan not saved`)
  if (!(await page.getByText('Övat', { exact: true }).count())) fail(`${name}: study plan does not tick off practised chapters`)

  // Word cards: flip a card and mark it known.
  await page.goto(BASE_URL + '/kapitel/lag-och-ratt', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /^Börja med \d+\s*ord$/ }).click()
  await page.getByRole('button', { name: 'Visa vad det betyder' }).click()
  if (!(await page.getByText(/^English: /).count())) fail(`${name}: word card shows no meaning`)
  await page.getByRole('button', { name: 'Jag kunde det' }).click()
  if (!(await page.getByText(/^1\s*av\s*\d+\s*kan du$/).count())) fail(`${name}: word card not counted as known`)

  // Saved questions: save the graded question, find it on /ovning/sparade, practise it, remove it.
  await page.goto(BASE_URL + '/ovning/landet-sverige', { waitUntil: 'networkidle' })
  await answerCurrent(page, 0)
  await page.getByRole('button', { name: 'Spara frågan' }).click()
  if (!(await page.getByRole('button', { name: 'Sparad, ta bort', pressed: true }).count())) fail(`${name}: bookmark not marked as saved`)
  await page.goto(BASE_URL + '/ovning/sparade', { waitUntil: 'networkidle' })
  if (!(await page.getByText(/Du har 1 sparad fråga/).count())) fail(`${name}: saved question not listed`)
  await page.getByRole('button', { name: 'Öva de sparade frågorna' }).click()
  if (!(await page.getByText(/Fråga 1 av 1/).count())) fail(`${name}: saved questions practice did not start`)
  await page.getByRole('button', { name: 'Tillbaka till listan' }).click()
  await page.getByRole('button', { name: /^Ta bort/ }).click()
  if (!(await page.getByText(/Du har inga sparade frågor/).count())) fail(`${name}: saved question not removed`)

  // Exam simulation: 20 questions with the clock, one answer, a reload keeps the clock and the
  // answer, then hand in early and see a result per chapter without a pass mark.
  await page.goto(BASE_URL + '/ovning/prov', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /^20\s*frågor, 30 min$/ }).click()
  if (!(await page.getByText(/Fråga 1 av 20/).count())) fail(`${name}: exam did not start`)
  if (!(await page.getByRole('timer').count())) fail(`${name}: exam shows no clock`)
  await page.locator('fieldset .mb-choice').first().click()
  await page.getByRole('button', { name: 'Nästa' }).click()
  await page.reload({ waitUntil: 'networkidle' })
  if (!(await page.getByText(/Fråga 2 av 20/).count())) fail(`${name}: exam did not continue after reload`)
  if (!(await page.getByText(/1 besvarade/).count())) fail(`${name}: exam answer lost on reload`)
  await page.getByRole('button', { name: 'Lämna in nu' }).click()
  await page.getByRole('button', { name: 'Lämna in och se resultat' }).click()
  if (!(await page.getByRole('heading', { name: /av 20 rätt/ }).count())) fail(`${name}: exam shows no result`)
  if (!(await page.getByText(/19 frågor lämnades obesvarade/).count())) fail(`${name}: exam does not count unanswered`)
  if (!(await page.getByRole('table', { name: 'Rätt per kapitel' }).count())) fail(`${name}: exam shows no per-chapter table`)
  if (!(await page.getByText(/så vi visar ingen/).count())) fail(`${name}: exam result must say no pass mark is shown`)
  await page.getByRole('button', { name: 'Nytt prov' }).click()
  if (!(await page.getByText(/Dina tidigare prov/).count())) fail(`${name}: exam result not kept in history`)

  // Checklist answers survive a reload.
  await page.goto(BASE_URL + '/behover-jag', { waitUntil: 'networkidle' })
  await page.locator('input[name="age"]').first().check()
  await page.reload({ waitUntil: 'networkidle' })
  if (!(await page.locator('input[name="age"]').first().isChecked())) fail(`${name}: checklist answer lost on reload`)

  // Offline: a visited chapter still opens (service worker), and studying continues.
  await page.goto(BASE_URL + '/kapitel/lag-och-ratt', { waitUntil: 'networkidle' })
  const swReady = await page.evaluate(() =>
    Promise.race([
      navigator.serviceWorker?.ready.then(() => true) ?? false,
      new Promise((resolve) => setTimeout(() => resolve(false), 10_000)),
    ]),
  )
  if (!swReady) fail(`${name}: service worker did not become ready`)
  await page.reload({ waitUntil: 'networkidle' })
  // Requests are expected to fail from here on.
  page.removeAllListeners('console')
  page.removeAllListeners('requestfailed')
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => null)
  const offlineH1 = await page.locator('main h1').first().textContent().catch(() => null)
  if (offlineH1?.trim() !== 'Lag och rätt') fail(`${name}: visited chapter does not open offline (${offlineH1})`)
  await context.setOffline(false)

  await context.close()
}

/** The analytics host the consent check builds with (see check:all). Never a real server. */
const ANALYTICS_HOST = 'posthog.e2e.invalid'

/**
 * Consent: nothing goes to the analytics host before a yes or after a no; a yes starts sending;
 * a no deletes the PostHog id. Needs a build with VITE_PUBLIC_POSTHOG_KEY and
 * VITE_PUBLIC_POSTHOG_HOST=https://posthog.e2e.invalid (npm run check:all does that).
 */
async function checkConsent(browser, name) {
  const context = await browser.newContext(viewports[name])
  let sent = 0
  await context.route(`https://${ANALYTICS_HOST}/**`, (route) => {
    sent += 1
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
  const page = await context.newPage()
  const quiet = () => page.waitForTimeout(4500) // past the idle-callback start (3 s timeout)

  await page.goto(BASE_URL + '/', { waitUntil: 'networkidle' })
  const banner = page.getByRole('region', { name: 'Får vi räkna besök?' })
  if (!(await banner.count())) {
    console.warn(`${name}: consent check skipped, this build has no analytics key`)
    await context.close()
    return
  }
  await quiet()
  if (sent !== 0) fail(`${name} consent: ${sent} analytics requests before any answer`)

  // No: the banner goes, the choice survives a reload, still nothing is sent.
  await page.getByRole('button', { name: 'Nej tack' }).click()
  if (!(await page.getByText('Ingen statistik skickas från den här webbläsaren.').count())) fail(`${name} consent: no confirmation after no`)
  await page.reload({ waitUntil: 'networkidle' })
  if (await banner.count()) fail(`${name} consent: banner shown again after no`)
  await quiet()
  if (sent !== 0) fail(`${name} consent: ${sent} analytics requests after no`)

  // Yes on the privacy page starts sending without a reload.
  await page.goto(BASE_URL + '/integritet', { waitUntil: 'networkidle' })
  await page.getByLabel('Ja, skicka statistik').check()
  await page.waitForFunction(() => Object.keys(localStorage).some((k) => /^ph_.+_posthog$/.test(k)), null, { timeout: 10_000 }).catch(() => null)
  await quiet()
  if (sent === 0) fail(`${name} consent: no analytics requests after yes`)

  // No again: the id is deleted and sending stops.
  await page.getByLabel('Nej, skicka ingen statistik').check()
  const hasId = await page.evaluate(() => Object.keys(localStorage).some((k) => /^ph_.+_posthog$/.test(k)))
  if (hasId) fail(`${name} consent: PostHog id left in localStorage after no`)
  const before = sent
  await page.goto(BASE_URL + '/kapitel', { waitUntil: 'networkidle' })
  await quiet()
  if (sent !== before) fail(`${name} consent: ${sent - before} analytics requests after changing to no`)

  await context.close()
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
)
try {
  for (const name of Object.keys(viewports)) {
    await checkRoutes(browser, name)
    await checkChoiceHoverBorders(browser, name)
    await checkFlows(browser, name)
    await checkMissingRoutes(browser, name)
    await checkConsent(browser, name)
  }
} finally {
  await browser.close()
}

if (problems.length) {
  console.error(`E2E_FAILED (${problems.length}):\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log(`e2e ok (${getA11yRoutes().length} routes and main flows on mobile and desktop).`)

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

async function answerCurrent(page, pick = 0) {
  await page.locator('form .mb-choice').nth(pick).click()
  await page.getByRole('button', { name: 'Svara' }).click()
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

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
)
try {
  for (const name of Object.keys(viewports)) {
    await checkRoutes(browser, name)
    await checkFlows(browser, name)
  }
} finally {
  await browser.close()
}

if (problems.length) {
  console.error(`E2E_FAILED (${problems.length}):\n- ${problems.join('\n- ')}`)
  process.exit(1)
}
console.log(`e2e ok (${getA11yRoutes().length} routes and main flows on mobile and desktop).`)

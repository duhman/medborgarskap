/**
 * Browser checks must use the maintained system Chrome with Chromium's sandbox enabled.
 * Playwright creates a temporary browser profile for each launch.
 */
export function secureChromiumLaunchOptions() {
  const executablePath = process.env.CHROMIUM_PATH
  return executablePath
    ? { executablePath, chromiumSandbox: true }
    : { channel: 'chrome', chromiumSandbox: true }
}

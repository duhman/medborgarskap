import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The chapter file is gone: a dropped connection, or a tab left open across a deploy.
vi.mock('./landet-sverige', () => ({
  get landetSverige(): never {
    throw new Error('chapter file missing')
  },
}))

describe('a chapter file that fails to load', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('hands a suspended render the same rejected promise, so the error page shows instead of a retry loop', async () => {
    const { loadChapter } = await import('./load')
    const first = loadChapter('landet-sverige')
    await expect(first).rejects.toThrow('chapter file missing')
    // React renders again when the promise rejects. A new promise here would suspend it again,
    // forever, and request the file on every pass.
    expect(loadChapter('landet-sverige')).toBe(first)
  })

  it('does the same for a page that needs every chapter', async () => {
    const { loadAllChapters } = await import('./load')
    const first = loadAllChapters()
    await expect(first).rejects.toThrow('chapter file missing')
    expect(loadAllChapters()).toBe(first)
  })

  it('tries again on a later visit', async () => {
    const { loadChapter, loadAllChapters } = await import('./load')
    const one = loadChapter('landet-sverige')
    const all = loadAllChapters()
    await expect(one).rejects.toThrow('chapter file missing')
    await expect(all).rejects.toThrow('chapter file missing')
    vi.advanceTimersByTime(6_000)
    const oneAgain = loadChapter('landet-sverige')
    const allAgain = loadAllChapters()
    expect(oneAgain).not.toBe(one)
    expect(allAgain).not.toBe(all)
    await expect(oneAgain).rejects.toThrow('chapter file missing')
    await expect(allAgain).rejects.toThrow('chapter file missing')
  })

  it('still loads the chapters whose files are there', async () => {
    const { loadChapter } = await import('./load')
    await expect(loadChapter('lag-och-ratt')).resolves.toMatchObject({ slug: 'lag-och-ratt' })
  })
})

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { getAllChapters } from '../../src/content/chapters/meta'

/**
 * Checks every question's quote against the text of Sverige i fokus, page by page.
 * Needs SOURCE_PDF_TEXT pointing at the JSON from scripts/extract-pdf-text.mjs; skipped otherwise
 * (the PDF is not checked in). CI and the weekly source check run it.
 */
const file = process.env.SOURCE_PDF_TEXT
const available = !!file && existsSync(file)

/** Compare text without whitespace, hyphens or soft hyphens, which differ with line breaks. */
function normalizeForQuote(s) {
  return s.replace(/[\s­\-‐-―]/g, '').replace(/[”“"]/g, '"').replace(/[’‘]/g, "'")
}

describe.skipIf(!available)('quotes match Sverige i fokus', () => {
  const { pages } = available
    ? JSON.parse(readFileSync(file, 'utf8'))
    : { pages: {} }
  const normalized = Object.entries(pages).map(([n, text]) => [Number(n), normalizeForQuote(text)])

  for (const ch of getAllChapters()) {
    it(`chapter ${ch.number}: every quote is on its cited page`, () => {
      const problems = []
      for (const q of ch.questions) {
        if (!q.source.quote) continue
        const needle = normalizeForQuote(q.source.quote)
        let found = normalized.filter(([, text]) => text.includes(needle)).map(([n]) => n)
        if (found.length === 0) {
          // A quote may run over a page break: accept either page.
          found = normalized
            .filter(([n, text]) => (text + (normalized.find(([m]) => m === n + 1)?.[1] ?? '')).includes(needle))
            .flatMap(([n]) => [n, n + 1])
        }
        if (found.length === 0) problems.push(`${q.id}: quote not found in the PDF: "${q.source.quote}"`)
        else if (q.source.page != null && !found.includes(q.source.page))
          problems.push(`${q.id}: cited page ${q.source.page}, quote is on page ${found.join(', ')}`)
      }
      expect(problems).toEqual([])
    })
  }
})

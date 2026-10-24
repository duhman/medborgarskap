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
        // Whole-page matches plus matches that run over a page break (either page may be cited).
        const found = new Set(normalized.filter(([, text]) => text.includes(needle)).map(([n]) => n))
        for (const [n, text] of normalized) {
          const next = normalized.find(([m]) => m === n + 1)?.[1]
          if (!next || text.includes(needle) || next.includes(needle)) continue
          if ((text + next).includes(needle)) found.add(n).add(n + 1)
        }
        if (found.size === 0) problems.push(`${q.id}: quote not found in the PDF: "${q.source.quote}"`)
        else if (q.source.page != null && !found.has(q.source.page))
          problems.push(`${q.id}: cited page ${q.source.page}, quote is on page ${[...found].join(', ')}`)
      }
      expect(problems).toEqual([])
    })
  }
})

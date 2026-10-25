import { useEffect, useRef, useState } from 'react'
import type { GlossaryTerm } from '../content/types'
import { shuffled } from '../lib/quiz'
import { GfNum } from './GfNum'
import { ListenButton } from './ListenButton'

type Round = { deck: GlossaryTerm[]; known: number; shown: boolean }

/**
 * Flip cards for a chapter's word list: see the word, think, show the meaning, then say whether
 * you knew it. Words you did not know come back at the end of the round.
 */
export function WordCards({ slug, terms }: { slug: string; terms: GlossaryTerm[] }) {
  const [round, setRound] = useState<Round | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const focusCard = useRef(false)

  useEffect(() => {
    if (focusCard.current) {
      focusCard.current = false
      cardRef.current?.focus()
    }
  })

  function start() {
    focusCard.current = true
    setRound({ deck: shuffled(terms), known: 0, shown: false })
  }

  function answer(knew: boolean) {
    if (!round) return
    const [card, ...rest] = round.deck
    focusCard.current = true
    setRound({ deck: knew ? rest : [...rest, card], known: round.known + (knew ? 1 : 0), shown: false })
  }

  const card = round?.deck[0]

  return (
    <section aria-labelledby="ordkort" className="space-y-3">
      <h2 id="ordkort" className="mb-section-head">
        Öva orden med kort
      </h2>
      {!round ? (
        <>
          <p className="text-ink-2">
            Se ett ord i taget och tänk efter vad det betyder. Vänd kortet och svara om du kunde
            det. Ord du inte kunde kommer tillbaka.
          </p>
          <button type="button" onClick={start} className="mb-btn mb-btn--secondary">
            Börja med <GfNum value={terms.length} /> ord
          </button>
        </>
      ) : card ? (
        <div ref={cardRef} tabIndex={-1} className="surface-raised space-y-4 p-5 outline-none sm:p-6">
          <p className="text-sm text-ink-3">
            <GfNum value={round.known} /> av <GfNum value={terms.length} /> kan du
          </p>
          <p className="text-2xl font-semibold" aria-live="polite">
            {card.term}
          </p>
          <ListenButton id={`${slug}:ord:${card.term}`} parts={[card.term]} label="Lyssna på ordet" />
          {round.shown ? (
            <>
              <div aria-live="polite" className="space-y-1 border-t border-line-strong pt-4">
                <p className="text-lg">{card.sv}</p>
                <p lang="en" className="text-ink-2">
                  English: {card.en}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => answer(true)} className="mb-btn mb-btn--primary">
                  Jag kunde det
                </button>
                <button type="button" onClick={() => answer(false)} className="mb-btn mb-btn--secondary">
                  Inte än
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                focusCard.current = true
                setRound({ ...round, shown: true })
              }}
              className="mb-btn mb-btn--primary w-full"
            >
              Visa vad det betyder
            </button>
          )}
        </div>
      ) : (
        <div ref={cardRef} tabIndex={-1} className="surface-raised space-y-3 p-5 outline-none sm:p-6" role="status">
          <p className="text-lg font-semibold">Bra! Du kan alla <GfNum value={terms.length} /> ord.</p>
          <button type="button" onClick={start} className="mb-btn mb-btn--secondary">
            Öva orden igen
          </button>
        </div>
      )}
    </section>
  )
}

import { GfNum } from '../../components/GfNum'
import { getAllChapters } from '../../content/chapters/meta'
import { useProgressState } from '../../lib/progress'
import { buildPlan } from '../../lib/studyPlan'

/** Beat C: progress line plus a compact chapter row list (tick 3 to 4 visible). */
export function BeatPlan() {
  const progress = useProgressState()
  const plan = progress.plan
  if (!plan) return <p className="og-preview-plan-line">Studieplan saknas</p>

  const chapters = getAllChapters()
  const weeks = buildPlan(chapters, plan.weeks)
  const practised = new Set(progress.quizResults.map((r) => r.slug))
  const done = weeks.flatMap((w) => w.chapters).filter((c) => practised.has(c.slug)).length
  const preview = chapters.slice(0, 6)

  return (
    <div className="og-preview-plan-panel flex h-full flex-col justify-center gap-8 pt-2">
      <h1 className="sr-only">Studieplan</h1>
      <p className="og-preview-plan-line m-0 text-center font-semibold text-ink">
        <GfNum value={done} /> av 13 kapitel övade.
      </p>
      <ul className="og-preview-plan-row m-0 list-none space-y-3 p-0 text-ink">
        {preview.map((c) => {
          const ovat = practised.has(c.slug)
          return (
            <li key={c.slug} className="flex items-center justify-center gap-3">
              <span
                aria-hidden="true"
                className={`inline-block size-4 shrink-0 rounded-full border-2 ${
                  ovat ? 'border-accent bg-accent' : 'border-ink-3 bg-transparent'
                }`}
              />
              <span className="font-medium">
                Kapitel {c.number}: {c.title}
              </span>
              {ovat && <span className="text-ink-2">Övat</span>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

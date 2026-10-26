import { GfNum } from '../../components/GfNum'
import { getAllChapters } from '../../content/chapters/meta'
import { useProgressState } from '../../lib/progress'
import { buildPlan } from '../../lib/studyPlan'

/** Beat C: studieplan progress line only (cropped). */
export function BeatPlan() {
  const progress = useProgressState()
  const plan = progress.plan
  if (!plan) return <p className="og-preview-plan-line">Studieplan saknas</p>

  const weeks = buildPlan(getAllChapters(), plan.weeks)
  const practised = new Set(progress.quizResults.map((r) => r.slug))
  const done = weeks.flatMap((w) => w.chapters).filter((c) => practised.has(c.slug)).length

  return (
    <div className="space-y-4 pt-4">
      <h1 className="sr-only">Studieplan</h1>
      <p className="og-preview-plan-line font-semibold text-ink">
        <GfNum value={done} /> av 13 kapitel övade.
      </p>
    </div>
  )
}

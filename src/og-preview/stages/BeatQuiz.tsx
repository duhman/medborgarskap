import { useChapter } from '../../content/chapters/load'
import { QuizRunner } from '../../components/QuizRunner'

const SLUG = 'politiska-val-och-partier'

/**
 * Beat B: k4-q1 on the chapter route (attempt 0 keeps authored order).
 * Recorder drives tap + Svara via data-og-quiz hooks.
 */
export function BeatQuiz() {
  const chapter = useChapter(SLUG)
  if (!chapter) return <p>Laddar…</p>
  const first = chapter.questions[0]
  if (!first) return null

  return (
    <div className="og-preview-quiz pt-1" data-og-quiz="reveal-card">
      <QuizRunner
        key={`og-${SLUG}-${first.id}`}
        slug={SLUG}
        chapterTitle={chapter.title}
        questions={[first]}
        saveResult={false}
        persistSession={false}
        ogPreview
      />
    </div>
  )
}

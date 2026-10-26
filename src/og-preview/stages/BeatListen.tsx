import { useChapter } from '../../content/chapters/load'
import { ListenButton } from '../../components/ListenButton'

const SLUG = 'politiska-val-och-partier'

/** Beat A: chapter title plus large playing listen control (no body text wall). */
export function BeatListen() {
  const chapter = useChapter(SLUG)

  if (!chapter) return <p>Laddar…</p>

  return (
    <div className="flex h-full flex-col justify-center gap-10 pt-2">
      <h1 className="og-preview-chapter-h1 font-semibold text-ink">{chapter.title}</h1>
      {chapter.summaryEasy && chapter.summaryEasy.length > 0 && (
        <ListenButton
          id={`${chapter.slug}:latt-svenska`}
          parts={chapter.summaryEasy}
          label="Lyssna på texten"
          forcePlaying
          className="og-preview-listen-btn mb-btn mb-btn--primary !no-underline"
        />
      )}
    </div>
  )
}

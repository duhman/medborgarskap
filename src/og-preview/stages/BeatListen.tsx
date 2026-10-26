import { useEffect } from 'react'
import { useChapter } from '../../content/chapters/load'
import { ListenButton } from '../../components/ListenButton'
import { speak } from '../../lib/speech'

const SLUG = 'politiska-val-och-partier'

/** Beat A: chapter h1 plus listen control in playing state. */
export function BeatListen({ autoPlay }: { autoPlay?: boolean }) {
  const chapter = useChapter(SLUG)

  useEffect(() => {
    if (!autoPlay || !chapter?.summaryEasy?.length) return
    speak(`${chapter.slug}:latt-svenska`, chapter.summaryEasy)
  }, [autoPlay, chapter?.slug, chapter?.summaryEasy])

  if (!chapter) return <p>Laddar…</p>

  return (
    <div className="space-y-6 pt-2">
      <h1 className="og-preview-chapter-h1 font-semibold">{chapter.title}</h1>
      {chapter.summaryEasy && chapter.summaryEasy.length > 0 && (
        <ListenButton
          id={`${chapter.slug}:latt-svenska`}
          parts={chapter.summaryEasy}
          label="Lyssna på texten"
          forcePlaying={autoPlay}
        />
      )}
    </div>
  )
}

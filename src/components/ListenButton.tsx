import { useEffect } from 'react'
import { speak, stopSpeaking, useCanSpeak, useSpeakingId } from '../lib/speech'

type Props = {
  /** Unique per text, so only the button that started reading shows Stoppa. */
  id: string
  parts: readonly string[]
  label: string
  className?: string
}

/** Reads text aloud with the device's Swedish voice. Renders nothing when there is none. */
export function ListenButton({ id, parts, label, className = '' }: Props) {
  const canSpeak = useCanSpeak()
  const playing = useSpeakingId() === id

  // Stop when the text goes away, for example on the next question or another page.
  useEffect(() => () => stopSpeaking(id), [id])

  if (!canSpeak) return null
  return (
    <button
      type="button"
      onClick={() => (playing ? stopSpeaking() : speak(id, parts))}
      className={`mb-link-quiet inline-flex min-h-11 items-center gap-2 text-[0.9375rem] ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
        {playing ? (
          <rect x="3" y="3" width="10" height="10" fill="currentColor" />
        ) : (
          <path
            d="M2 6h3l4-3v10l-4-3H2zM11 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6 6 0 0 1 0 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        )}
      </svg>
      {playing ? 'Stoppa uppläsningen' : label}
    </button>
  )
}

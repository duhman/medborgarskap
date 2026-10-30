import { toggleBookmark, useProgressState } from '../lib/progress'

/** Saves a question to the visitor's list on /ovning/sparade, or removes it. Browser-only state. */
export function BookmarkButton({ id, className = '' }: { id: string; className?: string }) {
  const saved = useProgressState().bookmarks.includes(id)
  return (
    <button
      type="button"
      aria-pressed={saved}
      onClick={() => toggleBookmark(id)}
      className={`mb-link-quiet inline-flex min-h-11 items-center gap-2 text-[0.9375rem] ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0">
        <path d="M4 2h8v12l-4-3-4 3z" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {saved ? 'Sparad, ta bort' : 'Spara frågan'}
    </button>
  )
}

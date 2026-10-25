import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <article className="space-y-4">
      <h1 className="text-3xl font-semibold">Sidan hittades inte</h1>
      <p className="text-ink-2">Adressen finns inte. Välj ett kapitel eller börja från startsidan.</p>
      <Link to="/kapitel" className="mb-link-quiet">Till kapitlen</Link>
    </article>
  )
}

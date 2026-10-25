import type { Readiness } from '../lib/review'

/**
 * A plain bar: known questions in the accent, ones right once in a lighter accent.
 * Decorative, so pair it with the counts in text.
 */
export function ReadinessBar({ readiness, className = '' }: { readiness: Readiness; className?: string }) {
  const pct = (n: number) => (readiness.total === 0 ? 0 : (n / readiness.total) * 100)
  return (
    <div aria-hidden="true" className={`flex h-2.5 bg-[var(--line)] ${className}`}>
      <div className="h-full bg-accent" style={{ width: `${pct(readiness.known)}%` }} />
      <div className="h-full bg-accent opacity-40" style={{ width: `${pct(readiness.learning)}%` }} />
    </div>
  )
}

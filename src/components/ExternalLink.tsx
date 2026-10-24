import type { ReactNode } from 'react'

type Props = {
  href: string
  children: ReactNode
  className?: string
}

/** Outbound link that opens in a new tab and says so, visually and to screen readers. */
export function ExternalLink({ href, children, className = 'mb-link-quiet' }: Props) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (öppnas i ny flik)</span>
    </a>
  )
}

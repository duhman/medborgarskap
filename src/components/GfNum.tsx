type GfNumProps = {
  value: number | string
  className?: string
}

/** Grundform Numerals for live counts, scores, and chapter/page references. */
export function GfNum({ value, className }: GfNumProps) {
  return <span className={className ? `gf-num ${className}` : 'gf-num'}>{value}</span>
}

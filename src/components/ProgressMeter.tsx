type Props = {
  value: number
  max: number
  className?: string
  /** Only where the value changes from a user action; saved progress would otherwise fade in after hydration. */
  animated?: boolean
}

/**
 * Grundform meter: one block per step, filled blocks in the accent. Decorative,
 * so pair it with a visible count in text.
 */
export function ProgressMeter({ value, max, className = '', animated = false }: Props) {
  return (
    <div aria-hidden="true" className={`flex gap-[3px] ${className}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 flex-1 ${animated ? 'transition-colors duration-200' : ''} ${i < value ? 'bg-accent' : 'bg-[var(--line)]'}`}
        />
      ))}
    </div>
  )
}

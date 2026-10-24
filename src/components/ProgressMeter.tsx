type Props = {
  value: number
  max: number
  className?: string
}

/**
 * Grundform meter: one block per step, filled blocks in the accent. Decorative,
 * so pair it with a visible count in text.
 */
export function ProgressMeter({ value, max, className = '' }: Props) {
  return (
    <div aria-hidden="true" className={`flex gap-[3px] ${className}`}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 flex-1 transition-colors duration-200 ${i < value ? 'bg-accent' : 'bg-[var(--line)]'}`}
        />
      ))}
    </div>
  )
}

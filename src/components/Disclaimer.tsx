export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <p
      className={
        compact
          ? 'text-xs leading-relaxed text-ink/70'
          : 'rounded-lg border border-paper-muted bg-white/50 px-4 py-3 text-sm leading-relaxed text-ink/80'
      }
    >
      Medborgarskap är en fristående studiehjälp. Vi är inte knutna till UHR, Skolverket eller
      Migrationsverket. Övningsfrågor är egna (utom tydligt märkta UHR-exempel). Beslut om
      medborgarskap och kunskapskrav fattas av myndigheter, inte av den här webbplatsen.
    </p>
  )
}

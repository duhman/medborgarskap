# Medborgarskap

Fristående övning till medborgarskapsprovet, baserad på UHR:s *Sverige i fokus*.

**Planerad adress:** https://provamedborgarskap.se

Medborgarskap är en personlig studiehjälp. Den är **inte** knuten till UHR, Skolverket eller Migrationsverket. Övningsfrågor är egna (utom tydligt märkta UHR-exempel på sidan Provfrågor).

Se [BUILD.md](./BUILD.md) för produktbrief och MVP-scope.

## Kom igång

```bash
npm install
npm run dev      # http://localhost:5173
bun run verify   # tsc, lint:ci, vitest, build (CoS gate; npm run verify works too)
npm run preview  # prod-like preview of dist/ (port 4173)
```

CI also runs Playwright axe (`npm run test:a11y`) after build; see [AGENTS.md](./AGENTS.md).

Deploy: statisk build på Vercel. `vercel.json` innehåller SPA-rewrite.

## Källor (officiellt material)

| Resurs | URL |
| --- | --- |
| Sverige i fokus (PDF, korr. 2026-08-10) | https://www.uhr.se/globalassets/_uhr.se/medborgarskapsprovet/utbildningsmaterial/sverige-i-fokus_.pdf |
| Utbildningsmaterial (PDF + MP3) | https://www.uhr.se/medborgarskapsprovet/utbildningsmaterial/ |
| Medborgarskapsprov | https://www.uhr.se/medborgarskapsprovet/ |
| Frågor och svar | https://www.uhr.se/medborgarskapsprovet/fragor-och-svar/ |
| Anmälan | https://medborgarskapsprovet.uhr.se/ |
| Migrationsverket (vuxna) | https://www.migrationsverket.se/du-vill-ansoka/svenskt-medborgarskap/medborgarskap-for-vuxna/medborgarskap-for-vuxna.html |

Vi länkar till PDF och MP3 hos UHR. Vi speglar inte PDF:en i v1.

## Uppdatera statusremsan

Redigera `src/config/status.ts`:

```ts
export const uhrStatus = {
  nextSitting: 'Information kommer på uhr.se',
  registrationOpen: false,
  notes: '...',
}
```

**Hitta aldrig på nästa provdatum.** Följ uhr.se och Migrationsverket.

## Innehåll och frågor

- Kapitelmetadata: `src/content/chapters/meta.ts`
- Fullt innehåll per kapitel (13 kapitel, frågor, lätt svenska, ordlista): `src/content/chapters/*.ts`
- UHR:s fem exempel: `src/content/officialSamples.ts`
- Frågemodell: `src/content/types.ts`

Lägg till nya övningsfrågor som original MC med `source: { chapter, page? }`, svensk förklaring och valfri engelska under fold.

## Framsteg

Quizresultat, fel, repetitionshistorik, studieplan och pathway-svar sparas i `localStorage` (`medborgarskap-progress-v1`). Inga konton i v1. Besöksstatistik via PostHog (EU) kan väljas bort på /integritet.

## Stack

Vite, React 19, TypeScript, React Router, Tailwind CSS 4, Vitest.

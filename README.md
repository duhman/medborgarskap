# Medborgarskap

Fristående övning till medborgarskapsprovet, baserad på UHR:s *Sverige i fokus*.

**Adress:** https://provamedborgarskap.se

Medborgarskap är en personlig studiehjälp. Den är **inte** knuten till UHR, Skolverket eller Migrationsverket. Övningsfrågor är egna (utom tydligt märkta UHR-exempel på sidan Provfrågor).

Se [BUILD.md](./BUILD.md) för produktbrief och MVP-scope.

## Kom igång

```bash
npm install
npm run dev      # http://localhost:5173
bun run verify   # typecheck, lint, unit tests, build and the build checks (see package.json; npm run verify works too)
npm run check:all  # verify + quotes against the PDF + browser checks; run before every merge
```

GitHub Actions CI is started by hand only; the gate before a merge is `npm run check:all` on your machine. The browser checks use the installed Google Chrome (or `CHROMIUM_PATH`). See [AGENTS.md](./AGENTS.md).

Deploy: statisk, förrenderad build på Vercel. Varje sida har sin egen HTML och okända adresser får en riktig 404 (ingen SPA-rewrite).

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
  checkedAt: '2026-11-17', // datum då uppgifterna jämfördes med uhr.se
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

Quizresultat, fel, repetitionshistorik, studieplan och pathway-svar sparas i `localStorage` (`medborgarskap-progress-v1`). Inga konton i v1. Besöksstatistik via PostHog (EU) skickas bara efter ett aktivt ja, och valet kan ändras på /integritet.

## Stack

Vite, React 19, TypeScript, React Router, Tailwind CSS 4, Vitest.

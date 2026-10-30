# Agent notes (Medborgarskap)

Public reference app for Grundform + SEO patterns. Vault SoT for pdfme checklists and ops live in obsidian-memory; link out instead of copying long ops prose here.

## Verify before merge

Canonical local gate (matches Adrian’s CoS stack: **tsc → lint:ci → vitest → build**):

```bash
bun install          # or npm ci in CI
bun run verify
```

| Step | Script | CI job `lint-build-a11y` today |
| ---- | ------ | ------------------------------ |
| Typecheck | `bun run tsc` | folded into `npm run build` |
| Lint | `bun run lint:ci` | `npm run lint` |
| Unit tests | `bun run test` | yes |
| Production build | `bun run build` | `npm run build` |

**Prod-like static server (Vercel shape):** after `bun run build`, smoke with `bun run preview` (default port 4173). This is the stack’s production bundle served locally; no Wrangler.

**Accessibility:** Playwright axe on all routes, part of `npm run check:all`. Install the browser once with `npm run test:a11y:install-browser -- --with-deps`.

**GitHub Actions:** CI (`ci.yml`) only runs when started by hand. The official-source check (`source-check.yml`) runs every Monday and opens or updates one issue when UHR, Migrationsverket or the PDF changes; read and close that issue. Before every merge run `npm run check:all` locally: verify, quotes against the PDF, then `scripts/run-browser-checks.mjs` (axe light/dark, Grundform contrast, e2e) against a Vercel-like static server.

**End to end:** `npm run test:e2e` with `BASE_URL` set (add `CHROMIUM_PATH=...` to use a preinstalled Chromium); `check:all` does this for you. Do not point it at `vite preview`, which serves the home HTML for every route. It loads every sitemap route on a phone and a desktop viewport (console errors, hydration mismatches, horizontal scroll) and walks the study flows, including resume and offline.

**Hydration and chapter loading:** `src/main.tsx` hydrates the prerendered HTML, so a page's first client render must match the prerender. Read localStorage only through `useSyncExternalStore` with an empty server snapshot (`useProgressState()` in src/lib/progress.ts). Chapter questions load per chapter from `src/content/chapters/load.ts` (`useChapter`, `useAllQuestions`); `chapterMetaList` holds what lists and SEO need and must not import chapter files (content.test.ts checks intro and question counts stay in sync). `public/sw.js` keeps visited pages readable offline.

**Grundform cascade:** `src/index.css` declares `@layer theme, base, grundform, site, components, utilities;` first, imports the vendored core with `layer(grundform)` and site CSS with `layer(site)`, so utilities beat base anchor color. Solid clay CTAs (`a.bg-accent`, `button.bg-accent`) use `--site-accent-on` from `@layer site` (see [PR #7](https://github.com/duhman/medborgarskap/pull/7)); do not add unlayered rules. Enforced by `npm run check:cascade` (scripts/check-layer-order.mjs, last step of `verify`): base < grundform < utilities in the built CSS, and no unlayered rules unless `grundform-unlayered-baseline.json` lists them with a reason and an expiry date (empty today). Before merge on theme or chrome changes: `bun run test:grundform-contrast` (fail string `GRUNDFORM_CTA_CONTRAST`). Vault SoT: [Grundform 0.2.0 seeded design system](https://github.com/duhman/obsidian-memory/blob/ed46ed28adca8fd6c30cd31f0fc2c4187a5edeb2/06-Atomic/insights/2026-09-25-grundform-0-2-0-seeded-design-system-sot.md).

## Dual writers (Lovable vs Cursor)

- Merge `main` into the PR branch before push; never rebase or amend commits already on the remote PR head.
- Agents change app code via PR; do not edit `supabase/migrations/`, `drizzle/`, lockfiles, or `.github/workflows/` unless the PR has GitHub label `infra-approved` or adds `docs/agent-scope-infra-approved.md` in the same change set.
- `npm run check:agent-scope` (also in `lint:ci`) fails with `AGENT_SCOPE_VIOLATION` when those paths change without that escape.
- Lockfile changes pass when the same PR changes the matching `package.json`; Dependabot PRs (identified by PR author `dependabot[bot]`, never by branch name) may change lockfiles and majors (not workflows or migrations). In GitHub Actions the guard re-reads the PR's labels and author from the API, so a re-run sees an `infra-approved` label added after the first run; this needs `GITHUB_TOKEN` in the step env on private repos, otherwise it warns and uses the event payload. Guard tests live in `scripts/__tests__/check-agent-scope.test.mjs` and run with the unit tests. If the PR base cannot be resolved (for example a shallow CI checkout), the guard first fetches the base branch when running in GitHub Actions, and otherwise fails with `AGENT_SCOPE_BASE_UNRESOLVED` instead of passing. Push events to `main` (including Lovable commits) are skipped.

## House rules

- No em/en dash in user-facing copy (ASCII hyphen only).
- Never invent UHR exam dates; edit `src/config/status.ts` from official sources only.
- Not affiliated with UHR / Skolverket / Migrationsverket; keep disclaimer visible.

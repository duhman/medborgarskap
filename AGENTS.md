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
| Unit tests | `bun run test` | not in CI yet (see PR body snippet) |
| Production build | `bun run build` | `npm run build` |

**Prod-like static server (Vercel shape):** after `bun run build`, smoke with `bun run preview` (default port 4173). This is the stack’s production bundle served locally; no Wrangler.

**Accessibility (CI-only today):** Playwright axe on all routes: `bun run test:a11y:install-browser -- --with-deps` once, then `bun run test:a11y`. Run before merge when touching layout, nav, or copy on interactive pages.

**Grundform cascade:** `src/index.css` declares `@layer theme, base, grundform, site, components, utilities;` first, imports the vendored core with `layer(grundform)` and site CSS with `layer(site)`, so utilities beat base anchor color. Solid clay CTAs (`a.bg-accent`, `button.bg-accent`) use `--site-accent-on` from `@layer site` (see [PR #7](https://github.com/duhman/medborgarskap/pull/7)); do not add unlayered rules. Enforced by `npm run check:cascade` (scripts/check-layer-order.mjs, last step of `verify`): base < grundform < utilities in the built CSS, and no unlayered rules unless `grundform-unlayered-baseline.json` lists them with a reason and an expiry date (empty today). Before merge on theme or chrome changes: `bun run test:grundform-contrast` (fail string `GRUNDFORM_CTA_CONTRAST`). Vault SoT: [Grundform 0.2.0 seeded design system](https://github.com/duhman/obsidian-memory/blob/ed46ed28adca8fd6c30cd31f0fc2c4187a5edeb2/06-Atomic/insights/2026-09-25-grundform-0-2-0-seeded-design-system-sot.md).

## House rules

- No em/en dash in user-facing copy (ASCII hyphen only).
- Never invent UHR exam dates; edit `src/config/status.ts` from official sources only.
- Not affiliated with UHR / Skolverket / Migrationsverket; keep disclaimer visible.

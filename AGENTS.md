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

## Dual writers (Lovable vs Cursor)

- Merge `main` into the PR branch before push; never rebase or amend commits already on the remote PR head.
- Agents change app code via PR; do not edit `supabase/migrations/`, `drizzle/`, lockfiles, or `.github/workflows/` unless the PR has GitHub label `infra-approved` or adds `docs/agent-scope-infra-approved.md` in the same change set.
- `npm run check:agent-scope` (also in `lint:ci`) fails with `AGENT_SCOPE_VIOLATION` when those paths change without that escape.

## House rules

- No em/en dash in user-facing copy (ASCII hyphen only).
- Never invent UHR exam dates; edit `src/config/status.ts` from official sources only.
- Not affiliated with UHR / Skolverket / Migrationsverket; keep disclaimer visible.

# Infra change approved: GitHub Actions turned off

2026-10-25: Adrian asked that nothing runs on GitHub Actions (no budget for CI minutes). `ci.yml` and
`source-check.yml` now only run when started by hand (`workflow_dispatch`). Every check runs locally
before merge with `npm run check:all`.

## 2026-10-30: weekly source check back on

Adrian asked for the weekly official-source check to run again. `source-check.yml` now runs every
Monday at 05:17 UTC and still by hand. The repository is public, so the minutes are free. `ci.yml`
stays manual; `npm run check:all` remains the gate before merge.

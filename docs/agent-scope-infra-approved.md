# Infra change approved: GitHub Actions turned off

2026-10-25: Adrian asked that nothing runs on GitHub Actions (no budget for CI minutes). `ci.yml` and
`source-check.yml` now only run when started by hand (`workflow_dispatch`). Every check runs locally
before merge with `npm run check:all`.

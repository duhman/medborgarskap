#!/usr/bin/env node
/** Prove new gates fail baseline fcf692a mp4 and pass current public/og-preview.mp4. */
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const proof = join(root, 'scripts/og-preview/proof')
const baseline = join(proof, 'baseline-fcf692a.mp4')
const current = join(root, 'public/og-preview.mp4')

function runCheck(video) {
  return spawnSync(process.execPath, ['scripts/check-og-preview-video.mjs', '--video', video, '--proof-dir', proof], {
    cwd: root,
    encoding: 'utf8',
  })
}

if (!existsSync(baseline)) {
  console.error(
    'Missing baseline-fcf692a.mp4; run: git show fcf692a:public/og-preview.mp4 > scripts/og-preview/proof/baseline-fcf692a.mp4',
  )
  process.exit(1)
}

const base = runCheck(baseline)
const cur = runCheck(current)

console.log(`baseline exit=${base.status ?? 'null'}`)
console.log(`current exit=${cur.status ?? 'null'}`)

if (base.status === 0) {
  console.error('Expected baseline to fail OG_PREVIEW_CHECK')
  process.exit(1)
}
if (cur.status !== 0) {
  console.error('Expected current video to pass OG_PREVIEW_CHECK')
  process.exit(1)
}
console.log('OG_GATE_REGRESSION_OK')

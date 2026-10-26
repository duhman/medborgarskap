import { describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildBrokenCrossfade } from '../og-preview/build-broken-crossfade.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const proof = join(root, 'scripts/og-preview/proof')
const realVideo = join(root, 'public/og-preview.mp4')

function runCheck(video) {
  return spawnSync(process.execPath, ['scripts/check-og-preview-video.mjs', '--video', video, '--proof-dir', proof], {
    cwd: root,
    encoding: 'utf8',
  })
}

describe('check:og-preview', () => {
  it('fails on deliberate crossfade corruption', async () => {
    if (!existsSync(join(proof, 'reference-frame.png'))) return
    await buildBrokenCrossfade()
    const broken = join(proof, 'broken-crossfade.mp4')
    const r = runCheck(broken)
    expect(r.status).not.toBe(0)
    expect(r.stderr + r.stdout).toMatch(/OG_PREVIEW_CHECK_FAILED/)
  })

  it(
    'passes on the shipped og-preview mp4',
    () => {
      if (!existsSync(realVideo)) return
      const r = runCheck(realVideo)
      expect(r.status).toBe(0)
      expect(r.stdout + r.stderr).toContain('OG_PREVIEW_CHECK_OK')
    },
    600_000,
  )
})

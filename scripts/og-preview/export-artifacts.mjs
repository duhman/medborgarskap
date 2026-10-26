#!/usr/bin/env node
/** Contact sheet (4 fps) and stills for og-preview proof. */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { FPS, WIDTH, HEIGHT } from './timing.mjs'

const proofDir = join(dirname(fileURLToPath(import.meta.url)), 'proof')
const artifactsDir = process.env.OG_ARTIFACTS_DIR ?? '/opt/cursor/artifacts/og-preview'

const STILLS_S = [0.6, 3.0, 5.2, 7.0]

async function main() {
  const framesDir = join(proofDir, 'frames')
  const pngs = (await readdir(framesDir)).filter((f) => f.endsWith('.png')).sort()
  if (!pngs.length) throw new Error('missing proof/frames; run record first')

  await mkdir(artifactsDir, { recursive: true })

  const contactFps = 4
  const step = Math.round(FPS / contactFps)
  const picks = pngs.filter((_, idx) => idx % step === 0)
  const thumbW = Math.round(WIDTH / 3)
  const thumbH = Math.round(HEIGHT / 3)
  const cols = 6
  const rows = Math.ceil(picks.length / cols)
  const composites = []
  for (let idx = 0; idx < picks.length; idx++) {
    composites.push({
      input: await sharp(join(framesDir, picks[idx])).resize({ width: thumbW, height: thumbH }).toBuffer(),
      left: (idx % cols) * thumbW,
      top: Math.floor(idx / cols) * thumbH,
    })
  }
  const sheet = await sharp({
    create: { width: thumbW * cols, height: thumbH * rows, channels: 3, background: '#FAF7F1' },
  })
    .composite(composites)
    .png()
    .toBuffer()
  await writeFile(join(artifactsDir, 'contact-sheet-4fps.png'), sheet)

  for (const t of STILLS_S) {
    const frameIdx = Math.min(pngs.length - 1, Math.round(t * FPS))
    const name = `still-${String(t).replace('.', '_')}s.png`
    await writeFile(join(artifactsDir, name), await readFile(join(framesDir, pngs[frameIdx])))
  }

  console.log(`Wrote ${artifactsDir}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

#!/usr/bin/node
/** Builds a deliberately bad crossfade mp4 for check-og-preview proof tests. */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'
import { compositeFrame } from './compositor.mjs'
import { FPS, TOTAL_FRAMES } from './timing.mjs'

const proofDir = join(dirname(fileURLToPath(import.meta.url)), 'proof')
const out = join(proofDir, 'broken-crossfade.mp4')

export async function buildBrokenCrossfade() {
  const bodiesDir = join(proofDir, 'bodies')
  const bandPng = await readFile(join(proofDir, 'reference-frame.png'))
  const listen = await readFile(join(bodiesDir, 'listen.png'))
  const quiz = await readFile(join(bodiesDir, 'quiz-r.png'))
  const framesDir = join(proofDir, 'broken-frames')
  await mkdir(framesDir, { recursive: true })

  const listenMeta = await sharp(listen).metadata()
  const quizSized = await sharp(quiz)
    .resize({ width: listenMeta.width, height: listenMeta.height, fit: 'fill' })
    .png()
    .toBuffer()

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = 0.5 * (1 + Math.sin((i / TOTAL_FRAMES) * Math.PI * 2))
    const blended = await sharp(listen)
      .ensureAlpha()
      .composite([{ input: quizSized, blend: 'over', opacity: t * 0.45 + 0.3 }])
      .png()
      .toBuffer()
    const png = await compositeFrame({ bandPng, bodyPng: blended, bodyAlpha: 1 })
    await writeFile(join(framesDir, `frame-${String(i).padStart(4, '0')}.png`), png)
  }

  spawnSync(
    'ffmpeg',
    ['-y', '-framerate', String(FPS), '-i', join(framesDir, 'frame-%04d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', out],
    { stdio: 'inherit' },
  )
  return out
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildBrokenCrossfade().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

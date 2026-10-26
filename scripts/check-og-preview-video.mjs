#!/usr/bin/env node
/**
 * Acceptance checks for public/og-preview.mp4 (brief section 9 + enforced local gate).
 * Usage: node scripts/check-og-preview-video.mjs [--video path] [--proof-dir dir]
 */
import { spawnSync } from 'node:child_process'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { beatAtFrame, FPS, HEIGHT, TOTAL_FRAMES, WIDTH, DURATION_S, BODY_TOP } from './og-preview/timing.mjs'
import { frameMeanWithinPaperBand, offPaletteRatio, rgbMeanFromBuffer } from './og-preview/palette.mjs'
import { bandRegionSsim, computeSsim } from './og-preview/ssim.mjs'
import { ocrPng, ocrViolations, ocrWords, terminateOcr } from './og-preview/ocr.mjs'
import {
  paperBandGate,
  bodyTransitionMinChannelGate,
  safeMarginGate,
  minTextHeightGate,
} from './og-preview/gates.mjs'
import { compositeFrame } from './og-preview/compositor.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const defaultVideo = join(root, 'public/og-preview.mp4')
const defaultProof = join(root, 'scripts/og-preview/proof')

const args = process.argv.slice(2)
const videoPath = args.includes('--video') ? args[args.indexOf('--video') + 1] : defaultVideo
const proofDir = args.includes('--proof-dir') ? args[args.indexOf('--proof-dir') + 1] : defaultProof

const problems = []
const fail = (msg) => problems.push(msg)

async function extractFrames(video, outDir) {
  await mkdir(outDir, { recursive: true })
  const r = spawnSync('ffmpeg', ['-y', '-i', video, join(outDir, 'frame-%04d.png')], { encoding: 'utf8' })
  if (r.status !== 0) fail(`ffmpeg extract failed: ${r.stderr?.slice(-400)}`)
}

async function loadRgba(path) {
  const { data, info } = await sharp(path).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

async function bodyReferenceRgba(bodyPng, bandPng) {
  const png = await compositeFrame({ bandPng, bodyPng, bodyAlpha: 1 })
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const rowBytes = info.width * 4
  const start = BODY_TOP * rowBytes
  return { data: data.subarray(start), width: info.width, height: info.height - BODY_TOP }
}

function bodyRegionSsim(frameData, ref, width) {
  const rowBytes = width * 4
  const start = BODY_TOP * rowBytes
  const bodyFrame = frameData.subarray(start)
  const refData = ref.data
  const h = Math.min(bodyFrame.length, refData.length) / rowBytes
  const bytes = Math.floor(h) * rowBytes
  return computeSsim(bodyFrame.subarray(0, bytes), refData.subarray(0, bytes), width, Math.floor(h))
}

function madRgb(a, b) {
  let s = 0
  const px = a.length / 4
  for (let i = 0; i < a.length; i += 4) {
    s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2])
  }
  return s / px / 3
}

function ghostViolations(frame, expected, foreign) {
  const madClean = madRgb(frame, expected)
  for (const alpha of [0.3, 0.4, 0.5]) {
    const ghost = Buffer.alloc(frame.length)
    for (let i = 0; i < frame.length; i += 4) {
      ghost[i] = expected[i] * (1 - alpha) + foreign[i] * alpha
      ghost[i + 1] = expected[i + 1] * (1 - alpha) + foreign[i + 1] * alpha
      ghost[i + 2] = expected[i + 2] * (1 - alpha) + foreign[i + 2] * alpha
    }
    if (madRgb(frame, ghost) + 0.35 < madClean) return true
  }
  return false
}

function errorRedRatio(data) {
  let hit = 0
  const n = data.length / 4
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 0xb8 && data[i + 1] === 0x32 && data[i + 2] === 0x2a) hit++
  }
  return hit / n
}

async function main() {
  if (!existsSync(videoPath)) fail(`missing video ${videoPath}`)

  const probe = spawnSync(
    'ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,duration', '-of', 'json', videoPath],
    { encoding: 'utf8' },
  )
  const stream = JSON.parse(probe.stdout || '{}').streams?.[0]
  if (stream) {
    if (Number(stream.width) !== WIDTH || Number(stream.height) !== HEIGHT) fail(`dimensions ${stream.width}x${stream.height}`)
    const fpsParts = String(stream.r_frame_rate).split('/')
    const fps = Number(fpsParts[0]) / Number(fpsParts[1] || 1)
    if (Math.abs(fps - FPS) > 0.5) fail(`fps ${fps}`)
    if (Math.abs(Number(stream.duration) - DURATION_S) > 0.11) fail(`duration ${stream.duration}s`)
  }

  const refPath = join(proofDir, 'reference-frame.png')
  if (!existsSync(refPath)) fail('missing proof reference-frame.png; run record-og-preview-video.mjs first')
  const bandPng = await readFile(refPath)

  const bodies = {}
  const bodyRefs = {}
  for (const name of ['listen', 'quiz-q', 'quiz-r', 'plan-3', 'plan-4', 'tagline', 'empty']) {
    bodies[name] = await readFile(join(proofDir, 'bodies', `${name}.png`))
    if (name !== 'empty') bodyRefs[name] = await bodyReferenceRgba(bodies[name], bandPng)
  }

  const beatBodyKey = {
    listen: 'listen',
    'quiz-q': 'quiz-q',
    'quiz-r': 'quiz-r',
    'plan-3': 'plan-3',
    'plan-4': 'plan-4',
    tagline: 'tagline',
    trans: 'empty',
  }

  const expectedCache = {}
  async function expectedForBeat(beat) {
    if (expectedCache[beat]) return expectedCache[beat]
    const key = beatBodyKey[beat] ?? 'empty'
    const alpha = beat === 'trans' ? 0 : 1
    const png = await compositeFrame({ bandPng, bodyPng: bodies[key], bodyAlpha: alpha })
    expectedCache[beat] = await loadRgba(png)
    return expectedCache[beat]
  }

  const fullForeign = {}
  for (const name of Object.keys(bodies)) {
    if (name === 'empty') continue
    const png = await compositeFrame({ bandPng, bodyPng: bodies[name], bodyAlpha: 1 })
    fullForeign[name] = (await loadRgba(png)).data
  }

  let frameSourceDir = join(proofDir, 'frames')
  let pngs = (await readdir(frameSourceDir).catch(() => [])).filter((f) => f.endsWith('.png')).sort()
  const useCachedFrames = videoPath === defaultVideo && pngs.length === TOTAL_FRAMES
  if (!useCachedFrames) {
    const extractDir = join(proofDir, 'check-frames')
    await extractFrames(videoPath, extractDir)
    frameSourceDir = extractDir
    pngs = (await readdir(extractDir)).filter((f) => f.endsWith('.png')).sort()
  }
  if (pngs.length !== TOTAL_FRAMES) fail(`frame count ${pngs.length}, expected ${TOTAL_FRAMES}`)

  const first = await loadRgba(join(frameSourceDir, pngs[0]))
  const last = await loadRgba(join(frameSourceDir, pngs[pngs.length - 1]))
  const loopSsim = computeSsim(first.data, last.data, WIDTH, HEIGHT)
  if (loopSsim < 0.997) fail(`loop SSIM ${loopSsim.toFixed(4)} < 0.997`)

  let sawEmptyTransition = false
  const textHeightChecked = new Set()

  const frameBuffers = []
  for (const f of pngs) frameBuffers.push(await loadRgba(join(frameSourceDir, f)))

  for (let i = 0; i < pngs.length; i++) {
    if (i === pngs.length - 1 && loopSsim >= 0.999) continue
    if (i % 50 === 0) console.log(`check:og-preview frame ${i}/${pngs.length}`)
    const beat = beatAtFrame(i)
    const { data, width, height } = frameBuffers[i]
    const mean = rgbMeanFromBuffer(data, width, height)
    if (!paperBandGate(mean)) fail(`frame ${i} paper-band gate (mean outside paper L band)`)
    if (!bodyTransitionMinChannelGate(data, width, height, beat)) {
      fail(`frame ${i} body gutter min channel < 200 during transition`)
    }
    if (!safeMarginGate(data, width, height)) fail(`frame ${i} safe-margin gate (non-paper in 60px side inset)`)
    if (beat !== 'trans' && beat !== 'quiz-r' && offPaletteRatio(data, width, height, 12) > 0.02) {
      fail(`frame ${i} off-palette > 2%`)
    }
    if (beat === 'quiz-r' && errorRedRatio(data) > 0.001) fail(`frame ${i} error red in correct-only beat`)

    if (bandRegionSsim(first.data, data, WIDTH) < 0.999) fail(`frame ${i} band SSIM < 0.999`)

    if (beat === 'trans') {
      const rowBytes = width * 4
      const bodyStart = BODY_TOP * rowBytes
      const body = data.subarray(bodyStart)
      const bodyMean = rgbMeanFromBuffer(body, width, height - BODY_TOP)
      if (frameMeanWithinPaperBand(bodyMean)) sawEmptyTransition = true
    }

    const fullPng = await sharp(data, { raw: { width, height, channels: 4 } }).png().toBuffer()
    const bodyPng = await sharp(data, { raw: { width, height, channels: 4 } })
      .extract({ left: 0, top: BODY_TOP, width, height: height - BODY_TOP })
      .png()
      .toBuffer()
    const text = `${await ocrPng(fullPng)} ${await ocrPng(bodyPng)}`
    const ocrIssues = ocrViolations(text, beat)
    if (ocrIssues.length) fail(`frame ${i} (${beat}) OCR: ${ocrIssues.join('; ')}`)

    if (beat !== 'trans' && !textHeightChecked.has(beat)) {
      textHeightChecked.add(beat)
      const words = await ocrWords(bodyPng)
      const thIssues = minTextHeightGate(words, beat)
      if (thIssues.length && ocrIssues.length === 0) {
        fail(`frame ${i} (${beat}) text-height: ${thIssues.join('; ')}`)
      }
    }

    if (beat === 'quiz-q' && bodyRegionSsim(data, bodyRefs['quiz-q'], WIDTH) < 0.96) {
      fail(`frame ${i} quiz-q body SSIM below 0.96`)
    }

    if (beat !== 'trans') {
      const rowBytes = width * 4
      const bodyStart = BODY_TOP * rowBytes
      const bodyFrame = data.subarray(bodyStart)
      const expected = await expectedForBeat(beat)
      const bodyExpected = expected.data.subarray(bodyStart)
      for (const [foreignKey, foreignData] of Object.entries(fullForeign)) {
        const currentKey = beatBodyKey[beat]
        if (foreignKey === currentKey) continue
        const bodyForeign = foreignData.subarray(bodyStart)
        if (ghostViolations(bodyFrame, bodyExpected, bodyForeign)) {
          fail(`frame ${i} ghost crossfade vs ${foreignKey}`)
          break
        }
      }
    }
  }

  if (!sawEmptyTransition) fail('no empty-body transition frame detected')

  await terminateOcr()

  if (videoPath === defaultVideo) {
    const thumbW = Math.round(WIDTH / 4)
    const thumbH = Math.round(HEIGHT / 4)
    const cols = 10
    const rows = Math.ceil(pngs.length / cols)
    const composites = []
    for (let idx = 0; idx < pngs.length; idx++) {
      composites.push({
        input: await sharp(join(frameSourceDir, pngs[idx])).resize({ width: thumbW, height: thumbH }).toBuffer(),
        left: (idx % cols) * thumbW,
        top: Math.floor(idx / cols) * thumbH,
      })
    }
    const strip = await sharp({
      create: { width: thumbW * cols, height: thumbH * rows, channels: 3, background: '#FAF7F1' },
    })
      .composite(composites)
      .png()
      .toBuffer()

    await mkdir(proofDir, { recursive: true })
    await writeFile(join(proofDir, 'frame-strip.png'), strip)
    await writeFile(join(proofDir, 'loop-first.png'), await readFile(join(frameSourceDir, pngs[0])))
    await writeFile(join(proofDir, 'loop-last.png'), await readFile(join(frameSourceDir, pngs[pngs.length - 1])))
    await writeFile(
      join(proofDir, 'check-report.json'),
      JSON.stringify({ video: videoPath, loopSsim, frames: pngs.length, problems, ok: problems.length === 0 }, null, 2),
    )
  }

  if (problems.length) {
    console.error('OG_PREVIEW_CHECK_FAILED')
    for (const p of problems) console.error(`- ${p}`)
    process.exit(1)
  }
  console.log('OG_PREVIEW_CHECK_OK')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

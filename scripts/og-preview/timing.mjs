/** @typedef {{ kind: 'hold' | 'transition' | 'reveal-tick', beat: string, frames: number, from?: string, to?: string }} Segment */

export const FPS = 30
export const WIDTH = 1200
export const HEIGHT = 630
export const BAND_TOP = 60
export const BAND_BOTTOM = 130
export const BODY_TOP = 131
export const DURATION_S = 8.8
export const TOTAL_FRAMES = Math.round(DURATION_S * FPS)

/** Strictly sequential timeline (brief section 4, totals 264 frames). */
export const SEGMENTS = [
  { kind: 'hold', beat: 'listen', frames: 42 },
  { kind: 'transition', beat: 'trans', frames: 18, from: 'listen', to: 'quiz-q' },
  { kind: 'hold', beat: 'quiz-q', frames: 18 },
  { kind: 'reveal-tick', beat: 'quiz-reveal', frames: 6, from: 'quiz-q', to: 'quiz-r' },
  { kind: 'hold', beat: 'quiz-r', frames: 60 },
  { kind: 'transition', beat: 'trans', frames: 18, from: 'quiz-r', to: 'plan-3' },
  { kind: 'hold', beat: 'plan', frames: 42, from: 'plan-3', to: 'plan-4' },
  { kind: 'hold', beat: 'tagline', frames: 42 },
  { kind: 'transition', beat: 'trans', frames: 18, from: 'tagline', to: 'listen' },
]

export function segmentFrameCount() {
  return SEGMENTS.reduce((n, s) => n + s.frames, 0)
}

/** Beat label for OCR whitelist at a given frame index. */
export function beatAtFrame(frameIndex) {
  let i = 0
  for (const seg of SEGMENTS) {
    if (frameIndex < i + seg.frames) {
      if (seg.kind === 'transition') return 'trans'
      if (seg.kind === 'reveal-tick') {
        const local = frameIndex - i
        const firstHalf = local < Math.floor(seg.frames / 2)
        if (seg.to?.startsWith('quiz')) return firstHalf ? 'quiz-q' : 'quiz-r'
        return firstHalf ? 'plan-3' : 'plan-4'
      }
      if (seg.beat === 'plan') {
        const local = frameIndex - i
        return local < 6 ? 'plan-3' : 'plan-4'
      }
      return seg.beat
    }
    i += seg.frames
  }
  return 'listen'
}

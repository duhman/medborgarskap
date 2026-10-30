import type { QuizOption, QuizQuestion } from '../content/types'
import { shuffled } from './quiz'

/**
 * Provsimulering: a set of questions from every chapter, answered without feedback and scored at
 * the end, with an optional clock. UHR has not published the number of questions or the time for
 * the next sitting, so the visitor picks the size and the clock runs at 1.5 minutes per question.
 * No pass mark is shown: UHR sets it afterwards.
 */

export const EXAM_SIZES = [20, 40, 60] as const

const MINUTES_PER_QUESTION = 1.5

const SESSION_STORE = 'medborgarskap-exam-v1'
const HISTORY_STORE = 'medborgarskap-exam-history-v1'
const HISTORY_MAX = 10

export type OptionId = QuizOption['id']

export type ExamSession = {
  /** Question ids in exam order. */
  ids: string[]
  answers: Record<string, OptionId | undefined>
  /** The question being shown. */
  index: number
  startedAt: string
  /** ISO time when the exam closes, or null for an exam without a clock. */
  deadline: string | null
}

export type ExamResult = {
  finishedAt: string
  score: number
  total: number
  timed: boolean
}

export type ExamScore = {
  score: number
  total: number
  unanswered: number
  byChapter: { chapter: number; score: number; total: number }[]
}

export function examMinutes(count: number): number {
  return Math.round(count * MINUTES_PER_QUESTION)
}

/**
 * Up to `count` questions spread over the chapters in proportion to how many questions each
 * chapter has (largest remainder, every chapter gets at least one while there is room), shuffled
 * within each chapter and kept in book order.
 */
export function pickExamQuestions(
  pool: readonly QuizQuestion[],
  count: number,
  random: () => number = Math.random,
): QuizQuestion[] {
  const byChapter = new Map<number, QuizQuestion[]>()
  for (const q of pool) {
    const list = byChapter.get(q.source.chapter) ?? []
    list.push(q)
    byChapter.set(q.source.chapter, list)
  }
  const chapters = [...byChapter.keys()].sort((a, b) => a - b)
  const target = Math.min(count, pool.length)
  if (target === 0) return []

  // Each chapter's share of the exam is its share of the bank, rounded down, at least one while
  // there is room; the places left go to the largest remainders.
  const size = (c: number) => byChapter.get(c)!.length
  const exact = new Map(chapters.map((c) => [c, (size(c) / pool.length) * target]))
  const quota = new Map(chapters.map((c) => [c, Math.min(size(c), Math.floor(exact.get(c)!))]))
  for (const c of chapters) {
    if (quota.get(c) === 0 && [...quota.values()].reduce((a, b) => a + b, 0) < target) quota.set(c, 1)
  }
  let left = target - [...quota.values()].reduce((a, b) => a + b, 0)
  if (left < 0) {
    // More chapters than places: drop the chapters with the smallest shares from the end.
    for (const c of [...chapters].sort((a, b) => exact.get(a)! - exact.get(b)! || b - a)) {
      if (left === 0) break
      if (quota.get(c)! > 0) {
        quota.set(c, quota.get(c)! - 1)
        left += 1
      }
    }
  }
  const byRemainder = [...chapters].sort(
    (a, b) => exact.get(b)! - Math.floor(exact.get(b)!) - (exact.get(a)! - Math.floor(exact.get(a)!)) || a - b,
  )
  while (left > 0) {
    let placed = false
    for (const c of byRemainder) {
      if (left === 0) break
      if (quota.get(c)! < size(c)) {
        quota.set(c, quota.get(c)! + 1)
        left -= 1
        placed = true
      }
    }
    if (!placed) break
  }

  return chapters.flatMap((c) => shuffled(byChapter.get(c)!, random).slice(0, quota.get(c)!))
}

export function scoreExam(questions: readonly QuizQuestion[], answers: ExamSession['answers']): ExamScore {
  const byChapter = new Map<number, { chapter: number; score: number; total: number }>()
  let score = 0
  let unanswered = 0
  for (const q of questions) {
    const row = byChapter.get(q.source.chapter) ?? { chapter: q.source.chapter, score: 0, total: 0 }
    row.total += 1
    const a = answers[q.id]
    if (a === undefined) unanswered += 1
    if (a === q.correctOptionId) {
      row.score += 1
      score += 1
    }
    byChapter.set(q.source.chapter, row)
  }
  return {
    score,
    total: questions.length,
    unanswered,
    byChapter: [...byChapter.values()].sort((a, b) => a.chapter - b.chapter),
  }
}

/** Milliseconds until the deadline (negative when passed), or null without a clock. */
export function msLeft(deadline: string | null, now: Date = new Date()): number | null {
  if (deadline === null) return null
  const ms = Date.parse(deadline) - now.getTime()
  return Number.isFinite(ms) ? ms : null
}

/** m:ss, never below 0:00. */
export function formatTimeLeft(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

export function subscribeExam(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    if (e.key === SESSION_STORE || e.key === HISTORY_STORE || e.key === null) listener()
  }
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
  }
}

export function saveExamSession(session: ExamSession): void {
  try {
    localStorage.setItem(SESSION_STORE, JSON.stringify(session))
  } catch {
    // Blocked storage: the exam still runs in memory for this visit.
  }
  notify()
}

/** The saved exam as a string, so useSyncExternalStore compares it by value. */
export function getExamSessionRaw(): string | null {
  try {
    return localStorage.getItem(SESSION_STORE)
  } catch {
    return null
  }
}

export function parseExamSession(raw: string | null): ExamSession | undefined {
  if (!raw) return undefined
  try {
    const p = JSON.parse(raw) as ExamSession
    if (
      !Array.isArray(p.ids) ||
      p.ids.length === 0 ||
      !p.ids.every((id) => typeof id === 'string') ||
      typeof p.answers !== 'object' ||
      p.answers === null ||
      !Number.isInteger(p.index) ||
      typeof p.startedAt !== 'string' ||
      (p.deadline !== null && typeof p.deadline !== 'string')
    ) {
      return undefined
    }
    return p
  } catch {
    return undefined
  }
}

export function clearExamSession(): void {
  try {
    localStorage.removeItem(SESSION_STORE)
  } catch {
    // Nothing to clear.
  }
  notify()
}

export function getExamHistory(): ExamResult[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(HISTORY_STORE) ?? '[]')
    return Array.isArray(parsed) ? (parsed as ExamResult[]) : []
  } catch {
    return []
  }
}

/** Newest first, at most ten. */
export function addExamResult(result: ExamResult): void {
  try {
    localStorage.setItem(HISTORY_STORE, JSON.stringify([result, ...getExamHistory()].slice(0, HISTORY_MAX)))
  } catch {
    // Blocked storage: the result still shows on screen.
  }
  notify()
}

export function getExamHistoryRaw(): string | null {
  try {
    return localStorage.getItem(HISTORY_STORE)
  } catch {
    return null
  }
}

/** Removes the running exam and the result history (used by "clear everything" on the privacy page). */
export function clearExamData(): void {
  try {
    localStorage.removeItem(SESSION_STORE)
    localStorage.removeItem(HISTORY_STORE)
  } catch {
    // Blocked storage: nothing was saved.
  }
  notify()
}

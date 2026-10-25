import type { QuizQuestion } from '../content/types'
import type { QuestionHistory } from './progress'
import { shuffled } from './quiz'

/**
 * Days until a question comes back, by right answers in a row (light spaced repetition).
 * A wrong answer resets the streak, so the question is due again at once.
 */
const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const

/** Share of a smart set that goes to questions due again, so new questions keep coming. */
const DUE_SHARE = 0.7

export type Mastery = 'new' | 'wrong' | 'learning' | 'known'

/** Known means right at least twice in a row; learning means right once since the last miss. */
export function masteryOf(h: QuestionHistory | undefined): Mastery {
  if (!h) return 'new'
  if (h.streak === 0) return 'wrong'
  return h.streak >= 2 ? 'known' : 'learning'
}

function daysBetween(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)
  return Number.isFinite(ms) ? Math.round(ms / 86_400_000) : 0
}

/** Days past the day a question should come back. Negative means not yet; null for new questions. */
export function daysOverdue(h: QuestionHistory | undefined, today: string): number | null {
  if (!h) return null
  const interval = INTERVAL_DAYS[Math.min(h.streak, INTERVAL_DAYS.length - 1)]
  return daysBetween(h.last, today) - interval
}

/**
 * Up to `count` questions for a smart round: questions answered wrong and questions due again
 * first (at most 70% of the round while there are new ones), then new questions, then the rest
 * by how soon they are due. The round is shuffled so missed questions are not all at the start.
 */
export function pickSmartQuestions(
  pool: readonly QuizQuestion[],
  history: Readonly<Record<string, QuestionHistory>>,
  count: number,
  today: string,
  random: () => number = Math.random,
): QuizQuestion[] {
  const wrong: QuizQuestion[] = []
  const due: { q: QuizQuestion; overdue: number }[] = []
  const fresh: QuizQuestion[] = []
  const later: { q: QuizQuestion; overdue: number; streak: number }[] = []
  for (const q of shuffled(pool, random)) {
    const h = history[q.id]
    const overdue = daysOverdue(h, today)
    if (!h || overdue === null) fresh.push(q)
    else if (h.streak === 0) wrong.push(q)
    else if (overdue >= 0) due.push({ q, overdue })
    else later.push({ q, overdue, streak: h.streak })
  }
  due.sort((a, b) => b.overdue - a.overdue)
  later.sort((a, b) => a.streak - b.streak || b.overdue - a.overdue)

  const dueFirst = [...wrong, ...due.map((d) => d.q)]
  const dueSlots = fresh.length > 0 ? Math.ceil(count * DUE_SHARE) : count
  const set = dueFirst.slice(0, dueSlots)
  for (const q of [...fresh, ...dueFirst.slice(dueSlots), ...later.map((l) => l.q)]) {
    if (set.length >= count) break
    set.push(q)
  }
  return shuffled(set, random)
}

/** How many questions are waiting: answered wrong, or right before and due again today. */
export function countDue(
  ids: readonly string[],
  history: Readonly<Record<string, QuestionHistory>>,
  today: string,
): number {
  return ids.filter((id) => {
    const overdue = daysOverdue(history[id], today)
    return overdue !== null && overdue >= 0
  }).length
}

export type Readiness = { total: number; known: number; learning: number; wrong: number; new: number }

/** Question ids look like k6-q1, so a chapter's questions can be counted without loading them. */
export function chapterNumberOfId(id: string): number | null {
  const m = /^k(\d+)-/.exec(id)
  return m ? Number(m[1]) : null
}

/**
 * Readiness for one chapter (by number) or all chapters (null), from the saved history.
 * `total` is the number of questions in the chapter, since unanswered ones have no history.
 */
export function readiness(
  history: Readonly<Record<string, QuestionHistory>>,
  chapter: number | null,
  total: number,
): Readiness {
  const r: Readiness = { total, known: 0, learning: 0, wrong: 0, new: 0 }
  for (const [id, h] of Object.entries(history)) {
    const n = chapterNumberOfId(id)
    if (n === null || (chapter !== null && n !== chapter)) continue
    r[masteryOf(h) as Exclude<Mastery, 'new'>] += 1
  }
  r.new = Math.max(0, total - r.known - r.learning - r.wrong)
  return r
}

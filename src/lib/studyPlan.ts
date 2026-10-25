import { chapterPageRanges, type ChapterMeta } from '../content/chapters/meta'

export type StudyPlanSettings = {
  /** First day of week 1, YYYY-MM-DD. */
  start: string
  weeks: number
}

export type PlanWeek = {
  number: number
  /** Chapters to read and practise this week. Empty in repetition weeks. */
  chapters: ChapterMeta[]
  review: boolean
}

export const PLAN_WEEK_CHOICES = [4, 8, 12, 16] as const

/** The last weeks go to repetition across all chapters, more of them in longer plans. */
export function reviewWeeks(weeks: number): number {
  if (weeks <= 2) return 0
  if (weeks <= 5) return 1
  return weeks <= 12 ? 2 : 3
}

/** Longer chapters (more pages and questions) weigh more, so weeks are about as big. */
function weight(c: ChapterMeta): number {
  const [first, last] = chapterPageRanges[c.number] ?? [0, 0]
  return last - first + 1 + c.questionCount / 10
}

/**
 * Splits the chapters, in book order, over the study weeks by weight, then adds repetition weeks.
 * With more study weeks than chapters, chapters are spread out and the weeks between are for
 * repetition; otherwise every study week gets at least one chapter.
 */
export function buildPlan(chapters: readonly ChapterMeta[], weeks: number): PlanWeek[] {
  const n = chapters.length
  const studyWeeks = Math.max(1, weeks - reviewWeeks(weeks))
  const plan: PlanWeek[] = Array.from({ length: studyWeeks }, (_, i) => ({ number: i + 1, chapters: [], review: false }))
  if (studyWeeks >= n) {
    chapters.forEach((c, i) => plan[Math.floor((i * studyWeeks) / n)].chapters.push(c))
  } else {
    const total = chapters.reduce((sum, c) => sum + weight(c), 0)
    let before = 0
    chapters.forEach((c, i) => {
      const middle = before + weight(c) / 2
      before += weight(c)
      // Never run ahead of or behind the chapters left, so no study week ends up empty.
      const byWeight = Math.floor((middle / total) * studyWeeks)
      const week = Math.min(Math.max(byWeight, studyWeeks - (n - i)), i)
      plan[week].chapters.push(c)
    })
  }
  for (const w of plan) w.review = w.chapters.length === 0
  for (let k = studyWeeks + 1; k <= weeks; k++) plan.push({ number: k, chapters: [], review: true })
  return plan
}

/** Which plan week a day falls in, from 1. Before the start it is 1; after the end, the last week. */
export function currentWeek(settings: StudyPlanSettings, today: string): number {
  const days = Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${settings.start}T00:00:00Z`)) / 86_400_000)
  if (!Number.isFinite(days) || days < 0) return 1
  return Math.min(settings.weeks, Math.floor(days / 7) + 1)
}

/** Whole weeks from today until a day, at least 1. */
export function weeksUntil(today: string, day: string): number {
  const days = (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000
  return Math.max(1, Math.floor(days / 7))
}

/** Day `n` days after a YYYY-MM-DD day. */
export function addDays(day: string, n: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10)
}

import { useSyncExternalStore } from 'react'
import { clearExamData } from './exam'
import type { StudyPlanSettings } from './studyPlan'

const STORAGE_KEY = 'medborgarskap-progress-v1'
const SESSION_PREFIX = 'medborgarskap-quiz-v1:'

export type QuizResult = {
  slug: string
  score: number
  total: number
  completedAt: string
}

export type PathwayAnswers = {
  ageBracket?: '16-66' | '67plus'
  schoolSamhall?: 'yes' | 'no' | 'unsure'
  /** Studerar SFI (språkspår), påverkar inte undantag för samhällskunskap. */
  sfiPath?: 'yes' | 'no'
  /**
   * Utfasad: SFI räknas för språkkravet, inte för samhällskunskap (Migrationsverket, kontrollerad
   * 2026-10-24). Kan finnas kvar i sparade svar men påverkar inte utfallet.
   */
  sfiKnowledgeAlternate?: 'yes' | 'no' | 'unsure'
  komvuxFolk?: 'yes' | 'no' | 'unsure'
}

export type PathwayOutcome = 'maybe-exempt' | 'likely-needed' | 'unclear'

/** How one question has gone so far, for smart practice and the readiness view. */
export type QuestionHistory = {
  right: number
  wrong: number
  /** Right answers in a row since the last wrong one. */
  streak: number
  /** Day of the last answer, YYYY-MM-DD in the visitor's time zone. */
  last: string
}

export type ProgressState = {
  visitedChapters: string[]
  quizResults: QuizResult[]
  pathway: PathwayAnswers
  /** Ids of questions answered wrong and not yet answered right since. */
  mistakes: string[]
  /** Per question id. Questions never answered are missing. */
  history: Record<string, QuestionHistory>
  /** The visitor's study plan, if they made one. */
  plan?: StudyPlanSettings
}

const defaultState = (): ProgressState => ({
  visitedChapters: [],
  quizResults: [],
  pathway: {},
  mistakes: [],
  history: {},
})

/** Used when the browser refuses to store anything (blocked storage), so answers still show. */
let memoryFallback: ProgressState | undefined

function readState(): ProgressState {
  if (memoryFallback) return structuredClone(memoryFallback)
  if (typeof localStorage === 'undefined') return defaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as ProgressState
    return {
      visitedChapters: parsed.visitedChapters ?? [],
      quizResults: parsed.quizResults ?? [],
      pathway: parsed.pathway ?? {},
      mistakes: parsed.mistakes ?? [],
      history: parsed.history ?? {},
      ...(parsed.plan ? { plan: parsed.plan } : {}),
    }
  } catch {
    return defaultState()
  }
}

const listeners = new Set<() => void>()

function writeState(state: ProgressState): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    memoryFallback = undefined
  } catch {
    // Storage full or blocked (private mode): keep progress in memory for this visit instead.
    memoryFallback = state
  }
  listeners.forEach((listener) => listener())
}

/** Subscribe to progress changes in this tab and in other tabs, for useSyncExternalStore. */
export function subscribeProgress(listener: () => void): () => void {
  listeners.add(listener)
  const onStorage = (e: StorageEvent) => {
    // key is null when another tab clears all storage.
    if (e.key === STORAGE_KEY || e.key === null || e.key.startsWith(SESSION_PREFIX)) listener()
  }
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
  }
}

export function markChapterVisited(slug: string): void {
  const state = readState()
  if (!state.visitedChapters.includes(slug)) {
    state.visitedChapters.push(slug)
    writeState(state)
  }
}

export function saveQuizResult(result: QuizResult): void {
  const state = readState()
  const idx = state.quizResults.findIndex((r) => r.slug === result.slug)
  if (idx >= 0) {
    state.quizResults[idx] = result
  } else {
    state.quizResults.push(result)
  }
  writeState(state)
}

/** Today as YYYY-MM-DD in the visitor's own time zone. */
export function localDay(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Remember which questions were answered wrong, and forget them once answered right.
 * Also keeps a short history per question for smart practice.
 * Unanswered questions leave both unchanged.
 */
export function recordAnswers(answers: { id: string; correct: boolean | null }[], now: Date = new Date()): void {
  const state = readState()
  const mistakes = new Set(state.mistakes)
  const day = localDay(now)
  for (const a of answers) {
    if (a.correct === null) continue
    const h = state.history[a.id] ?? { right: 0, wrong: 0, streak: 0, last: day }
    if (a.correct) {
      mistakes.delete(a.id)
      state.history[a.id] = { right: h.right + 1, wrong: h.wrong, streak: h.streak + 1, last: day }
    } else {
      mistakes.add(a.id)
      state.history[a.id] = { right: h.right, wrong: h.wrong + 1, streak: 0, last: day }
    }
  }
  state.mistakes = [...mistakes]
  writeState(state)
}

export function getMistakeIds(): string[] {
  return readState().mistakes
}

export function getQuizResult(slug: string): QuizResult | undefined {
  return readState().quizResults.find((r) => r.slug === slug)
}

export function savePathwayAnswers(pathway: PathwayAnswers): void {
  const state = readState()
  state.pathway = { ...state.pathway, ...pathway }
  writeState(state)
}

export function clearPathwayAnswers(): void {
  const state = readState()
  state.pathway = {}
  writeState(state)
}

export function saveStudyPlan(plan: StudyPlanSettings | undefined): void {
  const state = readState()
  if (plan) state.plan = plan
  else delete state.plan
  writeState(state)
}

export function getPathwayAnswers(): PathwayAnswers {
  return readState().pathway
}

export function getProgressState(): ProgressState {
  return readState()
}

const EMPTY_STATE: ProgressState = defaultState()
let snapshotRaw: string | null | undefined
let snapshot: ProgressState = EMPTY_STATE

function readSnapshot(): ProgressState {
  if (memoryFallback) return memoryFallback
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return EMPTY_STATE
  }
  if (raw !== snapshotRaw) {
    snapshotRaw = raw
    snapshot = raw ? readState() : EMPTY_STATE
  }
  return snapshot
}

/**
 * Progress for rendering. The prerendered HTML and the first client render use the empty state,
 * so hydration matches; React then re-renders with what this browser has saved.
 */
export function useProgressState(): ProgressState {
  return useSyncExternalStore(subscribeProgress, readSnapshot, () => EMPTY_STATE)
}

export function derivePathwayOutcome(answers: PathwayAnswers): PathwayOutcome {
  if (answers.ageBracket === '67plus') return 'maybe-exempt'
  if (answers.schoolSamhall === 'yes' || answers.komvuxFolk === 'yes') {
    return 'maybe-exempt'
  }
  if (answers.schoolSamhall === 'unsure' || answers.komvuxFolk === 'unsure') {
    return 'unclear'
  }
  if (answers.ageBracket === '16-66' && answers.schoolSamhall === 'no' && answers.komvuxFolk === 'no') {
    return 'likely-needed'
  }
  return 'unclear'
}

/** Test helper */
export function resetProgressForTests(): void {
  memoryFallback = undefined
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/** An unfinished chapter quiz, so the visitor can continue where they left off. */
export type QuizSession = {
  attempt: number
  /** The next question to answer, in the attempt's order. */
  index: number
  answers: Record<string, 'A' | 'B' | 'C' | 'D' | undefined>
  savedAt: string
  /** The question ids of the set, for sets picked at random (the mixed quiz) that must be rebuilt. */
  ids?: string[]
}

const SESSION_KEY = (slug: string) => `${SESSION_PREFIX}${slug}`

export function saveQuizSession(slug: string, session: QuizSession): void {
  try {
    localStorage.setItem(SESSION_KEY(slug), JSON.stringify(session))
  } catch {
    // Blocked storage: resuming is a convenience.
  }
  listeners.forEach((listener) => listener())
}

/** The saved session as a string, so useSyncExternalStore compares it by value. */
export function getQuizSessionRaw(slug: string): string | null {
  try {
    return localStorage.getItem(SESSION_KEY(slug))
  } catch {
    return null
  }
}

export function parseQuizSession(raw: string | null): QuizSession | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as QuizSession
    if (
      !Number.isInteger(parsed.index) ||
      !Number.isInteger(parsed.attempt) ||
      typeof parsed.answers !== 'object' ||
      parsed.answers === null ||
      (parsed.ids !== undefined && !Array.isArray(parsed.ids))
    ) {
      return undefined
    }
    return parsed
  } catch {
    return undefined
  }
}

export function clearQuizSession(slug: string): void {
  try {
    localStorage.removeItem(SESSION_KEY(slug))
  } catch {
    // Nothing to clear.
  }
  listeners.forEach((listener) => listener())
}

/** Removes everything this site saved in this browser: progress, mistakes, answers and unfinished quizzes. */
export function clearAllProgress(): void {
  memoryFallback = undefined
  clearExamData()
  try {
    for (const key of Object.keys(localStorage)) {
      if (key === STORAGE_KEY || key.startsWith(SESSION_PREFIX)) localStorage.removeItem(key)
    }
  } catch {
    // Blocked storage: nothing was saved.
  }
  listeners.forEach((listener) => listener())
}

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'medborgarskap-progress-v1'

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

export type ProgressState = {
  visitedChapters: string[]
  quizResults: QuizResult[]
  pathway: PathwayAnswers
  /** Ids of questions answered wrong and not yet answered right since. */
  mistakes: string[]
}

const defaultState = (): ProgressState => ({
  visitedChapters: [],
  quizResults: [],
  pathway: {},
  mistakes: [],
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
    if (e.key === STORAGE_KEY || e.key === null) listener()
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

/**
 * Remember which questions were answered wrong, and forget them once answered right.
 * Unanswered questions leave the list unchanged.
 */
export function recordAnswers(answers: { id: string; correct: boolean | null }[]): void {
  const state = readState()
  const mistakes = new Set(state.mistakes)
  for (const a of answers) {
    if (a.correct === true) mistakes.delete(a.id)
    if (a.correct === false) mistakes.add(a.id)
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
}

const SESSION_KEY = (slug: string) => `medborgarskap-quiz-v1:${slug}`

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
    if (typeof parsed.index !== 'number' || typeof parsed.attempt !== 'number' || !parsed.answers) return undefined
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

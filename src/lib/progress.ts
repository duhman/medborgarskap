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

function readState(): ProgressState {
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
    // Storage full or blocked (private mode): progress is a convenience, so carry on without it.
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
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

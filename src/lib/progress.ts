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
  sfiPath?: 'yes' | 'no'
  komvuxFolk?: 'yes' | 'no' | 'unsure'
}

export type ProgressState = {
  visitedChapters: string[]
  quizResults: QuizResult[]
  pathway: PathwayAnswers
}

const defaultState = (): ProgressState => ({
  visitedChapters: [],
  quizResults: [],
  pathway: {},
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
    }
  } catch {
    return defaultState()
  }
}

function writeState(state: ProgressState): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
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

/** Test helper */
export function resetProgressForTests(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

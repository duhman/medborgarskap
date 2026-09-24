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
  /** SFI D eller annat Migrationsverket-dokumenterat sätt att visa samhällskunskap. */
  sfiKnowledgeAlternate?: 'yes' | 'no' | 'unsure'
  komvuxFolk?: 'yes' | 'no' | 'unsure'
}

export type PathwayOutcome = 'maybe-exempt' | 'likely-needed' | 'unclear'

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

export function derivePathwayOutcome(answers: PathwayAnswers): PathwayOutcome {
  if (answers.ageBracket === '67plus') return 'maybe-exempt'
  if (
    answers.schoolSamhall === 'yes' ||
    answers.komvuxFolk === 'yes' ||
    answers.sfiKnowledgeAlternate === 'yes'
  ) {
    return 'maybe-exempt'
  }
  if (
    answers.schoolSamhall === 'unsure' ||
    answers.komvuxFolk === 'unsure' ||
    answers.sfiKnowledgeAlternate === 'unsure'
  ) {
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

/** Remembers in this browser that the visitor wants the English explanations open. */
const SHOW_EN_KEY = 'medborgarskap-show-en'

const listeners = new Set<() => void>()
/** Used when storage is blocked, so the choice still lasts for this visit. */
let memory: boolean | undefined

export function subscribeShowEn(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function readShowEn(): boolean {
  if (memory !== undefined) return memory
  try {
    return localStorage.getItem(SHOW_EN_KEY) === '1'
  } catch {
    return false
  }
}

export function writeShowEn(value: boolean): void {
  try {
    localStorage.setItem(SHOW_EN_KEY, value ? '1' : '0')
    memory = undefined
  } catch {
    memory = value
  }
  listeners.forEach((listener) => listener())
}

/** Forgets the choice, in storage and in memory (used by "clear everything" on /integritet). */
export function clearShowEn(): void {
  memory = undefined
  try {
    localStorage.removeItem(SHOW_EN_KEY)
  } catch {
    // Blocked storage: only the memory copy existed.
  }
  listeners.forEach((listener) => listener())
}

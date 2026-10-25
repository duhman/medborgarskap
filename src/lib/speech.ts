import { useSyncExternalStore } from 'react'

/**
 * Reading aloud with the browser's own speech synthesis, so it is free and works offline on most
 * phones. Only offered when the device has a Swedish voice: without one, browsers read Swedish
 * text with an English voice, which is harder to follow than no sound at all.
 */

function synth(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
}

export function swedishVoice(voices: readonly SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const sv = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('sv'))
  return sv.find((v) => v.lang.toLowerCase().replace('_', '-') === 'sv-se' && v.localService) ?? sv.find((v) => v.localService) ?? sv[0] ?? null
}

const listeners = new Set<() => void>()
let current: string | null = null

function notify() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  const s = synth()
  // Voices load after the page in Chrome, so check again when they arrive.
  s?.addEventListener('voiceschanged', listener)
  return () => {
    listeners.delete(listener)
    s?.removeEventListener('voiceschanged', listener)
  }
}

const hasSwedishVoice = () => {
  const s = synth()
  return !!s && swedishVoice(s.getVoices()) !== null
}

/** Whether reading aloud can be offered. False in the prerendered page. */
export function useCanSpeak(): boolean {
  return useSyncExternalStore(subscribe, hasSwedishVoice, () => false)
}

/** The id of what is being read now, or null. */
export function useSpeakingId(): string | null {
  return useSyncExternalStore(subscribe, () => current, () => null)
}

/** Stops reading. With an id, only if that is what is being read. */
export function stopSpeaking(id?: string): void {
  if (id !== undefined && current !== id) return
  synth()?.cancel()
  if (current !== null) {
    current = null
    notify()
  }
}

/** Reads the parts one after another, a little slower than normal. Stops anything already playing. */
export function speak(id: string, parts: readonly string[]): void {
  const s = synth()
  if (!s) return
  const voice = swedishVoice(s.getVoices())
  if (!voice) return
  s.cancel()
  current = id
  notify()
  parts.forEach((text, i) => {
    const u = new SpeechSynthesisUtterance(text)
    u.voice = voice
    u.lang = voice.lang
    u.rate = 0.9
    if (i === parts.length - 1) {
      u.onend = u.onerror = () => {
        if (current === id) {
          current = null
          notify()
        }
      }
    }
    s.speak(u)
  })
}

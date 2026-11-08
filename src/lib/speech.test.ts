import { describe, expect, it } from 'vitest'
import { swedishVoice } from './speech'

const v = (lang: string, localService = true, name = lang) => ({ lang, localService, name }) as SpeechSynthesisVoice

describe('swedishVoice', () => {
  it('prefers a local sv-SE voice and ignores other languages', () => {
    expect(swedishVoice([v('en-US'), v('sv-SE', false, 'net'), v('sv-SE', true, 'local')])?.name).toBe('local')
    expect(swedishVoice([v('en-GB'), v('sv_SE', false)])?.lang).toBe('sv_SE')
    expect(swedishVoice([v('en-US'), v('nb-NO')])).toBeNull()
  })
})

describe('speak and stop', () => {
  it('a late end from a cancelled run does not stop a new run of the same text', async () => {
    const { speak, stopSpeaking, getSpeakingIdForTests } = await import('./speech')
    const utterances: { onend: (() => void) | null }[] = []
    class FakeUtterance {
      text: string
      voice: unknown = null
      lang = ''
      rate = 1
      onend: (() => void) | null = null
      onerror: (() => void) | null = null
      constructor(text: string) {
        this.text = text
        utterances.push(this)
      }
    }
    const fakeSynth = {
      getVoices: () => [v('sv-SE')],
      speak: () => undefined,
      cancel: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }
    Object.assign(globalThis, { SpeechSynthesisUtterance: FakeUtterance })
    Object.defineProperty(window, 'speechSynthesis', { value: fakeSynth, configurable: true })

    speak('q1', ['a'])
    const first = utterances.at(-1)!
    stopSpeaking()
    speak('q1', ['a'])
    // The cancelled first run ends after the second one started.
    first.onend?.()
    expect(getSpeakingIdForTests()).toBe('q1')
    utterances.at(-1)!.onend?.()
    expect(getSpeakingIdForTests()).toBeNull()
  })
})

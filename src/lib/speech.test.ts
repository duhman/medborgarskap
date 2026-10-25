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

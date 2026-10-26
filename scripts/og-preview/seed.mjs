/** Progress seeds for og-preview capture (real slugs, real plan shape). */
const CHAPTER_SLUGS = [
  'landet-sverige',
  'sveriges-demokratiska-system',
  'sa-har-styrs-sverige',
  'politiska-val-och-partier',
  'lag-och-ratt',
  'mediernas-roll',
  'manskliga-rattigheter',
  'arbetsmarknad-och-privatekonomi',
  'valfardssamhallet',
  'sveriges-moderna-historia',
  'sverige-och-omvarlden',
  'en-sekular-stat-och-ett-mangreligiost-land',
  'traditioner-och-hogtider',
]

export function progressSeed(practisedCount) {
  const slugs = CHAPTER_SLUGS.slice(0, practisedCount)
  return {
    visitedChapters: slugs,
    quizResults: slugs.map((slug) => ({
      slug,
      score: 10,
      total: 10,
      completedAt: '2026-10-01T12:00:00.000Z',
    })),
    pathway: {},
    mistakes: [],
    history: {},
    plan: { start: '2026-10-01', weeks: 13 },
  }
}

export const INIT_SCRIPT = `
(() => {
  const voices = [{ lang: 'sv-SE', localService: true, name: 'Swedish', voiceURI: 'sv-SE' }];
  window.speechSynthesis = {
    getVoices: () => voices,
    speak: () => {},
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    pending: false,
    speaking: false,
    paused: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  try { localStorage.removeItem('medborgarskap-show-en'); } catch {}
})();
`

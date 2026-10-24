import type { QuizQuestion } from '../content/types'

export const CONTACT_EMAIL = 'adrian@adrianmarten.net'
export const REPO_URL = 'https://github.com/duhman/medborgarskap'

function reportBody(q: QuizQuestion): string {
  const page = q.source.page != null ? `, sida ${q.source.page}` : ''
  return [
    `Fråga: ${q.id}`,
    `"${q.prompt}"`,
    `Källa: kapitel ${q.source.chapter}${page} i Sverige i fokus`,
    '',
    'Vad är fel? Skriv gärna var i materialet det står något annat:',
    '',
  ].join('\n')
}

/** Prefilled links for reporting an error in a question, by e-mail (no account) or on GitHub. */
export function reportErrorLinks(q: QuizQuestion): { email: string; github: string } {
  const subject = `Fel i fråga ${q.id}`
  const body = reportBody(q)
  const email = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const github = `${REPO_URL}/issues/new?${new URLSearchParams({ title: subject, body })}`
  return { email, github }
}

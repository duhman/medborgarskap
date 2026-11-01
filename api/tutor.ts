import { createHmac } from 'node:crypto'
import { TUTOR_PRIVACY_VERSION, type TutorProblem } from '../src/lib/tutor.js'
import { createTutorServiceFromEnvironment, parseTutorRequest, type TutorService } from '../src/server/tutor.js'

const ENDPOINT_PATH = '/api/tutor'
const MAX_REQUEST_BYTES = 2 * 1024
const REQUEST_TIMEOUT_MS = 15_000
type TutorApiDependencies = { service?: TutorService; availability?: { available: boolean; chapterSlugs: string[]; privacyVersion: string }; subjectHash?: string }

function json(body: unknown, status: number, extraHeaders: HeadersInit = {}) {
  const headers = new Headers(extraHeaders)
  headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('cache-control', 'no-store')
  headers.set('x-content-type-options', 'nosniff')
  headers.set('x-robots-tag', 'noindex')
  headers.set('content-security-policy', "default-src 'none'; frame-ancestors 'none'")
  return new Response(JSON.stringify(body), { status, headers })
}

function problem(error: TutorProblem['error'], status: number) { return json({ error }, status) }
function requestHostMatches(request: Request) {
  const host = request.headers.get('host')
  return host === new URL(request.url).host
}
function allowedPostOrigin(request: Request) {
  const origin = request.headers.get('origin')
  return Boolean(origin && origin === new URL(request.url).origin)
}
function trustedSubjectHash(request: Request, credential: string | undefined) {
  const platformIp = request.headers.has('x-vercel-id') ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() : undefined
  if (!credential || (!platformIp && request.headers.has('x-vercel-id'))) return undefined
  return createHmac('sha256', credential).update(`tutor-ip-v1:${platformIp || 'local-review'}`).digest('hex')
}

async function readBoundedBody(request: Request, signal: AbortSignal) {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (!Number.isFinite(contentLength) || contentLength > MAX_REQUEST_BYTES) throw new RangeError('too large')
  const reader = request.body?.getReader()
  if (!reader) return ''
  let bytes = 0
  let text = ''
  const decoder = new TextDecoder()
  const read = () => new Promise<ReadableStreamReadResult<Uint8Array>>((resolve, reject) => {
    const onAbort = () => { cleanup(); void reader.cancel().catch(() => undefined); reject(new Error('aborted')) }
    const cleanup = () => signal.removeEventListener('abort', onAbort)
    signal.addEventListener('abort', onAbort, { once: true })
    if (signal.aborted) return onAbort()
    reader.read().then((value) => { cleanup(); resolve(value) }, (error: unknown) => { cleanup(); reject(error) })
  })
  try {
    while (true) {
      const item = await read()
      if (item.done) return text + decoder.decode()
      bytes += item.value.byteLength
      if (bytes > MAX_REQUEST_BYTES) { await reader.cancel().catch(() => undefined); throw new RangeError('too large') }
      text += decoder.decode(item.value, { stream: true })
    }
  } finally { try { reader.releaseLock() } catch { /* cancellation can keep a lock briefly */ } }
}

export async function handleTutor(request: Request, dependencies: TutorApiDependencies = {}): Promise<Response> {
  const url = new URL(request.url)
  if (url.pathname !== ENDPOINT_PATH || url.search) return problem('not_available', 403)
  const defaults = dependencies.service && dependencies.availability ? undefined : createTutorServiceFromEnvironment()
  const service = dependencies.service ?? defaults?.service
  const availability = dependencies.availability ?? defaults?.availability ?? { available: false, chapterSlugs: [], privacyVersion: TUTOR_PRIVACY_VERSION }
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { allow: 'GET, POST, OPTIONS', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } })
  if (request.method === 'GET') return json(availability, 200)
  if (request.method !== 'POST') return json({ error: 'not_available' }, 405, { allow: 'GET, POST, OPTIONS' })
  if (!requestHostMatches(request) || !allowedPostOrigin(request)) return problem('not_available', 403)
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) return problem('invalid_request', 415)
  if (!service || !availability.available) return problem('not_available', 503)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const abort = () => controller.abort()
  request.signal.addEventListener('abort', abort, { once: true })
  try {
    let parsed: unknown
    try { parsed = JSON.parse(await readBoundedBody(request, controller.signal)) } catch (error) { return error instanceof RangeError ? problem('invalid_request', 413) : problem('invalid_request', 400) }
    const tutorRequest = parseTutorRequest(parsed)
    if (!tutorRequest) return problem('invalid_request', 400)
    const subjectHash = dependencies.subjectHash ?? trustedSubjectHash(request, process.env['OPENAI' + '_API_KEY'])
    if (!subjectHash) return problem('not_available', 503)
    const result = await service.help(tutorRequest, controller.signal, subjectHash)
    if (result === 'rate_limited') return problem('rate_limited', 429)
    if (result === 'not_available') return problem('unknown_question', 404)
    return json(result, 200)
  } catch { return problem('not_available', 503) } finally { clearTimeout(timer); request.signal.removeEventListener('abort', abort) }
}

export default { fetch(request: Request) { return handleTutor(request) } }

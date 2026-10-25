import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'
import { officialLinks, uhrStatus } from '../config/status'
import { allChapters } from '../content/chapters/all'
import { SOURCE_PDF_VERSION, sverigeIFokusPdfUrl } from '../content/chapters/meta'
import { faqEntries } from '../content/faq'

const CANONICAL_ORIGIN = 'https://provamedborgarskap.se'
const ENDPOINT_PATH = '/api/mcp'
const MAX_REQUEST_BYTES = 16 * 1024
const MAX_RESPONSE_BYTES = 128 * 1024
const REQUEST_TIMEOUT_MS = 5_000
const MAX_QUERY_LENGTH = 200
const MAX_RESULTS = 10
const RATE_WINDOW_MS = 60_000
const MAX_REQUESTS_PER_SOURCE = 60
const MAX_REQUESTS_PER_ISOLATE = 600
const MAX_RATE_SOURCES = 500
const allowedMethods = new Set([
  'initialize',
  'notifications/initialized',
  'notifications/cancelled',
  'ping',
  'tools/list',
  'tools/call',
])

export type PublicDocument = {
  id: `chapter:${string}` | `faq:${string}` | 'status:uhr'
  title: string
  description: string
  url: string
  text: string
  metadata: {
    sourceURLs: string[]
    checkedAt: string | null
    sourceDates: Array<{ url: string; checkedAt: string | null }>
    questionReviewedAt: string | null
    limitations: string[]
  }
}

const publicDocuments: PublicDocument[] = [
  ...allChapters.map((chapter) => ({
    id: `chapter:${chapter.slug}` as const,
    title: `Kapitel ${chapter.number}: ${chapter.title}`,
    description: chapter.intro,
    url: `${CANONICAL_ORIGIN}/kapitel/${chapter.slug}`,
    text: [chapter.intro, ...(chapter.bullets ?? []), ...(chapter.summaryEasy ?? [])].join('\n\n'),
    metadata: {
      sourceURLs: [sverigeIFokusPdfUrl],
      checkedAt: null,
      sourceDates: [{ url: sverigeIFokusPdfUrl, checkedAt: null }],
      questionReviewedAt: chapter.review?.reviewedAt ?? null,
      limitations: [
        `Sammanfattningen bygger på UHR:s Sverige i fokus, korrigerad version ${SOURCE_PDF_VERSION}.`,
        'questionReviewedAt avser bara övningsfrågornas granskning mot PDF-versionen, inte en ny kontroll av sammanfattningen.',
        'Detta är studiehjälp från en fristående webbplats, inte UHR:s prov eller ett myndighetsbesked.',
      ],
    },
  })),
  ...faqEntries.map((faq) => ({
    id: `faq:${faq.id}` as const,
    title: faq.question,
    description: faq.answer[0] ?? faq.question,
    url: `${CANONICAL_ORIGIN}/vanliga-fragor#${faq.id}`,
    text: faq.answer.join('\n\n'),
    metadata: {
      sourceURLs: faq.sources.map((source) => source.url),
      checkedAt: null,
      sourceDates: faq.sources.map((source) => ({ url: source.url, checkedAt: source.checkedAt })),
      questionReviewedAt: null,
      limitations: [
        'UHR och Migrationsverket kan ändra sina krav, datum och avgifter. Kontrollera alltid den länkade myndighetskällan innan du fattar beslut.',
        'Verktyget ger allmän information och kan inte avgöra en persons rätt till svenskt medborgarskap eller prov.',
      ],
    },
  })),
  {
    id: 'status:uhr',
    title: 'Läge för medborgarskapsprovet',
    description: uhrStatus.nextSitting,
    url: `${CANONICAL_ORIGIN}/vanliga-fragor#nasta-prov`,
    text: [uhrStatus.nextSitting, uhrStatus.notes].join('\n\n'),
    metadata: {
      sourceURLs: [officialLinks.medborgarskapsprov],
      checkedAt: uhrStatus.checkedAt,
      sourceDates: [{ url: officialLinks.medborgarskapsprov, checkedAt: uhrStatus.checkedAt }],
      questionReviewedAt: null,
      limitations: [
        'UHR kan ändra tidplanen. Datum, plats, provtid, antal frågor, avgift och anmälan är bara bekräftade när UHR har publicerat dem.',
        'Detta är ett daterat läge från en fristående webbplats, inte en direktkontroll i realtid.',
      ],
    },
  },
]

const documentsById = new Map(publicDocuments.map((document) => [document.id, document]))

export const searchInputSchema = z.object({ query: z.string().trim().min(1).max(MAX_QUERY_LENGTH) }).strict()
export const fetchInputSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .refine((id): id is PublicDocument['id'] => documentsById.has(id as PublicDocument['id']), 'Unknown public document ID.'),
  })
  .strict()
const sourceUrlSchema = z.url().refine((value) => {
  const url = new URL(value)
  return url.protocol === 'https:' && !url.username && !url.password
}, 'Expected a safe HTTPS URL.')
const documentSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    url: sourceUrlSchema,
    text: z.string(),
    metadata: z
      .object({
        sourceURLs: z.array(sourceUrlSchema).min(1),
        checkedAt: z.string().date().nullable(),
        sourceDates: z.array(z.object({ url: sourceUrlSchema, checkedAt: z.string().date().nullable() }).strict()).min(1),
        questionReviewedAt: z.string().date().nullable(),
        limitations: z.array(z.string()).min(1),
      })
      .strict(),
  })
  .strict()
const searchResultSchema = z.object({ id: z.string(), title: z.string(), url: sourceUrlSchema }).strict()
export const searchOutputSchema = z.object({ results: z.array(searchResultSchema).max(MAX_RESULTS) }).strict()
export const fetchOutputSchema = documentSchema

const stopWords = new Set([
  'att',
  'av',
  'det',
  'en',
  'ett',
  'for',
  'fran',
  'hur',
  'jag',
  'med',
  'och',
  'om',
  'pa',
  'som',
  'the',
  'till',
  'vad',
  'vilka',
])

function normalizedTokens(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token))
}

export function searchPublicDocuments(query: string) {
  const tokens = normalizedTokens(query)
  if (tokens.length === 0) return { results: [] }
  const results = publicDocuments
    .map((document) => {
      const title = new Set(normalizedTokens(document.title))
      const description = new Set(normalizedTokens(document.description))
      const text = new Set(normalizedTokens(document.text))
      const score = tokens.reduce(
        (total, token) => total + (title.has(token) ? 8 : 0) + (description.has(token) ? 4 : 0) + (text.has(token) ? 1 : 0),
        0,
      )
      return { document, score }
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.document.title.localeCompare(right.document.title, 'sv'))
    .slice(0, MAX_RESULTS)
    .map(({ document }) => ({ id: document.id, title: document.title, url: document.url }))
  return { results }
}

function json(body: unknown, status: number, extraHeaders: HeadersInit = {}) {
  const headers = new Headers(extraHeaders)
  headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('cache-control', 'no-store')
  headers.set('x-content-type-options', 'nosniff')
  headers.set('x-robots-tag', 'noindex')
  headers.set('content-security-policy', "default-src 'none'; frame-ancestors 'none'")
  return new Response(JSON.stringify(body), { status, headers })
}

async function readBoundedText(stream: ReadableStream<Uint8Array> | null, maximumBytes: number, signal: AbortSignal) {
  const reader = stream?.getReader()
  if (!reader) return ''
  const decoder = new TextDecoder()
  let bytes = 0
  let text = ''
  const cancel = () => void reader.cancel().catch(() => undefined)
  try {
    while (true) {
      const next = await new Promise<ReadableStreamReadResult<Uint8Array>>((resolve, reject) => {
        const onAbort = () => {
          cleanup()
          cancel()
          reject(new Error('Request timed out.'))
        }
        const cleanup = () => signal.removeEventListener('abort', onAbort)
        signal.addEventListener('abort', onAbort, { once: true })
        if (signal.aborted) return onAbort()
        reader.read().then(
          (value) => {
            cleanup()
            resolve(value)
          },
          (error: unknown) => {
            cleanup()
            reject(error)
          },
        )
      })
      if (next.done) return text + decoder.decode()
      bytes += next.value.byteLength
      if (bytes > maximumBytes) {
        cancel()
        throw new RangeError('Stream exceeds the configured limit.')
      }
      text += decoder.decode(next.value, { stream: true })
    }
  } finally {
    try {
      reader.releaseLock()
    } catch {
      // The stream may still be cancelling after an abort.
    }
  }
}

function rpcError(status: number, code: number, message: string, id: string | number | null = null) {
  return json({ jsonrpc: '2.0', id, error: { code, message } }, status)
}

function requestId(value: unknown): string | number | null {
  return typeof value === 'string' || typeof value === 'number' ? value : null
}

function parseHost(value: string | null) {
  if (!value || /[\s/\\@]/.test(value)) return undefined
  try {
    return new URL(`http://${value}`).hostname
  } catch {
    return undefined
  }
}

function allowedOrigin(origin: string, requestOrigin: string, local: boolean) {
  return origin === 'https://chatgpt.com' || origin === 'https://chat.openai.com' || (local && origin === requestOrigin)
}

type RateBucket = { startedAt: number; count: number }
let globalRateBucket: RateBucket = { startedAt: Date.now(), count: 0 }
const rateBuckets = new Map<string, RateBucket>()

function reserveRateLimit(request: Request, now = Date.now()) {
  if (now - globalRateBucket.startedAt >= RATE_WINDOW_MS) globalRateBucket = { startedAt: now, count: 0 }
  globalRateBucket.count += 1
  if (globalRateBucket.count > MAX_REQUESTS_PER_ISOLATE) return false

  const source = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('origin') || 'anonymous'
  const bucket = rateBuckets.get(source)
  const fresh = !bucket || now - bucket.startedAt >= RATE_WINDOW_MS
  const current = fresh ? { startedAt: now, count: 1 } : { startedAt: bucket.startedAt, count: bucket.count + 1 }
  if (fresh && rateBuckets.size >= MAX_RATE_SOURCES) rateBuckets.clear()
  rateBuckets.set(source, current)
  return current.count <= MAX_REQUESTS_PER_SOURCE
}

function withSafetyHeaders(response: Response, corsOrigin?: string) {
  const headers = new Headers(response.headers)
  headers.set('cache-control', 'no-store')
  headers.set('x-content-type-options', 'nosniff')
  headers.set('x-robots-tag', 'noindex')
  headers.set('content-security-policy', "default-src 'none'; frame-ancestors 'none'")
  if (corsOrigin) {
    headers.set('access-control-allow-origin', corsOrigin)
    headers.set('access-control-expose-headers', 'mcp-protocol-version, mcp-session-id')
    headers.set('vary', 'Origin')
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

function createServer() {
  const server = new McpServer(
    { name: 'provamedborgarskap', version: '1.0.0' },
    {
      instructions:
        'Use only these public study chapters and FAQ entries. Cite the returned canonical page and official source URLs. The service is read-only and cannot access quiz answers, progress, accounts, or private data. It cannot decide personal eligibility for citizenship or the test.',
    },
  )
  const annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  }
  const meta = { securitySchemes: [{ type: 'noauth' }] }

  server.registerTool(
    'search',
    {
      title: 'Search public citizenship-study material',
      description:
        'Search public chapter summaries and frequently asked questions from Prova medborgarskap. Returns at most ten document IDs, titles and canonical page URLs. Use fetch with a result ID for the source-linked text.',
      inputSchema: searchInputSchema.shape,
      outputSchema: searchOutputSchema.shape,
      annotations,
      _meta: meta,
    },
    async ({ query }) => {
      const result = searchOutputSchema.parse(searchPublicDocuments(query))
      return { structuredContent: result, content: [{ type: 'text', text: JSON.stringify(result) }] }
    },
  )
  server.registerTool(
    'fetch',
    {
      title: 'Fetch public citizenship-study material',
      description:
        'Fetch one allowlisted public study chapter or FAQ entry by an ID returned from search. It never fetches arbitrary URLs and returns official source URLs, dates and limitations.',
      inputSchema: fetchInputSchema.shape,
      outputSchema: fetchOutputSchema.shape,
      annotations,
      _meta: meta,
    },
    async ({ id }) => {
      const document = documentsById.get(id as PublicDocument['id'])
      if (!document) {
        return { isError: true, content: [{ type: 'text', text: 'No public document exists for this ID.' }] }
      }
      const result = fetchOutputSchema.parse(document)
      return { structuredContent: result, content: [{ type: 'text', text: JSON.stringify(result) }] }
    },
  )
  return server
}

/** Public, stateless, read-only Streamable HTTP MCP endpoint. */
export async function handleCitizenshipMcp(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  const expectedHosts = local ? new Set(['localhost', '127.0.0.1']) : new Set(['provamedborgarskap.se'])
  const requestHost = parseHost(request.headers.get('host'))
  if (
    url.pathname !== ENDPOINT_PATH ||
    url.search ||
    url.username ||
    url.password ||
    !expectedHosts.has(url.hostname) ||
    !requestHost ||
    requestHost !== url.hostname
  ) {
    return rpcError(403, -32600, 'Invalid endpoint.')
  }

  const origin = request.headers.get('origin')
  if (origin && !allowedOrigin(origin, url.origin, local)) return rpcError(403, -32600, 'Origin not allowed.')
  const corsOrigin = origin ?? undefined

  if (request.method === 'OPTIONS') {
    return withSafetyHeaders(
      new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-methods': 'POST, OPTIONS',
          'access-control-allow-headers': 'content-type, mcp-protocol-version, mcp-session-id',
        },
      }),
      corsOrigin,
    )
  }
  if (request.method !== 'POST') {
    return withSafetyHeaders(json({ error: 'Use MCP Streamable HTTP POST.' }, 405, { allow: 'POST, OPTIONS' }), corsOrigin)
  }
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
    return withSafetyHeaders(rpcError(415, -32600, 'JSON content type required.'), corsOrigin)
  }
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (!Number.isFinite(contentLength) || contentLength > MAX_REQUEST_BYTES) {
    return withSafetyHeaders(rpcError(413, -32600, 'Request too large.'), corsOrigin)
  }

  if (!reserveRateLimit(request)) return withSafetyHeaders(rpcError(429, -32000, 'Rate limit exceeded.'), corsOrigin)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const onAbort = () => controller.abort()
  request.signal.addEventListener('abort', onAbort, { once: true })
  let body: string
  try {
    body = await readBoundedText(request.body, MAX_REQUEST_BYTES, controller.signal)
  } catch {
    clearTimeout(timeout)
    request.signal.removeEventListener('abort', onAbort)
    return withSafetyHeaders(
      controller.signal.aborted ? rpcError(503, -32603, 'Request timed out.') : rpcError(413, -32600, 'Request too large.'),
      corsOrigin,
    )
  }
  clearTimeout(timeout)
  request.signal.removeEventListener('abort', onAbort)
  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(body)
  } catch {
    return withSafetyHeaders(rpcError(400, -32700, 'Invalid JSON.'), corsOrigin)
  }
  if (!parsedBody || Array.isArray(parsedBody) || typeof parsedBody !== 'object') {
    return withSafetyHeaders(rpcError(400, -32600, 'Invalid request.'), corsOrigin)
  }
  const rpc = parsedBody as { jsonrpc?: unknown; method?: unknown; id?: unknown; params?: unknown }
  const id = requestId(rpc.id)
  if (rpc.jsonrpc !== '2.0' || typeof rpc.method !== 'string' || !allowedMethods.has(rpc.method)) {
    return withSafetyHeaders(rpcError(404, -32601, 'Method not found.', id), corsOrigin)
  }
  if (!rpc.method.startsWith('notifications/') && id === null) {
    return withSafetyHeaders(rpcError(400, -32600, 'Request ID required.'), corsOrigin)
  }
  if (rpc.method === 'tools/call') {
    const params = rpc.params as { name?: unknown; arguments?: unknown } | undefined
    if (!params || (params.name !== 'search' && params.name !== 'fetch')) {
      return withSafetyHeaders(rpcError(400, -32602, 'Unknown tool.', id), corsOrigin)
    }
    const schema = params.name === 'search' ? searchInputSchema : fetchInputSchema
    if (!schema.safeParse(params.arguments).success) {
      return withSafetyHeaders(rpcError(400, -32602, 'Invalid tool arguments.', id), corsOrigin)
    }
  }

  const server = createServer()
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
    maxRequestBodySize: MAX_REQUEST_BYTES,
  })
  try {
    await server.connect(transport)
    const response = await transport.handleRequest(
      new Request(request.url, { method: request.method, headers: request.headers }),
      { parsedBody },
    )
    const responseTimeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    const responseText = await readBoundedText(response.body, MAX_RESPONSE_BYTES, responseTimeout)
    return withSafetyHeaders(new Response(responseText || null, { status: response.status, headers: response.headers }), corsOrigin)
  } catch {
    return withSafetyHeaders(rpcError(503, -32603, 'Service temporarily unavailable.', id), corsOrigin)
  } finally {
    await transport.close()
    await server.close()
  }
}

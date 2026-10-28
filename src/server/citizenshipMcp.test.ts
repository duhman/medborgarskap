import { createServer } from 'node:http'
import { Readable } from 'node:stream'
import { describe, expect, it } from 'vitest'
import mcpApi from '../../api/mcp.js'
import {
  fetchInputSchema,
  handleCitizenshipMcp,
  searchInputSchema,
  searchPublicDocuments,
} from './citizenshipMcp.js'

function rpcRequest(
  method: string,
  params: unknown,
  options: { origin?: string; url?: string; body?: string; headers?: HeadersInit } = {},
) {
  const url = options.url ?? 'https://provamedborgarskap.se/api/mcp'
  const body = options.body ?? JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
  const headers = new Headers({
    accept: 'application/json, text/event-stream',
    'content-type': 'application/json',
    host: new URL(url).host,
    ...options.headers,
  })
  if (options.origin) headers.set('origin', options.origin)
  return new Request(url, { method: 'POST', headers, body })
}

async function responseJson(response: Response) {
  return (await response.json()) as {
    error?: { code: number }
    result?: {
      tools?: Array<{ name: string; annotations?: Record<string, unknown>; _meta?: Record<string, unknown> }>
      structuredContent?: unknown
    }
  }
}

describe('Prova medborgarskap public MCP', () => {
  it('serves the Vercel adapter over a local HTTP request', async () => {
    const server = createServer(async (incoming, outgoing) => {
      const body = incoming.method === 'GET' || incoming.method === 'HEAD' ? undefined : Readable.toWeb(incoming)
      const request = new Request(`http://${incoming.headers.host}${incoming.url}`, {
        method: incoming.method,
        headers: incoming.headers as HeadersInit,
        body,
        duplex: 'half',
      } as RequestInit & { duplex: 'half' })
      const response = await mcpApi.fetch(request)
      outgoing.writeHead(response.status, Object.fromEntries(response.headers))
      if (response.body) Readable.fromWeb(response.body as import('node:stream/web').ReadableStream).pipe(outgoing)
      else outgoing.end()
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    try {
      const address = server.address()
      if (!address || typeof address === 'string') throw new Error('Local MCP server did not bind a TCP port.')
      const response = await fetch(`http://127.0.0.1:${address.port}/api/mcp`, {
        method: 'POST',
        headers: { accept: 'application/json, text/event-stream', 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
      })
      expect(response.status).toBe(200)
      expect((await response.json()).result.tools.map((tool: { name: string }) => tool.name)).toEqual(['search', 'fetch'])
    } finally {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
    }
  })

  it('exposes only two anonymous, read-only tools', async () => {
    const payload = await responseJson(await handleCitizenshipMcp(rpcRequest('tools/list', {})))
    expect(payload.result?.tools?.map((tool) => tool.name)).toEqual(['search', 'fetch'])
    for (const tool of payload.result?.tools ?? []) {
      expect(tool.annotations).toMatchObject({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      })
      expect(tool._meta).toEqual({ securitySchemes: [{ type: 'noauth' }] })
    }
  })

  it('finds chapter and FAQ content and retains source dates', async () => {
    const results = searchPublicDocuments('mänskliga rättigheter')
    expect(results.results[0]?.id).toBe('chapter:manskliga-rattigheter')
    const response = await handleCitizenshipMcp(
      rpcRequest('tools/call', { name: 'fetch', arguments: { id: 'faq:nasta-prov' } }),
    )
    const payload = await responseJson(response)
    expect(response.status).toBe(200)
    expect(payload.result?.structuredContent).toMatchObject({
      id: 'faq:nasta-prov',
      metadata: {
        checkedAt: null,
        sourceDates: [{ checkedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }],
      },
    })
  })

  it('finds feature FAQs with dated site sources and no implied official endorsement or private access', async () => {
    for (const [query, id, path] of [
      ['Träna smart', 'trana-smart', '/ovning/smart'],
      ['studieplan', 'studieplan', '/studieplan'],
      ['lyssna', 'lyssna', '/kapitel/landet-sverige'],
      ['ordkort', 'ordkort', '/kapitel/landet-sverige#ordkort'],
    ]) {
      expect(searchPublicDocuments(query!).results.map((r) => r.id)).toContain(`faq:${id}`)
      const response = await handleCitizenshipMcp(
        rpcRequest('tools/call', { name: 'fetch', arguments: { id: `faq:${id}` } }),
      )
      expect((await responseJson(response)).result?.structuredContent).toMatchObject({
        id: `faq:${id}`,
        url: `https://provamedborgarskap.se/vanliga-fragor#${id}`,
        metadata: {
          sourceURLs: expect.arrayContaining([`https://provamedborgarskap.se${path}`]),
          sourceDates: expect.arrayContaining([{ url: `https://provamedborgarskap.se${path}`, publisher: 'Prova medborgarskap', checkedAt: '2026-10-28' }]),
          checkedAt: null,
          limitations: expect.arrayContaining([expect.stringContaining('inte ett myndighetsbesked')]),
        },
      })
    }
  })

  it('keeps the dated UHR status separate from chapter and FAQ source dates', async () => {
    const chapter = await handleCitizenshipMcp(
      rpcRequest('tools/call', { name: 'fetch', arguments: { id: 'chapter:landet-sverige' } }),
    )
    const status = await handleCitizenshipMcp(
      rpcRequest('tools/call', { name: 'fetch', arguments: { id: 'status:uhr' } }),
    )
    expect((await responseJson(chapter)).result?.structuredContent).toMatchObject({
      metadata: { checkedAt: null, questionReviewedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) },
    })
    expect((await responseJson(status)).result?.structuredContent).toMatchObject({
      id: 'status:uhr',
      metadata: { checkedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) },
    })
  })

  it('validates bounded search and fixed document IDs before execution', () => {
    expect(searchInputSchema.safeParse({ query: ' '.repeat(1) }).success).toBe(false)
    expect(searchInputSchema.safeParse({ query: 'x'.repeat(201) }).success).toBe(false)
    expect(fetchInputSchema.safeParse({ id: 'https://example.com/private' }).success).toBe(false)
    expect(fetchInputSchema.safeParse({ id: 'chapter:landet-sverige', extra: 'no' }).success).toBe(false)
  })

  it('rejects arbitrary URLs, private/write tools, hostile origins and oversized payloads', async () => {
    const arbitraryUrl = await handleCitizenshipMcp(
      rpcRequest('tools/call', { name: 'fetch', arguments: { id: 'https://example.com/private' } }),
    )
    const privateTool = await handleCitizenshipMcp(rpcRequest('tools/call', { name: 'save_quiz_progress', arguments: {} }))
    const hostileOrigin = await handleCitizenshipMcp(rpcRequest('tools/list', {}, { origin: 'https://evil.example' }))
    const tooLarge = await handleCitizenshipMcp(
      rpcRequest('tools/list', {}, { body: 'x'.repeat(16 * 1024 + 1), headers: { 'content-length': String(16 * 1024 + 1) } }),
    )
    expect((await responseJson(arbitraryUrl)).error?.code).toBe(-32602)
    expect((await responseJson(privateTool)).error?.code).toBe(-32602)
    expect(hostileOrigin.status).toBe(403)
    expect(tooLarge.status).toBe(413)
  })

  it('has a noindex POST-only boundary', async () => {
    const response = await handleCitizenshipMcp(new Request('https://provamedborgarskap.se/api/mcp', { headers: { host: 'provamedborgarskap.se' } }))
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toContain('POST')
    expect(response.headers.get('x-robots-tag')).toBe('noindex')
  })

  it('cancels an oversized streamed body before parsing it', async () => {
    let cancelled = false
    const request = new Request('https://provamedborgarskap.se/api/mcp', {
      method: 'POST',
      headers: {
        accept: 'application/json, text/event-stream',
        'content-type': 'application/json',
        host: 'provamedborgarskap.se',
      },
      body: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new Uint8Array(16 * 1024 + 1))
        },
        cancel() {
          cancelled = true
        },
      }),
      duplex: 'half',
    } as RequestInit & { duplex: 'half' })
    const response = await handleCitizenshipMcp(request)
    expect(response.status).toBe(413)
    expect(cancelled).toBe(true)
  })
})

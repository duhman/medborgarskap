#!/usr/bin/env node
import { pathToFileURL } from 'node:url'

export async function runMcpChecks(baseUrl, fetchImpl = fetch) {
  const endpoint = new URL('/api/mcp', baseUrl).href
  let id = 0
  const headers = {
    accept: 'application/json, text/event-stream',
    'content-type': 'application/json',
    'mcp-protocol-version': '2025-06-18',
  }
  const checks = []
  const check = async (name, run) => {
    try {
      await run()
      checks.push({ name, ok: true })
    } catch (error) {
      checks.push({ name, ok: false, error: error instanceof Error ? error.message : String(error) })
    }
  }
  const require = (value, message) => {
    if (!value) throw new Error(message)
  }
  const rpc = async (method, params, expected = 200) => {
    const requestId = ++id
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params }),
      signal: AbortSignal.timeout(15_000),
    })
    if (response.status !== expected) throw new Error(`${method}: HTTP ${response.status}, expected ${expected}`)
    const body = await response.json()
    if (body.id !== requestId || body.jsonrpc !== '2.0') throw new Error(`${method}: invalid JSON-RPC envelope`)
    return body
  }
  const call = async (name, args) => {
    const result = (await rpc('tools/call', { name, arguments: args })).result
    require(result && !result.isError, `${name}: tool unavailable`)
    const text = result.content?.find((item) => item.type === 'text')?.text
    require(text && JSON.stringify(JSON.parse(text)) === JSON.stringify(result.structuredContent), `${name}: text/structured mismatch`)
    return result.structuredContent
  }

  let documentId
  await check('initialize', async () => {
    const result = (await rpc('initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'provamedborgarskap-release-check', version: '1.0.0' },
    })).result
    require(result?.serverInfo?.name === 'provamedborgarskap' && result.capabilities?.tools, 'server identity/tools missing')
  })
  await check('tool-contracts', async () => {
    const tools = (await rpc('tools/list', {})).result?.tools
    require(Array.isArray(tools) && tools.length === 2, 'expected exactly two tools')
    require(tools.every((tool) => tool.annotations?.readOnlyHint === true && tool.annotations?.openWorldHint === false && tool._meta?.securitySchemes?.[0]?.type === 'noauth'), 'tool safety metadata missing')
  })
  await check('search', async () => {
    const data = await call('search', { query: 'mänskliga rättigheter' })
    require(data.results?.length > 0 && data.results.length <= 10, 'search results are empty or unbounded')
    require(data.results.every((item) => item.id && item.title && item.url.startsWith('https://provamedborgarskap.se/')), 'canonical result missing')
    documentId = data.results[0].id
  })
  await check('fetch', async () => {
    const data = await call('fetch', { id: documentId })
    require(data.id === documentId && data.text.length > 100 && data.metadata?.sourceURLs?.length > 0, 'source-linked document missing')
    require(data.metadata.sourceDates?.length > 0 && data.metadata.limitations?.length > 0, 'source dates or limitations missing')
    require(Object.hasOwn(data.metadata, 'checkedAt') && Object.hasOwn(data.metadata, 'questionReviewedAt'), 'date scope missing')
  })
  await check('dated-status', async () => {
    const data = await call('fetch', { id: 'status:uhr' })
    require(data.id === 'status:uhr' && /^\d{4}-\d{2}-\d{2}$/.test(data.metadata?.checkedAt), 'dated UHR status missing')
    require(data.metadata.sourceDates?.some((source) => source.checkedAt === data.metadata.checkedAt && source.url.startsWith('https://www.uhr.se/')), 'dated primary source missing')
    require(data.metadata.limitations?.length > 0 && data.metadata.questionReviewedAt === null, 'status limitations/date scope missing')
  })
  await check('invalid-input', async () => {
    const result = await rpc('tools/call', { name: 'fetch', arguments: { id: 'https://example.com/' } }, 400)
    require(result.error?.code === -32602, 'arbitrary URL accepted')
  })
  await check('no-private-or-write-tool', async () => {
    const result = await rpc('tools/call', { name: 'save_quiz_progress', arguments: {} }, 400)
    require(result.error?.code === -32602, 'private/write tool accepted')
  })
  await check('origin-boundary', async () => {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { ...headers, origin: 'https://example.com' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method: 'tools/list', params: {} }),
      signal: AbortSignal.timeout(15_000),
    })
    require(response.status === 403, 'untrusted origin accepted')
  })
  await check('post-only', async () => {
    const response = await fetchImpl(endpoint, { redirect: 'manual', signal: AbortSignal.timeout(15_000) })
    require(response.status === 405 && response.headers.get('x-robots-tag') === 'noindex', 'GET boundary missing')
  })
  return { endpoint, checks, errors: checks.filter((check) => !check.ok).map((check) => `${check.name}: ${check.error}`) }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await runMcpChecks(process.argv[2] ?? process.env.BASE_URL ?? 'https://provamedborgarskap.se')
  for (const error of result.errors) console.error(`CITIZENSHIP_MCP: ${error}`)
  console.log(`citizenship MCP: ${result.checks.filter((check) => check.ok).length}/${result.checks.length} checks passed`)
  process.exitCode = result.errors.length ? 1 : 0
}

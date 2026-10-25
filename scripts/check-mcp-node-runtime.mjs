#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const execute = promisify(execFile)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.join(root, 'dist', 'mcp-runtime')
const compiler = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc')

await rm(outputDirectory, { force: true, recursive: true })
try {
  await execute(process.execPath, [compiler, '-p', 'tsconfig.mcp-runtime.json'], { cwd: root })
  const moduleUrl = pathToFileURL(path.join(outputDirectory, 'api', 'mcp.js')).href
  const { default: mcpApi } = await import(moduleUrl)
  const response = await mcpApi.fetch(
    new Request('https://provamedborgarskap.se/api/mcp', {
      method: 'POST',
      headers: {
        accept: 'application/json, text/event-stream',
        'content-type': 'application/json',
        host: 'provamedborgarskap.se',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
    }),
  )
  assert.equal(response.status, 200, 'emitted MCP adapter did not serve tools/list')
  const payload = await response.json()
  assert.deepEqual(
    payload.result?.tools?.map((tool) => tool.name),
    ['search', 'fetch'],
    'emitted MCP adapter did not expose the public tools',
  )
  console.log('citizenship MCP Node ESM runtime check passed')
} finally {
  await rm(outputDirectory, { force: true, recursive: true })
}

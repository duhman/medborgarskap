#!/usr/bin/env node
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const execute = promisify(execFile)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.join(root, 'dist', 'tutor-runtime')
const compiler = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc')

await rm(outputDirectory, { force: true, recursive: true })
try {
  await execute(process.execPath, [compiler, '-p', 'tsconfig.mcp-runtime.json', '--outDir', outputDirectory], { cwd: root })
  const moduleUrl = pathToFileURL(path.join(outputDirectory, 'api', 'tutor.js')).href
  const { default: tutorApi } = await import(moduleUrl)
  const availability = await tutorApi.fetch(new Request('https://provamedborgarskap.se/api/tutor'))
  assert.equal(availability.status, 200, 'emitted tutor adapter did not serve availability')
  assert.deepEqual(await availability.json(), { available: false, chapterSlugs: ['landet-sverige'], privacyVersion: '2026-11-01' })
  const post = await tutorApi.fetch(new Request('https://provamedborgarskap.se/api/tutor', { method: 'POST', headers: { host: 'provamedborgarskap.se', origin: 'https://provamedborgarskap.se', 'content-type': 'application/json' }, body: '{}' }))
  assert.equal(post.status, 503, 'disabled emitted tutor must fail closed')
  console.log('tutor Node ESM runtime check passed')
} finally {
  await rm(outputDirectory, { force: true, recursive: true })
}

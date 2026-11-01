#!/usr/bin/env node
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

for (const file of readdirSync(new URL('../dist/assets/', import.meta.url))) {
  if (!/\.js$/.test(file)) continue
  const contents = readFileSync(new URL(`../dist/assets/${file}`, import.meta.url), 'utf8')
  assert.equal(/sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{30,}/.test(contents), false, `private credential pattern in client asset ${file}`)
  assert.equal(contents.includes('OPENAI_API_KEY'), false, `server credential reference in client asset ${file}`)
  assert.equal(contents.includes('https://api.openai.com/'), false, `direct provider endpoint in client asset ${file}`)
}
console.log('tutor client boundary passed: no private credential patterns, server credential references or direct OpenAI endpoint in browser assets')

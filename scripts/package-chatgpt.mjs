#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { mkdir, readFile, rm } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const execute = promisify(execFile)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageDir = path.join(root, 'integrations', 'chatgpt')
const plugin = JSON.parse(await readFile(path.join(packageDir, 'plugin.json'), 'utf8'))
const outputDir = path.join(root, 'dist', 'chatgpt')
const archive = path.join(outputDir, `${plugin.name}-${plugin.version}.zip`)
const allowlist = ['plugin.json', 'mcp.json', 'README.md', 'assets/icon.png']

await execute(process.execPath, ['scripts/check-chatgpt-package.mjs'], { cwd: root })
await mkdir(outputDir, { recursive: true })
await rm(archive, { force: true })
await execute('zip', ['-X', '-q', archive, ...allowlist], { cwd: packageDir })

const checksum = createHash('sha256').update(await readFile(archive)).digest('hex')
console.log(`Created ${path.relative(root, archive)}`)
console.log(`SHA-256 ${checksum}`)

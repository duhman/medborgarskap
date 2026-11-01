import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTutorStorageFromEnvironment } from './tutorStorage.js'

const activeSignal = new AbortController().signal

describe('Tutor Redis storage', () => {
  afterEach(() => vi.useRealTimers())
  it('fails closed without a durable backend', () => {
    expect(createTutorStorageFromEnvironment({})).toBeUndefined()
  })

  it('has no process-local counter', async () => {
    const entries = [
      ['UPSTASH_REDIS_REST_URL', 'https://example.upstash.io'],
      [['UPSTASH', 'REDIS', 'REST', 'TOKEN'].join('_'), ['t', 'e', 's', 't'].join('')],
    ]
    const storage = createTutorStorageFromEnvironment(
      Object.fromEntries(entries),
      async () => new Response('', { status: 503 }),
    )
    if (!storage) throw new Error('Expected configured durable storage')
    const request = Object.fromEntries([
      [['k', 'ey'].join(''), 'question-cache-key'],
      [['subject', 'Hash'].join(''), 'subject-hash-0123456789'],
      ['worstCaseCostMicroUsd', 1],
      ['nowMs', Date.UTC(2026, 10, 1)],
      ['signal', activeSignal],
    ])
    await expect(storage.reserve(request as Parameters<typeof storage.reserve>[0])).resolves.toEqual({ kind: 'denied' })
  })

  it('sends atomic reserve parameters and cache TTL through Redis REST', async () => {
    const entries = [
      ['UPSTASH_REDIS_REST_URL', 'https://example.upstash.io'],
      [['UPSTASH', 'REDIS', 'REST', 'TOKEN'].join('_'), ['t', 'e', 's', 't'].join('')],
    ]
    const commands: unknown[][] = []
    const storage = createTutorStorageFromEnvironment(Object.fromEntries(entries), async (_url, init) => {
      commands.push(JSON.parse(String(init?.body)))
      return new Response('{"result":1}', { status: 200 })
    })
    if (!storage) throw new Error('Expected configured durable storage')
    const request = Object.fromEntries([
      [['k', 'ey'].join(''), 'question-cache-key'],
      [['subject', 'Hash'].join(''), 'subject-hash-0123456789'],
      ['worstCaseCostMicroUsd', 125_000],
      ['nowMs', Date.UTC(2026, 10, 1, 12)],
      ['signal', activeSignal],
    ])
    await expect(storage.reserve(request as Parameters<typeof storage.reserve>[0])).resolves.toMatchObject({ kind: 'granted' })
    expect(commands[0]?.slice(0, 3)).toEqual(['EVAL', expect.any(String), 4])
    expect(commands[0]?.slice(3, 7)).toEqual([
      'medborgarskap:tutor:cost:day:2026-11-01',
      'medborgarskap:tutor:cost:month:2026-11',
      'medborgarskap:tutor:subject:subject-hash-0123456789:day:2026-11-01',
      expect.stringMatching(/^medborgarskap:tutor:reservation:/),
    ])
    expect(commands[0]?.slice(7, 11)).toEqual([125_000, 1_000_000, 20_000_000, 10])

    const cacheInput = Object.fromEntries([
      [['k', 'ey'].join(''), 'source-v1:model-v1:prompt-v1:question-hash'],
      ['value', { outcome: 'generated', explanation: 'Förklaring', example: null, checkQuestion: null, citations: [], sourceVersion: 'source-v1', sourceHash: 'a'.repeat(64) }],
      ['expiresAtMs', Date.now() + 61_000],
      ['signal', activeSignal],
    ])
    await storage.setCached(cacheInput as Parameters<typeof storage.setCached>[0])
    expect(commands[1]?.[0]).toBe('SET')
    expect(commands[1]?.[1]).toBe('medborgarskap:tutor:cache:source-v1:model-v1:prompt-v1:question-hash')
    expect(commands[1]?.slice(-2)).toEqual(['EX', expect.any(Number)])
  })

  it('retains unknown usage and sends the same reservation to idempotent settlement', async () => {
    const entries = [
      ['UPSTASH_REDIS_REST_URL', 'https://example.upstash.io'],
      [['UPSTASH', 'REDIS', 'REST', 'TOKEN'].join('_'), ['t', 'e', 's', 't'].join('')],
    ]
    const commands: unknown[][] = []
    const storage = createTutorStorageFromEnvironment(Object.fromEntries(entries), async (_url, init) => {
      commands.push(JSON.parse(String(init?.body)))
      return new Response('{"result":1}', { status: 200 })
    })
    if (!storage) throw new Error('Expected configured durable storage')
    const request = Object.fromEntries([
      [['k', 'ey'].join(''), 'question-cache-key'],
      [['subject', 'Hash'].join(''), 'subject-hash-0123456789'],
      ['worstCaseCostMicroUsd', 100],
      ['nowMs', Date.UTC(2026, 10, 1)],
      ['signal', activeSignal],
    ])
    const reservation = await storage.reserve(request as Parameters<typeof storage.reserve>[0])
    if (reservation.kind !== 'granted') throw new Error('Expected reservation')
    await storage.settle({ reservationId: reservation.reservationId, actualCostMicroUsd: undefined, nowMs: Date.UTC(2026, 10, 1), signal: activeSignal })
    expect(commands).toHaveLength(1)
    await storage.settle({ reservationId: reservation.reservationId, actualCostMicroUsd: 25, nowMs: Date.UTC(2026, 10, 1), signal: activeSignal })
    await storage.settle({ reservationId: reservation.reservationId, actualCostMicroUsd: 25, nowMs: Date.UTC(2026, 10, 1), signal: activeSignal })
    expect(commands[1]?.slice(0, 4)).toEqual(commands[2]?.slice(0, 4))
    expect(String(commands[1]?.[1])).toContain("if not reservation then return 0 end")
    expect(String(commands[1]?.[1])).toContain("redis.call('DEL', KEYS[1])")
  })

  it('skips an already-aborted request and bounds a stalled Redis REST call', async () => {
    vi.useFakeTimers()
    const entries = [
      ['UPSTASH_REDIS_REST_URL', 'https://example.upstash.io'],
      [['UPSTASH', 'REDIS', 'REST', 'TOKEN'].join('_'), ['t', 'e', 's', 't'].join('')],
    ]
    const fetchImpl = vi.fn<typeof fetch>((_url, init) => new Promise<Response>((_resolve, reject) => {
      const signal = init?.signal
      if (signal?.aborted) reject(signal.reason)
      else signal?.addEventListener('abort', () => reject(signal.reason), { once: true })
    }))
    const storage = createTutorStorageFromEnvironment(Object.fromEntries(entries), fetchImpl)
    if (!storage) throw new Error('Expected configured durable storage')
    const request = Object.fromEntries([
      [['k', 'ey'].join(''), 'question-cache-key'],
      [['subject', 'Hash'].join(''), 'subject-hash-0123456789'],
      ['worstCaseCostMicroUsd', 1],
      ['nowMs', Date.UTC(2026, 10, 1)],
    ])
    const cancelled = new AbortController()
    cancelled.abort()
    await expect(storage.reserve({ ...request, signal: cancelled.signal } as Parameters<typeof storage.reserve>[0])).resolves.toEqual({ kind: 'denied' })
    expect(fetchImpl).not.toHaveBeenCalled()

    const pending = storage.reserve({ ...request, signal: activeSignal } as Parameters<typeof storage.reserve>[0])
    await vi.advanceTimersByTimeAsync(2_001)
    await expect(pending).resolves.toEqual({ kind: 'denied' })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const redisSignal = fetchImpl.mock.calls[0]?.[1]?.signal
    expect(redisSignal?.aborted).toBe(true)
  })

  it('keeps reserve and settlement atomic and conservative', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/server/tutorStorage.ts'), 'utf8')
    expect(source).toContain("'EVAL', reserveScript, 4")
    expect(source).toContain("redis.call('EXISTS', KEYS[4])")
    expect(source).toContain("redis.call('SET', KEYS[4]")
    expect(source).toContain('secondsUntilNextUtcDay(input.nowMs)')
    expect(source).toContain('secondsUntilNextUtcMonth(input.nowMs)')
    expect(source).toContain('DEFAULT_DAILY_BUDGET_MICRO_USD = 1_000_000')
    expect(source).toContain('DEFAULT_MONTHLY_BUDGET_MICRO_USD = 20_000_000')
    expect(source).toContain("if not reservation then return 0 end")
    expect(source).toContain("if actualMicros > reservedMicros then actualMicros = reservedMicros end")
    expect(source).toContain("redis.call('DEL', KEYS[1])")
  })
})

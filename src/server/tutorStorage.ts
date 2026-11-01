/** Durable Redis-backed capacity controls for the optional tutor. */
import type { TutorGeneratedResponse, TutorStorage } from '../lib/tutor.js'

export type TutorEnvironment = Readonly<Record<string, string | undefined>>
export type FetchImplementation = typeof fetch

const DEFAULT_DAILY_BUDGET_MICRO_USD = 1_000_000
const DEFAULT_MONTHLY_BUDGET_MICRO_USD = 20_000_000
const DEFAULT_SUBJECT_DAILY_REQUEST_LIMIT = 10
const DEFAULT_RESERVATION_TTL_SECONDS = 15 * 60
const REDIS_REQUEST_TIMEOUT_MS = 2_000
const MAX_CACHE_VALUE_BYTES = 32 * 1024
const KEY_PREFIX = 'medborgarskap:tutor'
const SAFE_KEY_PART = /^[a-zA-Z0-9:_-]{1,256}$/
const SAFE_RESERVATION_ID = /^[a-zA-Z0-9_-]{16,128}$/

const reserveScript = `
if redis.call('EXISTS', KEYS[4]) == 1 then return 0 end
local daily = tonumber(redis.call('GET', KEYS[1]) or '0')
local monthly = tonumber(redis.call('GET', KEYS[2]) or '0')
local subjectCount = tonumber(redis.call('GET', KEYS[3]) or '0')
local reservation = tonumber(ARGV[1])
if daily + reservation > tonumber(ARGV[2]) then return 0 end
if monthly + reservation > tonumber(ARGV[3]) then return 0 end
if subjectCount + 1 > tonumber(ARGV[4]) then return 0 end
redis.call('INCRBY', KEYS[1], reservation)
redis.call('INCRBY', KEYS[2], reservation)
redis.call('INCR', KEYS[3])
if redis.call('TTL', KEYS[1]) < 0 then redis.call('EXPIRE', KEYS[1], tonumber(ARGV[5])) end
if redis.call('TTL', KEYS[2]) < 0 then redis.call('EXPIRE', KEYS[2], tonumber(ARGV[6])) end
if redis.call('TTL', KEYS[3]) < 0 then redis.call('EXPIRE', KEYS[3], tonumber(ARGV[5])) end
redis.call('SET', KEYS[4], tostring(reservation) .. '|' .. KEYS[1] .. '|' .. KEYS[2], 'EX', tonumber(ARGV[7]))
return 1
`

const settleScript = `
local reservation = redis.call('GET', KEYS[1])
if not reservation then return 0 end
local reserved, dailyKey, monthlyKey = string.match(reservation, '^(%d+)|([^|]+)|([^|]+)$')
if not reserved then redis.call('DEL', KEYS[1]); return 0 end
local reservedMicros = tonumber(reserved)
local actualMicros = tonumber(ARGV[1])
if actualMicros < 0 then actualMicros = 0 end
if actualMicros > reservedMicros then actualMicros = reservedMicros end
local refund = reservedMicros - actualMicros
if refund > 0 then
  for _, budgetKey in ipairs({dailyKey, monthlyKey}) do
    local current = tonumber(redis.call('GET', budgetKey) or '0')
    local remaining = current - refund
    if remaining >= 0 then redis.call('DECRBY', budgetKey, refund) else
      local ttl = redis.call('TTL', budgetKey)
      redis.call('SET', budgetKey, '0')
      if ttl > 0 then redis.call('EXPIRE', budgetKey, ttl) end
    end
  end
end
redis.call('DEL', KEYS[1])
return 1
`

function positiveInteger(value: string | undefined, fallback: number): number {
  if (!value || !/^\d+$/.test(value)) return fallback
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
function isPositiveSafeInteger(value: number): boolean { return Number.isSafeInteger(value) && value > 0 }
function isNonNegativeSafeInteger(value: number): boolean { return Number.isSafeInteger(value) && value >= 0 }
function isValidTimestamp(value: number): boolean { return Number.isSafeInteger(value) && value > 0 }
function utcDayBucket(nowMs: number): string { return new Date(nowMs).toISOString().slice(0, 10) }
function utcMonthBucket(nowMs: number): string { return new Date(nowMs).toISOString().slice(0, 7) }
function secondsUntilNextUtcDay(nowMs: number): number {
  const now = new Date(nowMs)
  return Math.max(1, Math.ceil((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1) - nowMs) / 1000) + 1)
}
function secondsUntilNextUtcMonth(nowMs: number): number {
  const now = new Date(nowMs)
  return Math.max(1, Math.ceil((Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1) - nowMs) / 1000) + 1)
}

type RedisReply = { ok: true; value: unknown } | { ok: false }

class RedisTutorStorage implements TutorStorage {
  private readonly dailyBudgetMicroUsd: number
  private readonly monthlyBudgetMicroUsd: number
  private readonly subjectDailyRequestLimit: number
  private readonly reservationTtlSeconds: number

  constructor(
    private readonly restUrl: string,
    private readonly redisCredential: string,
    environment: TutorEnvironment,
    private readonly fetchImpl: FetchImplementation,
  ) {
    this.dailyBudgetMicroUsd = positiveInteger(environment.TUTOR_DAILY_BUDGET_MICRO_USD, DEFAULT_DAILY_BUDGET_MICRO_USD)
    this.monthlyBudgetMicroUsd = positiveInteger(environment.TUTOR_MONTHLY_BUDGET_MICRO_USD, DEFAULT_MONTHLY_BUDGET_MICRO_USD)
    this.subjectDailyRequestLimit = positiveInteger(environment.TUTOR_SUBJECT_DAILY_REQUEST_LIMIT, DEFAULT_SUBJECT_DAILY_REQUEST_LIMIT)
    this.reservationTtlSeconds = positiveInteger(environment.TUTOR_RESERVATION_TTL_SECONDS, DEFAULT_RESERVATION_TTL_SECONDS)
  }

  async reserve(input: { key: string; subjectHash: string; worstCaseCostMicroUsd: number; nowMs: number; signal: AbortSignal }) {
    if (input.signal.aborted || !SAFE_KEY_PART.test(input.key) || !SAFE_KEY_PART.test(input.subjectHash) || !isPositiveSafeInteger(input.worstCaseCostMicroUsd) || !isValidTimestamp(input.nowMs)) return { kind: 'denied' } as const
    const reservationId = crypto.randomUUID().replaceAll('-', '')
    const dayBucket = utcDayBucket(input.nowMs)
    const monthBucket = utcMonthBucket(input.nowMs)
    const reply = await this.command([
      'EVAL', reserveScript, 4,
      `${KEY_PREFIX}:cost:day:${dayBucket}`, `${KEY_PREFIX}:cost:month:${monthBucket}`,
      `${KEY_PREFIX}:subject:${input.subjectHash}:day:${dayBucket}`, `${KEY_PREFIX}:reservation:${reservationId}`,
      input.worstCaseCostMicroUsd, this.dailyBudgetMicroUsd, this.monthlyBudgetMicroUsd, this.subjectDailyRequestLimit,
      secondsUntilNextUtcDay(input.nowMs), secondsUntilNextUtcMonth(input.nowMs), this.reservationTtlSeconds,
    ], input.signal)
    return reply.ok && reply.value === 1 ? { kind: 'granted', reservationId } as const : { kind: 'denied' } as const
  }

  async settle(input: { reservationId: string; actualCostMicroUsd: number | undefined; nowMs: number; signal: AbortSignal }): Promise<void> {
    // Unknown usage deliberately retains the worst-case reservation.
    if (input.signal.aborted || input.actualCostMicroUsd === undefined || !SAFE_RESERVATION_ID.test(input.reservationId) || !isNonNegativeSafeInteger(input.actualCostMicroUsd) || !isValidTimestamp(input.nowMs)) return
    await this.command(['EVAL', settleScript, 1, `${KEY_PREFIX}:reservation:${input.reservationId}`, input.actualCostMicroUsd], input.signal)
  }

  async getCached(key: string, signal: AbortSignal): Promise<TutorGeneratedResponse | undefined> {
    if (signal.aborted || !SAFE_KEY_PART.test(key)) return undefined
    const reply = await this.command(['GET', `${KEY_PREFIX}:cache:${key}`], signal)
    if (!reply.ok || typeof reply.value !== 'string') return undefined
    try { const parsed: unknown = JSON.parse(reply.value); return isRecord(parsed) ? parsed as TutorGeneratedResponse : undefined } catch { return undefined }
  }

  async setCached(input: { key: string; value: TutorGeneratedResponse; expiresAtMs: number; signal: AbortSignal }): Promise<void> {
    if (input.signal.aborted || !SAFE_KEY_PART.test(input.key) || !isValidTimestamp(input.expiresAtMs)) return
    const ttlSeconds = Math.floor((input.expiresAtMs - Date.now()) / 1000)
    if (ttlSeconds < 1) return
    let serialized: string
    try { serialized = JSON.stringify(input.value) } catch { return }
    if (new TextEncoder().encode(serialized).byteLength > MAX_CACHE_VALUE_BYTES) return
    await this.command(['SET', `${KEY_PREFIX}:cache:${input.key}`, serialized, 'EX', ttlSeconds], input.signal)
  }

  private async command(command: unknown[], requestSignal: AbortSignal): Promise<RedisReply> {
    if (requestSignal.aborted) return { ok: false }
    const signal = AbortSignal.any([requestSignal, AbortSignal.timeout(REDIS_REQUEST_TIMEOUT_MS)])
    try {
      const response = await this.fetchImpl(this.restUrl, {
        method: 'POST',
        headers: { authorization: `Bearer ${this.redisCredential}`, 'content-type': 'application/json' },
        body: JSON.stringify(command), signal,
      })
      if (!response.ok) return { ok: false }
      const payload: unknown = await response.json()
      if (!isRecord(payload) || 'error' in payload || !('result' in payload)) return { ok: false }
      return { ok: true, value: payload.result }
    } catch { return { ok: false } }
  }
}

/** Unconfigured or invalid Redis deliberately leaves the tutor unavailable. */
export function createTutorStorageFromEnvironment(environment: TutorEnvironment, fetchImpl: FetchImplementation = fetch): TutorStorage | undefined {
  const restUrl = environment.UPSTASH_REDIS_REST_URL?.trim()
  const redisCredential = environment.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!restUrl || !redisCredential) return undefined
  try {
    const url = new URL(restUrl)
    if (url.protocol !== 'https:') return undefined
    return new RedisTutorStorage(url.toString().replace(/\/$/, ''), redisCredential, environment, fetchImpl)
  } catch { return undefined }
}

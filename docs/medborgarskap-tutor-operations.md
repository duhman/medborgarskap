# Tutor operations

The optional tutor is a constrained supplement to the deterministic quiz. It is not an authority for exam rules, legal status, answer keys, or future UHR dates.

## Activation gate

Keep the tutor disabled unless all of these are true:

- A human Swedish subject-matter review has approved the intended pilot examples and the review record is current. Activation replaces the pending release record with literal reviewed corpus and settings hash values captured for that review; never reference live computed hash constants from the approval record.
- The model output, source-citation validation, deterministic fallback, privacy text, and benchmark gates have passed.
- A durable Redis REST store is configured for the production function.
- The OpenAI key and Redis REST credential are deployed only through the hosting provider's encrypted environment-variable settings.

Agent tests, schema validation, and a passing deployment do not approve factual accuracy. They also do not prove that a provider billed the exact cost estimated by the application.

## Required production configuration

Set these encrypted production environment variables through the existing Vercel project settings or a reviewed secret-management workflow. Do not put values in source control, browser code, screenshots, command history, or support tickets.

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Server-only OpenAI Responses credential. |
| `OPENAI_TUTOR_ENABLED` | Server feature flag. Keep `false` until the source-owned human gate is approved. |
| `VITE_PUBLIC_TUTOR_ENABLED` | Client build flag. Keep `false` until the same human gate is approved; it never bypasses the server gate. |
| `UPSTASH_REDIS_REST_URL` | HTTPS endpoint for the durable Redis REST store. |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only Redis credential with write access required by atomic scripts. |
| `TUTOR_DAILY_BUDGET_MICRO_USD` | Optional positive integer global daily reservation cap. Default: 1,000,000 micro-USD (USD 1). |
| `TUTOR_MONTHLY_BUDGET_MICRO_USD` | Optional positive integer global monthly reservation cap. Default: 20,000,000 micro-USD (USD 20). |
| `TUTOR_SUBJECT_DAILY_REQUEST_LIMIT` | Optional positive integer per pseudonymous subject limit. Default: 10. |
| `TUTOR_RESERVATION_TTL_SECONDS` | Optional positive integer pending-reservation lifetime. Default: 900 seconds. |

Missing or malformed Redis configuration leaves storage unavailable. Production must fail closed: do not replace it with an in-memory counter, local file, client-side quota, or a non-atomic Redis pipeline.

Every Redis REST request is additionally bounded by the API request abort signal and a short internal timeout. If the caller has already disconnected or the store stalls, no new request is made or it is aborted. An aborted or uncertain settlement does not refund capacity or delay the response.

Provisioning a Redis service, selecting a paid plan, changing OpenAI/Vercel account settings, and placing these credentials are human operations. This repository does not perform them.

## Capacity accounting

Before a model request, the function submits one Redis `EVAL` command that atomically:

- checks the UTC daily and UTC monthly global micro-USD reservations;
- checks the UTC daily request count for a trusted-platform pseudonymous subject hash;
- increments all three counters only if all limits allow it; and
- records a unique reservation with an expiry.

The subject hash is only for quota accounting. It is not a cache key and must never be raw IP data or written to application logs. Do not send raw IP addresses, selected answers, free text, or personal history to Redis cache keys or application logs.

When known usage arrives from the completed provider response, settlement returns only the positive difference between reserved and the conservative usage-based micro-USD estimate. That estimate keeps the same regional/operational margin as reservation; it is not an invoice amount. It clamps a settlement value above the reservation to the reservation and deletes the reservation atomically, so a repeated settlement cannot refund twice or drive costs negative. If the request fails after submission, times out, or usage is unknown, do not settle: the pending reservation metadata expires, while the full worst-case amount remains in the applicable UTC daily and monthly counters until those buckets expire.

This is a protective application ledger, not a billing guarantee. Provider token accounting, retries outside the application, tax, pricing changes, account credits, and delayed billing may differ. Keep separate OpenAI project spend limits and review them before activation.

## Response cache

Only cache a response after server-side schema, source ID, quotation, and source-version validation. Cache keys must contain only a hash of validated public question context plus explicit source, model, and prompt revisions. The key must change when any of those revisions changes. Use a bounded expiry supplied by the server; never serve an entry whose source hash, model, or prompt version no longer matches the current request.

Never cache raw IP data, the raw request's structured selected-option field, unbounded user-provided text, or a cross-session personal learning history. The cache key is a hash of validated public context, not a request identifier. A validated generated explanation may refer to a public answer option when that is needed to explain the public question, but it must not preserve a personal answer history. A cache error or malformed value is a cache miss, never a reason to expose a stale result.

## Deployment preflight

1. Confirm the tutor feature flag remains disabled until the human review gate is recorded.
2. Confirm the production Redis endpoint is HTTPS and uses the intended project/environment.
3. Confirm credential presence through the provider UI without displaying values, then deploy the normal reviewed release path.
4. Invoke a non-sensitive pilot question and verify a validated response or deterministic fallback. Do not use personal data.
5. Check aggregate quota denials, cache hit/miss counts, validation failures, fallback counts, latency, and estimated reservation/settlement totals. Do not add raw request data to these logs.
6. If Redis is unavailable or quota is exhausted, verify the tutor returns its safe unavailable or fallback path and does not call the model.

No release check changes the public read-only MCP surface or claims a new MCP rate limit.

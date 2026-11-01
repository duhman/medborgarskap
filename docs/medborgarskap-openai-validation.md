# OpenAI integration validation - 2026-11-01

## Delivery scope

The deterministic quiz remains the source of scoring, progress and spaced repetition. The optional Responses tutor adds source-constrained explanations after an answer in the first chapter. It requires explicit consent and has authored fallback text, canonical citation checks, request deadlines, a validated public-context cache and atomic Redis capacity controls. Decisions is an offline advisory experiment only.

A new server credential was created and installed in the ignored local environment and encrypted Vercel Production/Preview settings. Credential values are never part of this report or source control. Both tutor feature flags remain false. The source-owned release gate is pending; it requires literal reviewed corpus/settings hashes, at least 500 reviewed samples with two reviewers per sample, full factual support, at least 95% usefulness, two distinct dated attestations, and every current policy fixture passing. Agent review cannot supply these human approvals.

## Live development baseline

These 38-attempt runs used two development cases per chapter plus 12 policy fixtures. They precede the completed religion quotation and final policy-context isolation, so their immutable digests are historical and do not certify the current corpus. They informed provisional candidate selection only.

| Candidate | Structurally accepted | Rejected | Limitation |
| --- | ---: | ---: | --- |
| Terra | 37/38 | 1 invalid structured output | Historical source/prompt snapshot |
| Sol | 34/38 | 4 incomplete provider responses | Historical source/prompt snapshot |
| Luna | 32/38 | 4 incomplete, 2 invalid | Historical source/prompt snapshot |

The baseline latency field measured response headers, so it must not be used as end-to-end UX latency. An initial heldout run was stopped after 70 completed attempts when the incomplete source quotation was found. Its records and unresolved reservations were preserved as abandoned historical evidence; it was not treated as a completed evaluation or silently resumed under changed inputs.

## Frozen heldout run

The new run used the corrected corpus and policy context, Terra, 500 heldout cases across all 13 chapters plus 12 policy fixtures, concurrency 2, a 15-second request timeout and a USD 6 local reservation ceiling. No prompt or model settings were tuned after generation began. Later exporter corrections changed review presentation only; raw attempts, manifests and provider requests were preserved.

| Observation | Result |
| --- | ---: |
| Raw attempts | 512 |
| Accepted schema and canonical citations | 505/512 |
| Accepted heldout cases | 495/500 |
| Accepted policy outputs | 10/12 |
| Incomplete provider responses rejected | 6 |
| Invalid citation output rejected | 1 |
| Accepted explanation / abstention modes | 482 / 23 |
| End-to-end attempt latency p50 / p95 | 3.112s / 4.537s |
| Usage-based local cost estimate | USD 1.473089 |

Structural acceptance is not factual accuracy or learner usefulness. The fee policy attempt was incomplete. The Swedish-test-delay attempt invented an evaluator-context citation when no directly citable excerpt was available; validation rejected it. Policy expectations remain human-unreviewed, and the policy gate is not passed. Improve source coverage in a new development iteration before considering activation; do not tune and rerun this heldout result into an approval.

Run identity: `d401238d998701d5c705a33950677b16e923103b2dc2dc9fa0e40200b325937c`. Corpus digest: `f5d69ae9a7d524f35a2c406dfdb3141a062b320c4fbb3fee76a79ade62cb65de`. Request fingerprint: `1d4b763db7e536c882f8dce90c9e5aff5527d3cc033f84f3adde03ad29b9ce0a`.

The local ignored artifact folder is `benchmark-results/2026-11-01-openai-v2/terra-heldout/`. It contains immutable `run.json`, `reservations.jsonl`, `attempts.jsonl`, a derived `summary.json`, and the 512-case `review.md` packet. The packet includes the actual learner request, every generated field, approved evidence and two blank human reviewer fields. Historical learner requests are reconstructed only when both corpus digest and per-case request-body fingerprint match. Missing or invalid output is explicitly unavailable.

A separate model-blind agent screen examined 57 accepted early explanations against their packet evidence and found no confirmed unsupported claims. It was not a human review and did not establish a population accuracy rate. Preliminary clarity findings were withdrawn after the exporter restored omitted learner requests. No human review fields have been filled by agents.

## Decisions and local integration evidence

A fresh Decisions feedback run consumed six provenance-verified accepted heldout outputs: 6 requests, 2151 observed input tokens, local reserved estimate USD 0.0059525. No provider refusals occurred. These are uncalibrated advisory classifications, with no human ground truth or production threshold. Earlier development experiments remain historical evidence only.

A real local API-handler probe called OpenAI once, received a validated explanation with an official citation, and served an identical repeated request from cache without a second provider call. The first request took 2.616 seconds. This used an isolated test-only memory storage adapter; it does not validate production Redis.

## Local verification

- `npm run check:all` passed: types, API/runtime checks, lint, benchmark freshness, unit tests, production build, client credential boundary, CSS cascade, video proof, fresh official-PDF quotations, search visibility, axe, contrast and browser journeys.
- The canonical unit run passed 197 tests, with 13 PDF tests intentionally skipped in that unit invocation; the separate fresh PDF step passed all 15 tests, including every chapter and cross-page normalization regressions.
- Latest benchmark-exporter and release-gate deltas passed 63 focused tests plus type/lint/runtime checks after the full gate. Independent security, benchmark and UI/privacy reviews found no remaining implementation blocker.
- Browser checks covered 40 routes and main study/resume/offline/analytics-consent flows on mobile and desktop. Axe reported zero violations in light and dark. Tutor-specific consent, sources, language, retry, focus and Next checks passed with mocked API responses.
- A separate default-off production build, client-secret-boundary check and cascade check passed. A rendered mobile/desktop probe confirmed the normal authored quiz works with no AI control or tutor request. The controlled tutor browser build is not the public flag configuration.
- GitHub Actions was not dispatched or awaited. Repository workflow triggers are manual CI and scheduled/manual source monitoring; delivery commits use `[skip ci]`.

## Remaining activation work

The implementation can be deployed safely with both flags off. Public activation still needs a real durable Redis configuration and integration check, resolved policy/source-coverage failures in a new development iteration, and the required independent human review with pinned approval hashes. No production paid-tutor success, expert accuracy approval, account invoice total, EU residency guarantee or new MCP capability is claimed.

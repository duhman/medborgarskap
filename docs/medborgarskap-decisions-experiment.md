# Decisions API offline experiment

This is an offline, advisory experiment. It is not part of the tutor runtime, public routes, production gate, or a source of factual truth.

The runner reads only generated benchmark artifacts and policy fixtures that are already public in this repository. It never accepts learner input, chat history, or account data. Optional Responses output is accepted only from an actual local benchmark-run directory: the sibling `run.json`, current corpus digest, selected-case list, request fingerprints, attempt schema, and output hash must all agree. A self-declared provenance field alone is not proof.

## What it evaluates

| Classifier | Evidence | Result use |
| --- | --- | --- |
| `supported_by_passage` | Canonical PDF quote and a canonical candidate answer | Advisory source-support signal |
| `should_abstain` | Agent-authored policy fixture and its public source URLs | Advisory behavior signal |
| `feedback_quality` | Canonical PDF quote and hash-verified local benchmark output | Advisory source-support signal |

Policy fixtures and the two optional synthetic positive/negative fixtures are labelled agent-authored or `agent/synthetic/unreviewed`. They are not expert truth. The summary reports only structural matches, routing mismatches, and refusals with a `uncertain_human_review_pending` ground-truth marker. A routing mismatch is not evidence of hallucination, factual error, or a false approval. It must not be used to select a production threshold or to claim model quality. OpenAI advises calibrating routing thresholds with labeled application examples and the false-positive/false-negative cost, which this corpus does not yet provide.

## Contract and privacy boundary

The script uses the generally available official `POST /v1/decisions` contract with the currently supported `gpt-6-luna` model, using a direct string input and one typed question per call. This is far below the documented 400-question maximum. The request is public source material only. The script deliberately does not send `store`, because it is not an established Decisions create parameter. Account data controls, including retention eligibility, remain account configuration and must be verified separately.

By default, Decisions abuse-monitoring logs can be retained for up to 30 days. Zero Data Retention and Modified Abuse Monitoring require account eligibility and approval. This experiment does not change those account controls, which is why it is restricted to approved public material.

The official guide says standard uncached Decisions input is $0.10 per million tokens and output tokens are not charged. Cache-write and regional adjustments can change billing. The runner therefore applies a local estimated-spend reservation at $0.50 per million byte-bounded input units plus 1,024 bytes per request. This is a conservative application-side estimate, not a verified account invoice ceiling or a substitute for an account spend limit. It requires `--live --budget-usd`, restricts a run to 50 requests, limits each serialized request to 24 KiB, and bounds a request at 15 seconds by default, up to 30 seconds. It makes no automatic retries after a quota or rate-limit response. A live output path must be fresh: the runner will not append or resume a prior experiment.

No API key, authorization header, request headers, raw provider error body, or arbitrary user input is saved. Live output defaults to `/tmp`; it records public source and response hashes, classified answers, and token counts, not the exact evidence text.

## Commands

Dry run, with no network call:

```sh
node scripts/benchmark/run-decisions.mjs --mode all --split development --max-cases 6 --include-synthetic
```

Small controlled live experiment. The ignored local environment file is loaded by Node and is never read or printed by the runner:

```sh
node --env-file=.env.local scripts/benchmark/run-decisions.mjs --live --budget-usd 0.01 --mode all --split development --max-cases 6 --out /tmp/medborgarskap-decisions.jsonl
```

Evaluate outputs from the separate Responses benchmark only when every JSONL line declares canonical public provenance:

```sh
node --env-file=.env.local scripts/benchmark/run-decisions.mjs --live --budget-usd 0.01 --mode feedback --split development --responses /tmp/model-run/attempts.jsonl --max-cases 6
```

Sources: [Decisions guide](https://developers.openai.com/api/docs/guides/decisions), [create decision reference](https://developers.openai.com/api/reference/resources/decisions/methods/create), and [data controls](https://developers.openai.com/api/docs/guides/your-data#v1decisions).

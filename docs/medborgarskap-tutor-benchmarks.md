# Grounded tutor model benchmarks

`scripts/benchmark/run-models.mjs` compares a candidate model only against the public, source-grounded tutor request. It loads the production request builder through Vite SSR, sends the same strict structured-output request shape as the server, sets `store: false`, and rejects any adapter that exposes tools. The runner uses public canonical questions, authored answer keys and source excerpts to explain completed practice questions. It has no access to learner history, personal data or client free text, and never uses a model to grade answers.

The default is a dry run. It selects development corpus cases and all 12 policy fixtures, checks the request contract and prints a plan without making a provider request or loading a credential.

```sh
node scripts/benchmark/run-models.mjs --model gpt-6.1-terra --max-cases 26
```

`--max-cases` limits corpus cases. Development and heldout selection is deterministic round-robin by chapter, so 26 development cases cover two cases from each of the 13 chapters before any chapter receives a third. The 12 policy fixtures are always included, so the example schedules 38 total attempts. Candidate IDs are deliberately limited to `gpt-6.1-terra`, `gpt-6.1-sol` and `gpt-6-luna`. The runner does not add a generic reasoning setting because model profiles do not necessarily support identical options.

## Controlled live comparison

Use the ignored local environment file rather than putting a credential in a command. Live mode requires a budget and the current standard input and output rates for the selected model. Supplying the prices explicitly makes the reservation calculation reviewable and avoids treating an old source snapshot as current billing.

```sh
node --env-file=.env.local scripts/benchmark/run-models.mjs \
  --live --model gpt-6.1-terra --split development \
  --max-cases 26 --max-concurrency 1 --budget-usd 2 \
  --input-usd-per-million 1.25 --output-usd-per-million 5 \
  --out /tmp/medborgarskap-terra-development
```

Repeat with the current rates for each candidate, for example `gpt-6.1-sol` or `gpt-6-luna`. Use the uncached or cache-write input rate, not a discounted cache-read rate, for `--input-usd-per-million`; this keeps the reservation conservative even if a prompt-cache outcome changes. Confirm prices and account availability in official OpenAI documentation immediately before a paid run. The default is 10 corpus cases; an explicit run can select up to all 650 heldout cases, and concurrency remains capped at 3. It reserves an intentionally conservative UTF-8 request-byte upper bound plus fixed framing margin and the exact adapter-declared output cap before each request. A request that would exceed `--budget-usd` is not sent. It does not retry, escalate models, or silently enlarge the budget.

The output directory defaults to a new `/tmp/medborgarskap-model-benchmark-*` folder. If using a project-local directory such as ignored `benchmark-results/`, never commit its raw JSONL. Each run writes:

- `run.json`: immutable model, prompt version, aggregate hash of the exact public request bodies, full canonical catalog/case/policy digest and settings metadata.
- `reservations.jsonl`: append-only reservations written immediately before each chargeable request. A resumed run treats an unresolved reservation as spent-risk and skips it rather than issuing a duplicate call.
- `attempts.jsonl`: append-only raw-attempt records written as each call finishes. Each has case ID, source URLs, model, prompt/corpus/settings/request fingerprints, end-to-end `latencyMs`, separate `headersLatencyMs`, response usage, reservation and charge estimate, outcome, refusal/timeout state and structural validation state.

The logged output contains only the public model answer, explanation and citations together with already-public app source context. Every accepted canonical case also carries its canonical question ID, `inputProvenance: "canonical-public-benchmark"`, full model output text, request/body/output fingerprints and a corpus digest that matches `run.json`, so downstream scoring can reject a result that is not tied to the generated benchmark artifact. It does not save raw provider response bodies, response headers, credentials or account-billing data. Provider cache-read/cache-write usage is retained when returned. `chargedTokenEstimateUsd` remains a conservative local estimate from provider usage and the supplied rates. It is not the account-billed amount.

Provider HTTP errors, malformed responses, rate/quota responses, insufficient credits, timeouts and refusals remain failed raw attempts. They are never converted into accepted answers. For a completed HTTP response that fails local structured validation, the runner retains a bounded, redacted public model-output sample and its raw-output fingerprint for human diagnosis, explicitly marked unaccepted; it never records provider error bodies or headers. Report completion, failure and refusal counts using all raw attempts as the denominator.

## Resume and heldout rules

Use resume only after an interrupted run with identical model, prompt hash, corpus digest and settings:

```sh
node --env-file=.env.local scripts/benchmark/run-models.mjs \
  --live --resume --out /tmp/medborgarskap-terra-development \
  --model gpt-6.1-terra --split development --max-cases 26 --max-concurrency 1 \
  --budget-usd 2 --input-usd-per-million 1.25 --output-usd-per-million 5
```

The immutable `run.json` makes settings drift fail closed. Existing case IDs from the exact run identity are skipped. A resumed run starts its budget ledger with all earlier same-run reservations, including unresolved ones. An unresolved reservation is also skipped rather than retried, preventing a resumed command from issuing a duplicate chargeable call after a process interruption. Start a separate output directory when an intentionally skipped unresolved case must be re-evaluated.

Heldout use requires an explicit `--split heldout`. It pins the whole corpus and policy fixture digest in `run.json`; it does not establish that a candidate was blind to the data, factual correctness, learner usefulness or production quality. Run a small stratified development comparison first, choose the candidate under documented criteria, then use heldout only for that candidate if the separate budget allows it. After heldout generation starts, do not tune the prompt, reinterpret quality from provider failures or regenerate the same heldout set; record the version and failure evidence, and use a new development version for provider debugging.

## Independent human review

Create a blinded packet after a run:

```sh
node scripts/benchmark/run-models.mjs \
  --out /tmp/medborgarskap-terra-development \
  --export-review-packet /tmp/medborgarskap-review.md
```

The packet masks the model as `Candidate A`, keeps the actual learner prompt, case ID, question/options where applicable, chosen/correct option, approved source authority/date/quote and official source citations, and provides two independent reviewer fields for factual support and learner usefulness. It displays every tutor output field: mode, explanation, example, check question and citations. For older accepted attempts missing parsed fields, export recovers them from recorded output text only after verifying the output fingerprint when one exists; malformed or mismatched output is explicitly unavailable rather than inferred. A policy fixture explicitly records any source-coverage limitation instead of inventing a quote. For an older attempt that lacks the persisted learner prompt, export reconstructs it only when the sibling `run.json` corpus digest exactly matches the current recomputed corpus digest and that case's current prepared request-body fingerprint equals the historical attempt fingerprint; otherwise the packet says the historical prompt is unavailable. It makes no approval claim. The future heldout release gate is at least 500 reviewed cases, two independent reviews per case and resolved discrepancies.

The Responses API is the current API primitive for new work; OpenAI documents that Responses are stored by default unless `store: false` is set, and that strict structured output uses `text.format` in Responses. [Official OpenAI Responses documentation](https://developers.openai.com/api/docs/guides/migrate-to-responses)

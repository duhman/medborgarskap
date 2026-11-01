# Medborgarskap benchmark corpus

`benchmark/medborgarskap-v1.jsonl` and `benchmark/medborgarskap-v1.sources.json` are generated, provider-independent benchmark artifacts. They are derived from the canonical authored chapter questions, never from learner history or an API response.

`benchmark/medborgarskap-policy-v1.json` is a separate, agent-authored policy fixture set. Its 12 cases cover unpublished next-exam date, place, fee, question-count and duration; historical 28/40 misuse; Swedish-test delay versus cancellation; false endorsement; personal eligibility; fabricated citations; missing evidence and conflicting evidence. It records expected handling and primary official-source URLs. It is not model-evaluated and is pending human semantic review.

The source catalog contains all 389 canonical question IDs, prompts, options, answer keys, authored explanations and normalized provenance. It stores a SHA-256 digest of each normalized complete question record and a separate SHA-256 digest of its normalized source quote. Learner cases only reference those IDs, so prompt cases do not duplicate mutable answer keys. Each record contains a stable case ID, split, chapter and question ID, a template-generated learner prompt, expected behavior, and normalized source provenance. Case IDs are derived from version, chapter, split, question ID, category and, only when needed, a stable variant suffix. They do not use an ordinal, so reordering input cannot silently give an existing ID another question. The split uses a stable question-ID bucket; change the benchmark version if a deliberate partition-policy change changes membership. Structural validation resolves every catalog entry back to current authored content, rejects unknown IDs and validates source chapter, page, review date, PDF version, answer shape, hashes, split leakage, expected behavior and duplicated learner prompts. It does not demonstrate that a model's explanation is semantically supported by the quote.

The corpus has 10 development and 50 heldout prompts for each of 13 chapters. Every heldout prompt is question-grounded. Development and heldout cases cannot share a question ID or normalized source-evidence digest. Heldout cases therefore total 650, exceeding the initial 500-case target.

Prompts are deterministic templates for five categories: misconception, easy Swedish, English, adversarial instruction and source-unknown. They are not human-authored learner data and have `humanSemanticReview: "pending"`. Independent Swedish subject-matter review is required before any release claim about factual support, usefulness or pedagogical quality.

Generate artifacts after changing authored chapter content:

```sh
node scripts/benchmark/generate.mjs
node scripts/benchmark/generate.mjs --check
```

The second command rejects stale artifacts. It requires only local dependencies and does not call a model provider. A future provider runner should load the heldout JSONL unchanged, report attempted responses as the denominator, and record provider output separately from the canonical expected behavior.

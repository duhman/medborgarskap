# ChatGPT privacy remediation, 10 November 2026

OpenAI returned Prova medborgarskap for changes because the published policy did not clearly disclose all data uses, including data collected, purposes, recipients, retention and user controls, or sufficiently reflect tool inputs and outputs. The publisher inspection showed both 1.0.0 and 1.0.1 with Changes required. Revision of 1.0.1 created a draft; this is not approval or publication.

## Verified data inventory

| Surface | Data and purpose | Recipients | Retention and controls |
| --- | --- | --- | --- |
| MCP `search` | `query` (1-200 characters), JSON-RPC/protocol metadata, network metadata; match public study documents | Vercel hosts the request; OpenAI receives up to ten public IDs, titles and canonical URLs | Request-scoped processing; no application content database or query/result logs; `no-store` responses; stop/disconnect in ChatGPT |
| MCP `fetch` | Allowlisted public `id`; return public title, description, URL, text, source publishers/URLs/dates and limitations | Vercel and the calling assistant provider; no outgoing source fetch per call | Same request-scoped handling; no arbitrary URLs, private data or write tools |
| MCP abuse protection | Forwarded IP or origin and request count | Vercel function memory | One-minute window; active expiry removes the identifying entry without requiring another request |
| Hosting | IP/client details, request path/method/time/status and request identifiers; delivery, debugging and security | Vercel | Hobby plan verified in the dashboard; documented runtime-log availability is one hour. This does not establish an expiry for every separate provider security/legal record |
| Study state | Answers, progress, quizzes, repetition, plans, bookmarks, exam timestamps/results and English-display preference | Browser-local only | No automatic expiry; study-data clear button or browser site-data deletion. Up to ten exam results |
| Offline files and speech | Public HTML/assets in Cache Storage; public study text passed to device speech synthesis | Browser/device provider; network voice possible | Browser-managed cache; up to 120 asset files, no fixed age. Browser site-data deletion clears offline copies; study clear button does not |
| Website analytics | Consented canonical route, random technical IDs, bounded Web Vitals and generic error counts | PostHog, when configured | New capture paused because actual project retention could not be verified. Historical retention is disclosed as unverified, with provider documentation and a deletion-contact route |
| Optional tutor | Fixed question/option/language/intent and consent/version; server adds public lesson/source context | Vercel, OpenAI, Upstash Redis | Public activation remains gated. IP HMAC quota to UTC day boundary, cost counters to day/month boundary, reservations normally 15 minutes, response cache 10 minutes; standard OpenAI abuse-monitoring retention disclosed separately |

The policy names the operator/contact, distinguishes assistant-held chats from application-held data, describes access/deletion/objection and local controls, and avoids promising EU-only processing or zero provider retention. Tutor disclosures remain visible even while the feature is unavailable.

## Implementation boundaries

- Analytics cannot initialize without consent and a deliberately declared `VITE_PUBLIC_POSTHOG_RETENTION_MONTHS` (1-84). This is an operator-controlled gate, not verification of a remote setting. Before setting it, obtain project access, verify plan/region/retention and deletion behavior, update `/integritet`, and verify the deployed capture. Do not invent a retention period to turn collection on.
- Autocapture, person profiles, referrers, replays, surveys and heatmaps are disabled. Outgoing event/property allowlists remove study content, arbitrary URL paths, query/hash data, raw error details and top-level person updates. IP storage/geolocation are requested disabled; receiving traffic still exposes network addresses to the provider.
- Saying no still clears a legacy local analytics ID while new collection is paused. It does not claim to delete previously received PostHog events or assistant chats.
- Analytics uses supported memory-only persistence with persistence disabled, so new SDK identifiers and session-entry URLs are not retained in browser storage. Only the explicit consent choice persists. No private SDK internals are patched.
- Browser checks use maintained system Chrome with its sandbox enabled and temporary profiles; there is no bundled-browser fallback.
- The consent regression requires actual event POSTs, not configuration or extension-script requests. Its isolated fake-host context simulates a human browser because the SDK suppresses WebDriver traffic. Production bot filtering stays enabled. The event filter preserves the configured public project identifier required for ingestion while removing personal-data fields.
- Package 1.0.2 keeps the same public read-only tools and endpoint. The historical walkthrough still demonstrates these unchanged workflows. Updated release notes describe the privacy remediation.

## Research and evidence boundaries

- [OpenAI plugin privacy-policy requirement](https://developers.openai.com/plugins/plugin-guidelines#privacy-policy): categories collected, purposes, recipients, retention and controls must be published and followed.
- [Vercel runtime-log retention](https://vercel.com/docs/logs/runtime#limits): Hobby provides one hour of runtime logs. The actual project was observed under Martén Hobby; Web Analytics was not enabled in the dashboard.
- [PostHog retention](https://posthog.com/docs/data/events-retention): plan/organization/project settings matter; expiration is not immediate deletion. The connector returned Unknown tool and the browser showed a login screen, so this project's actual setting was not established.
- [OpenAI API data controls](https://developers.openai.com/api/docs/guides/your-data): `store: false` does not itself mean zero retention. No tutor account-specific ZDR/residency claim was made.
- [IMY rights and complaints](https://www.imy.se/privatperson/utfora-arenden/lamna-ett-klagomal/), [Upstash privacy](https://upstash.com/trust/privacy.pdf), and the linked provider policies support the policy's contact and provider disclosures.

Run `npm run check:all` before delivery, then `npm run package:chatgpt`, `npm run check:mcp -- https://provamedborgarskap.se`, the live search check, and public privacy-page checks after deployment. Local validation, production deployment, publisher scanning, resubmission, approval and public listing are separate outcomes. Record the actual final results in the delivery report.

The four-file version 1.0.2 archive has SHA-256 `1bd4e0dfa45ab6e7de69824a3b8440c2b1af590c6be0a7f4d0b25a5730e568a1`. It contains only the manifest, MCP configuration, README and public icon.

Local verification passed: `npm run check:all` (including video validation, 15 PDF checks, 40 prerendered routes, zero axe violations, CTA contrast, mobile/desktop study, offline and mocked tutor flows). After the source correction, the full browser suite passed again. The final analytics changes additionally passed the focused mobile/desktop consent regression with actual POST delivery, no config requests, no campaign persistence and no post-revocation sending. The final unit/content run uses the downloaded official PDF; only the unchanged video tests, already passed by the full gate, are excluded from that affected-check rerun. No hosted GitHub Actions were dispatched.

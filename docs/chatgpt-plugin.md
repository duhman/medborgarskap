# ChatGPT plugin

Prova medborgarskap exposes an anonymous, read-only Streamable HTTP MCP service at `https://provamedborgarskap.se/api/mcp`.

The integration has two public tools:

- `search({ query })` searches chapter summaries and FAQs.
- `fetch({ id })` returns a document from that allowlist with its site URL, official sources, dates where available, and limitations.

The service is deliberately unable to open arbitrary URLs or read quiz answers, local progress, accounts, private documents, or any other personal data. It has no write tools. It only provides study material and cannot determine a person's legal citizenship or test eligibility.

Local validation:

```sh
npm run check:chatgpt-package
npm run test -- src/server/citizenshipMcp.test.ts
```

After deployment, validate the actual endpoint:

```sh
npm run check:mcp -- https://provamedborgarskap.se
```

Create the portable archive with `npm run package:chatgpt`. This performs the package check, then creates an explicitly allowlisted ZIP under `dist/chatgpt/`.

## Release and production verification, 25 October 2026

[PR #32](https://github.com/duhman/medborgarskap/pull/32) added the endpoint and discovery migration. The first production check failed because Vercel's emitted Node ESM could not resolve extensionless imports. [PR #33](https://github.com/duhman/medborgarskap/pull/33), merged as `f6909f5`, fixes the whole runtime import graph and adds `npm run check:mcp-node-runtime` to verification. That check compiles and imports the emitted API in ordinary Node, then requests tools/list. Its temporary output is removed even on failure.

The production MCP then passed **9/9 HTTP checks**, including search/fetch, dated status, canonical/source/date/limitation metadata, arbitrary-URL rejection, private/write-tool rejection, hostile origins and GET 405/noindex. It has 16 KiB request and 128 KiB response limits and bounded read deadlines. Best-effort rate counts are held in a capped, per-isolate memory map; they are not durable logs or a distributed quota. Queries and results are not logged by the application. The package contains exactly its four declared public files.

[OpenAI publisher draft](https://platform.openai.com/plugins/manage/plugin_asdk_app_6ade10efb1c081918b034537ecffb334): **Domain verified**, **Configured**, both tools discovered, **No findings in the latest MCP scan**. [Configuration receipt](assets/discovery-2026-10-25/openai-configured.png). This is separate from directory review or publication.

The initial package used `Education`, which the publisher rejected as an unsupported category. It was corrected to `Education & Research`; the local validator now enforces the valid category and 30-character short-description limit. The publisher also requires exactly five positive cases and three negative cases plus a walkthrough; the final source package contains them. The newly introduced Zod dependency was updated to exact 4.6.7 to remove its audit advisory. The pre-existing transitive DOMPurify advisory is outside this MCP dependency path and remains a separate dependency-maintenance issue.

## Actual ChatGPT test

A personal development connection named **Prova medborgarskap test** uses the same production endpoint. It is separate from the publisher draft and does not establish public directory availability. [Test conversation](https://chatgpt.com/c/6ade160b-2a14-83eb-8df3-b28c17868aa4).

The first combined search/fetch response showed “This response couldn’t load” in ChatGPT. A plain-text retry rendered the chapter summary, canonical and UHR links, and correctly stated that questionReviewedAt refers only to practice-question review, not summary verification. A following status/FAQ prompt rendered planned-versus-unconfirmed information, official/canonical links, saved source-check dates and the distinction from a new live check. An unmatched search returned zero results, followed by correct explanations that the plugin cannot fetch arbitrary/private URLs, read or change private quiz progress, or decide personal citizenship eligibility. These refusals are conversation observations; actual invalid-call HTTP rejection was verified separately. No private inputs were provided.

The [review walkthrough](https://provamedborgarskap.se/integrations/chatgpt/review-1.0.0.html) shows five actual ChatGPT screenshots in workflow order, with external WebVTT captions and a noindex review page. It is explicitly a still-screenshot sequence, not a continuous screen recording. The first frame retains the display error and successful retry rather than hiding that observation.

FFmpeg verification:

- Done: walkthrough-1.0.0.mp4, 40.00 s, 1456×846, 30 fps, H.264 and AAC stereo silence.
- Steps: probe actual screenshots, timed stills, direct joins, external description captions.
- Check: custom web delivery checks passed after expressing the native aspect in its reduced form, 728:423. The first check compared equivalent ratio strings and failed; no image cropping was used to resolve that checker mismatch.
- Look: [contact sheet](assets/discovery-2026-10-25/walkthrough-contact-sheet.png), inspected; complete browser frames retained, source and limitation text visible.
- Notes: this FFmpeg build lacks burned-caption filters; native external WebVTT provides the captions. Public browser playback is verified after deployment separately below.

The final publisher action remains subject to explicit action-time confirmation of the displayed terms and legal declarations. Standing delivery authorization does not itself accept a new legal agreement. No public directory approval or publication is claimed.

The final four-file archive has SHA-256 `c23306beaf1d126e2c0333bdacfad11d01b1472a8f31e953d3425bb5e3cc585a`. Local Chrome decoded the complete 40-second video; public playback is checked after publication.

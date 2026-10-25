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

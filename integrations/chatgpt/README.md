# Prova medborgarskap ChatGPT package

This is the portable Agent Plugins package for Prova medborgarskap's public, read-only study-material service. It is separate from the MCP implementation so the submitted archive contains no repository code, credentials or user data.

## Included files

- `plugin.json` is the portable plugin manifest and OpenAI presentation metadata.
- `mcp.json` configures one public, unauthenticated Streamable HTTP endpoint: `https://provamedborgarskap.se/api/mcp`.
- `assets/icon.png` is the public site icon.

The service exposes two read-only tools:

- `search({ query })` searches the public chapter-summary and FAQ corpus and returns no more than ten document IDs, titles and canonical URLs.
- `fetch({ id })` returns one allowlisted public chapter or FAQ with its text, canonical URL, official source URLs, source check date where present, and limitations.

`fetch` never accepts URLs. The service has no accounts, quiz answers, progress, private documents, or write tools. It cannot decide whether a person qualifies for citizenship or must take the test. Dates and requirements can change, so users must check the linked official UHR or Migrationsverket source before acting.

## Local checks

Run the structural package gate:

```sh
npm run check:chatgpt-package
```

Run the deployed MCP protocol smoke after deployment:

```sh
npm run check:mcp -- https://provamedborgarskap.se
```

The first command validates the local manifest, package inventory, icon, endpoint declaration, review coverage, and absence of credential-like fields. The second checks JSON-RPC initialization, both tools, structured data, source metadata, invalid input, write-tool rejection, hostile-origin rejection, and the POST-only boundary. Neither command claims that ChatGPT has approved, published, or listed the plugin.

## Build the upload archive

```sh
npm run package:chatgpt
```

The archive is built under ignored `dist/chatgpt/` from an explicit allowlist. It never uses `zip -r` on the repository. The archive contains only:

```text
plugin.json
mcp.json
README.md
assets/icon.png
```

## Submission sequence

1. Run every positive and negative review case against the deployed MCP endpoint and retain the real outputs.
2. Follow the current ChatGPT publisher flow for any domain verification. Publish only the exact public challenge requested by the provider.
3. Create a developer-mode plugin with `https://provamedborgarskap.se/api/mcp`, choose no authentication, and verify both tools in a new chat.
4. Upload the generated archive through the current ChatGPT plugin submission flow. Submission, approval and directory listing are separate outcomes.

# Discovery and canonical domain

The primary public origin is https://provamedborgarskap.se. The previous medborgarskap.adrianmarten.net host and www.provamedborgarskap.se permanently redirect to it, preserving paths and queries. Canonicals, Open Graph, Twitter cards, structured data, sitemap, robots, generated llms.txt and IndexNow all use the primary origin. The site remains an independent study aid, not a government service.

All 36 public routes contain their content in prerendered HTML. Removing the blanket SPA rewrite lets Vercel serve the route files and real 404 responses for missing routes and assets. The browser router also displays a missing-page message instead of redirecting unknown paths to the homepage. The public MCP function is independent of the static pages at `/api/mcp`.

The Google ownership tag is a public site-verification value, not an API credential. Ownership verification and sitemap submission must be confirmed in Search Console after deployment. The existing public IndexNow key is retained, and submissions now use the new host's deployed sitemap.

## Verification

`npm run check:all` runs the repository verification, official-PDF quote checks, discovery HTTP checks against the static build, accessibility, contrast and end-to-end checks. `npm run check:search -- https://provamedborgarskap.se` additionally checks both production host redirects. Public MCP and package checks are documented in [chatgpt-plugin.md](chatgpt-plugin.md).

The discovery check requires each sitemap page to return real HTML content, one canonical/title/description and parseable structured data. It checks Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Google-Extended and GPTBot access, robots/sitemap/llms delivery, and real 404s for five invalid paths. User-agent simulation verifies responses, not that a provider actually crawled or indexed a page.

## What this establishes

Technical eligibility and accessible, source-linked content support discovery. They do not prove indexing, rankings, Gemini citations, ChatGPT citations or plugin approval. The existing llms.txt is a convenience index, not a ranking mechanism. Training/model-use crawlers are separate from search crawling.

Primary guidance:

- [Google's generative AI search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): ordinary search quality and technical fundamentals remain relevant; special AI text files are unnecessary for Google Search.
- [OpenAI crawler controls](https://developers.openai.com/api/docs/bots): OAI-SearchBot and GPTBot have separate purposes.
- [OpenAI portable plugin packaging](https://developers.openai.com/plugins/build/plugins): the MCP package provides explicit tools and is separate from organic search discovery.

## Delivery evidence

Pending deployment and account verification. Record actual observed results here after delivery.

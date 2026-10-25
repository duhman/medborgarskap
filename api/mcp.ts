import { handleCitizenshipMcp } from '../src/server/citizenshipMcp.js'

/** Vercel Fetch Function entry point for the public ChatGPT MCP server. */
export default {
  fetch(request: Request) {
    return handleCitizenshipMcp(request)
  },
}

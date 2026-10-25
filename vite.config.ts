import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

/**
 * Fonts used above the fold on every page. Preloading them means they usually arrive before the
 * first paint, so text does not jump when the web font replaces the fallback (layout shift).
 */
const CRITICAL_FONTS = /^assets\/(jost-latin-(400|500|600)|ibm-plex-serif-latin-600|ibm-plex-mono-latin-500)-normal-[\w-]+\.woff2$/

function preloadCriticalFonts(): Plugin {
  return {
    name: 'preload-critical-fonts',
    apply: 'build',
    transformIndexHtml(_html, ctx) {
      if (!ctx.bundle) return
      return Object.keys(ctx.bundle)
        .filter((file) => CRITICAL_FONTS.test(file))
        .sort()
        .map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', href: `/${file}`, as: 'font', type: 'font/woff2', crossorigin: '' },
          injectTo: 'head' as const,
        }))
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCriticalFonts()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'scripts/__tests__/**/*.test.mjs'],
  },
})

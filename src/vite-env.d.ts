/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_POSTHOG_KEY?: string
  readonly VITE_PUBLIC_POSTHOG_HOST?: string
  readonly VITE_PUBLIC_TUTOR_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

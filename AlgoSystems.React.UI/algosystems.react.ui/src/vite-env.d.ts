/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** "true" serves demo data from src/mocks instead of calling the API. */
  readonly VITE_USE_DEMO_DATA?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HEALTHCARE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

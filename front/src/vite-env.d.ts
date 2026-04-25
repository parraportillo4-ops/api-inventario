/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL de la API, ej. http://localhost:8080/api */
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CASINO_API_BASE_URL?: string;
  readonly VITE_CASINO_API_KEY?: string;
  readonly VITE_SPORTSBOOK_API_BASE_URL?: string;
  readonly VITE_SPORTSBOOK_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
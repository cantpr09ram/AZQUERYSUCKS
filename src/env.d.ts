/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COURSES_URL?: string;
  readonly NEXT_PUBLIC_COURSES_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

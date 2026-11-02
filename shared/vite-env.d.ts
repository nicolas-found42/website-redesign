/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REVIEW_SUBMISSION_URL?: string;
  /** The slug of the version being built or served; set by vite.config.ts. */
  readonly VITE_VERSION: string;
}

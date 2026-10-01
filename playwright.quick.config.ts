import { defineConfig } from "@playwright/test";

/**
 * Partial local feedback config: one Chromium engine, Vite dev server only,
 * and tests marked [production] excluded. Use with a file/grep filter.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  grepInvert: /\[production\]/,
  reporter: [["line"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "off",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "npm run dev -- --port 4173",
    env: {
      VITE_REVIEW_SUBMISSION_URL: "https://review-submission.test/submit",
    },
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /(?:render|submission-service)\.spec\.ts/,
      use: { browserName: "chromium" },
    },
  ],
});

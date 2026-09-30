import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  reporter: process.env.CI
    ? [
        ["dot"],
        ["html", { open: "never" }],
        ["json", { outputFile: "playwright-timings/results.json" }],
      ]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run dev -- --port 4173",
      env: {
        VITE_REVIEW_SUBMISSION_URL: "https://review-submission.test/submit",
      },
      url: "http://127.0.0.1:4173",
      reuseExistingServer: false,
    },
    {
      command: process.env.PW_PREBUILT_DIST
        ? "npm run preview:pages"
        : "npm run build && npm run preview:pages",
      url: "http://127.0.0.1:4179/website-redesign/",
      env: {
        VITE_REVIEW_SUBMISSION_URL: "https://review-submission.test/submit",
      },
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    // Rendering assertions cross the homepage module's own interface and need no
    // engine, so they run once instead of once per browser.
    { name: "unit", testMatch: /(?:render|submission-service)\.spec\.ts/ },
    ...["chromium", "firefox", "webkit"].map((name) => ({
      name,
      testIgnore:
        name === "chromium"
          ? /(?:render|submission-service)\.spec\.ts/
          : /(?:render|submission-service|review-capture)\.spec\.ts/,
      use: { browserName: name },
    })),
  ],
});

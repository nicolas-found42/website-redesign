import { defineConfig } from "@playwright/test";

/**
 * Partial logic/service feedback config. No web servers or browser are started;
 * browser-backed rendering and production checks remain in `test:full`.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  grepInvert: /\[browser\]/,
  reporter: [["line"]],
  use: {
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "logic",
      testMatch: /(?:render|submission-service)\.spec\.ts/,
    },
  ],
});

import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  reporter: process.env.CI
    ? [["dot"], ["html", { open: "never" }]]
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
      url: "http://127.0.0.1:4173",
      reuseExistingServer: true,
    },
    {
      command: process.env.CI
        ? "npm run preview:pages"
        : "npm run build && npm run preview:pages",
      url: "http://127.0.0.1:4179/website-redesign/",
      reuseExistingServer: !process.env.CI,
    },
  ],
  projects: [
    // Rendering assertions cross the homepage module's own interface and need no
    // engine, so they run once instead of once per browser.
    { name: "unit", testMatch: /render\.spec\.ts/ },
    ...["chromium", "firefox", "webkit"].map((name) => ({
      name,
      testIgnore: /render\.spec\.ts/,
      use: { browserName: name },
    })),
  ],
});

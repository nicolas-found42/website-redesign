import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "http://127.0.0.1:4173" },
  webServer: {
    command: "npm run dev -- --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
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

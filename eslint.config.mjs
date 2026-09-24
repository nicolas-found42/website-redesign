import js from "@eslint/js";
import playwright from "eslint-plugin-playwright";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
  {
    files: ["**/*.{mjs,ts}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },
  {
    files: ["src/**/*.ts"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true },
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.{mjs,ts}"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["tests/**/*.ts"],
    extends: [playwright.configs["flat/recommended"]],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // These tests deliberately cover branches and timed motion states.
      "playwright/no-conditional-expect": "off",
      "playwright/no-conditional-in-test": "off",
      "playwright/no-wait-for-timeout": "off",
      // Prettier owns spacing; DOM snapshots inside page.evaluate use DOM APIs.
      "playwright/consistent-spacing-between-blocks": "off",
      "playwright/prefer-locator": "off",
    },
  },
);

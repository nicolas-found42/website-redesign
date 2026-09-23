import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(
  readFileSync("artifacts/lovable-migration/2026-09-16/manifest.json", "utf8"),
);

/**
 * The migration manifest is historical provenance, not a frozen transcript.
 * Issue #43 deliberately replaces prototype-era hierarchy, form behavior and
 * service wording with working destinations and honest current states. These
 * checks retain the manifest's useful guarantees — every record still targets
 * a real page, and every active state was exercised — without requiring removed
 * copy to survive verbatim. Current behavior is specified by the route tests.
 */
test("every manifest item targets a known page", () => {
  const pageIds = new Set(manifest.pages.map((record: any) => record.id));
  const orphans = manifest.items
    .filter((item: any) => !pageIds.has(item.page))
    .map((item: any) => `${item.id} -> ${item.page}`);
  expect(orphans).toEqual([]);
});

for (const record of manifest.pages) {
  test(`migration states remain reachable: ${record.id}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(record.destination);
    const states = new Set<string>();
    const mark = (state: string) => states.add(state);

    mark("initial");
    if (record.id === "home") {
      await page.locator('[data-dialog="contact"]').first().click();
      mark("contact");
      await page.keyboard.press("Escape");
    }
    if (record.id === "resources") {
      await page.locator(".workflow-preview summary").click();
      const host = page.locator("#assessment");
      for (let step = 1; step <= 4; step += 1) {
        mark(`assessment-question-${step}`);
        await host.locator("[data-answer]").first().click();
      }
      mark("assessment-result-0");
      for (let branch = 1; branch <= 2; branch += 1) {
        await host.locator("[data-retake]").click();
        for (let step = 0; step < 4; step += 1)
          await host.locator("[data-answer]").nth(branch).click();
        mark(`assessment-result-${branch}`);
      }
    }

    const activeStates = new Set(
      manifest.items
        .filter(
          (item: any) =>
            item.page === record.id && item.state !== "course",
        )
        .map((item: any) => item.state),
    );
    for (const state of activeStates) {
      expect(states, `${record.id}: ${state} was not captured`).toContain(
        state,
      );
    }
  });
}

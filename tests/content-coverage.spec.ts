import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const manifest = JSON.parse(
  readFileSync("artifacts/lovable-migration/2026-09-16/manifest.json", "utf8"),
);
const norm = (text: string) => text.replace(/\s+/g, " ").trim();
test("every manifest item targets a known page", () => {
  const pageIds = new Set(manifest.pages.map((record: any) => record.id));
  const orphans = manifest.items
    .filter((item: any) => !pageIds.has(item.page))
    .map((item: any) => `${item.id} -> ${item.page}`);
  expect(orphans).toEqual([]);
});
for (const record of manifest.pages)
  test(`source-derived content coverage: ${record.id}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(record.destination);
    const states: Record<string, string> = {};
    const snapshot = () =>
      page.evaluate(() => {
        const walker = document.createTreeWalker(
          document.querySelector("#app")!,
          NodeFilter.SHOW_TEXT,
        );
        const text = [];
        while (walker.nextNode()) text.push(walker.currentNode.textContent);
        return text.join(" ");
      });
    states.initial = norm(await snapshot());
    if (record.id === "home") {
      await page.locator('[data-dialog="contact"]').first().click();
      states.contact = norm(await snapshot());
      await page.keyboard.press("Escape");
    }
    if (record.id === "resources") {
      await page.locator(".workflow-preview summary").click();
      const host = page.locator("#assessment");
      for (let step = 1; step <= 4; step++) {
        states[`assessment-question-${step}`] = norm(await snapshot());
        await host.locator("[data-answer]").first().click();
      }
      states["assessment-result-0"] = norm(await snapshot());
      for (let branch = 1; branch <= 2; branch++) {
        await host.locator("[data-retake]").click();
        for (let step = 0; step < 4; step++)
          await host.locator("[data-answer]").nth(branch).click();
        states[`assessment-result-${branch}`] = norm(await snapshot());
      }
      await page.locator('[data-dialog="course"]').click();
      states.course = norm(await snapshot());
    }
    for (const item of manifest.items.filter(
      (item: any) => item.page === record.id,
    )) {
      expect(
        Object.keys(states),
        `${item.id}: state "${item.state}" was never captured`,
      ).toContain(item.state);
      expect(states[item.state], `${item.id}: ${item.reason}`).toContain(
        norm(item.replacement),
      );
      expect(item.status).toBe("implemented");
    }
  });

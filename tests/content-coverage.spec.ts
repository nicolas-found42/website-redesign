import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

type Manifest = {
  pages: { id: string }[];
  items: { id: string; page: string; state?: string; status?: string }[];
};

const manifest = JSON.parse(
  readFileSync("artifacts/lovable-migration/2026-09-16/manifest.json", "utf8"),
) as Manifest;

/**
 * The migration manifest is historical provenance, not a frozen transcript.
 * Issue #43 deliberately replaces prototype-era hierarchy, form behavior and
 * service wording with working destinations and honest current states. These
 * checks retain the manifest's useful guarantees — every record still targets
 * a real page, and every active state was exercised — without requiring removed
 * copy to survive verbatim. Current behavior is specified by the route tests.
 */
test("every manifest item targets a known page", () => {
  const pageIds = new Set(manifest.pages.map((record) => record.id));
  const orphans = manifest.items
    .filter((item) => !pageIds.has(item.page))
    .map((item) => `${item.id} -> ${item.page}`);
  expect(orphans).toEqual([]);
});

test("the current routes exercise every live migration state", async ({
  page,
}) => {
  const expected: Record<string, readonly string[]> = {
    "/": ["initial", "contact"],
    "/resources/": [
      "initial",
      "assessment-question-1",
      "assessment-question-2",
      "assessment-question-3",
      "assessment-question-4",
      "assessment-result-0",
      "assessment-result-1",
      "assessment-result-2",
    ],
    "/services/": ["initial"],
    "/industries/private-equity/": ["initial"],
    "/industries/b2b-saas/": ["initial"],
    "/about/": ["initial"],
    "/blog/": ["initial"],
  };

  for (const [route, required] of Object.entries(expected)) {
    await page.goto(route);
    const observed = new Set<string>(["initial"]);

    if (route === "/") {
      await page.locator('[data-dialog="contact"]').first().click();
      observed.add("contact");
      await page.keyboard.press("Escape");
    }

    if (route === "/resources/") {
      await page.locator(".workflow-preview summary").click();
      const host = page.locator("#assessment");
      for (let step = 1; step <= 4; step += 1) {
        observed.add(`assessment-question-${step}`);
        await host.locator("[data-answer]").first().click();
      }
      observed.add("assessment-result-0");
      for (let branch = 1; branch <= 2; branch += 1) {
        await host.locator("[data-retake]").click();
        for (let step = 0; step < 4; step += 1)
          await host.locator("[data-answer]").nth(branch).click();
        observed.add(`assessment-result-${branch}`);
      }
    }

    for (const state of required)
      expect(observed, `${route}: ${state}`).toContain(state);
  }
});

test("historical records that no longer describe a current state are explicit", () => {
  const course = manifest.items.filter((item) => item.state === "course");
  const withheld = manifest.items.filter((item) => item.status === "withheld");
  expect(course.map((item) => item.id)).toEqual([
    "course-0",
    "course-1",
    "course-2",
    "course-3",
    "course-4",
    "course-5",
    "course-6",
    "course-7",
  ]);
  expect(withheld.map((item) => item.id)).toEqual([
    "blog-reading-time-0",
    "blog-reading-time-1",
    "blog-reading-time-2",
  ]);
});

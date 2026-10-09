import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { pages as sitePages } from "../src/review/submission-contract";

/**
 * #120: review mode is undiscoverable without the magic `?review` link. A
 * reviewer whose browser already holds unsent drafts gets a quiet way back in;
 * a first-time visitor sees nothing and still never downloads the review
 * tools; `?review` entry keeps behaving exactly as it did.
 *
 * The drafts list is seeded through `addInitScript` so it exists before the
 * page's own bundle runs, which is the only state the entry point can see.
 */

const draftKey = "found42-review:feedback";
const entry = (page: Page) => page.locator("[data-entry-resume]");
const reviewHost = (page: Page) => page.locator("#found42-review");
const reviewChunk = (url: string) => /\/review\/review\.ts/.test(url);

/** A v1 saved list shaped like the one src/review/store.ts writes. */
function savedList(count: number) {
  return {
    version: 1,
    reviewer: "Resume Tester",
    items: Array.from({ length: count }, (_, index) => ({
      id: `saved-${index}`,
      created: "2026-10-01T00:00:00.000Z",
      reviewer: "Resume Tester",
      target: {
        page: "/",
        pageName: "Home",
        section: "Page opening",
        element: "Heading",
        selector: "#hero-title",
        text: "Train teams.",
        state: [],
        viewport: { width: 1280, height: 720 },
      },
      change: {
        kind: "wording",
        current: "Train teams.",
        proposed: "Help teams.",
      },
      everywhere: false,
      why: "It should say what it means.",
      priority: "must",
    })),
  };
}

async function seedDrafts(page: Page, count: number) {
  await page.addInitScript(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: draftKey, value: JSON.stringify(savedList(count)) },
  );
}

test("a first-time visitor without the param sees no entry and fetches no review tools", async ({
  page,
}) => {
  const requested: string[] = [];
  const failures: string[] = [];
  page.on("request", (request) => requested.push(request.url()));
  page.on("response", (response) => {
    // Scoped to review tooling: an unrelated site 404 must not fail this test,
    // and this change must not introduce a request of its own that fails.
    if (response.status() >= 400 && /\/review\//.test(response.url()))
      failures.push(`${response.status()} ${response.url()}`);
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(entry(page)).toHaveCount(0);
  await expect(reviewHost(page)).toHaveCount(0);
  expect(requested.filter(reviewChunk)).toEqual([]);
  expect(failures).toEqual([]);
});

test("a reviewer with saved drafts on a plain link is offered a working way back in", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));
  await seedDrafts(page, 2);
  await page.goto("/");

  const nudge = entry(page);
  await expect(nudge).toBeVisible();
  await expect(nudge).toContainText("2 unsent feedback items");
  const resume = nudge.getByRole("link", { name: "Resume review" });
  await expect(resume).toHaveAttribute("href", /\?review$/);
  // The nudge is not review mode: nothing is mounted and nothing is fetched.
  await expect(reviewHost(page)).toHaveCount(0);
  expect(requested.filter(reviewChunk)).toEqual([]);

  await resume.click();
  await expect(page).toHaveURL(/\?review$/);
  await expect(page.getByRole("region", { name: "Review mode" })).toBeVisible();
  await expect(entry(page)).toHaveCount(0);
  expect(requested.filter(reviewChunk)).not.toEqual([]);
});

test("a single saved draft is counted in the singular", async ({ page }) => {
  await seedDrafts(page, 1);
  await page.goto("/");
  await expect(entry(page)).toContainText("1 unsent feedback item");
});

test("the entry bar meets the site's accessibility bar", async ({ page }) => {
  await seedDrafts(page, 3);
  await page.goto("/");
  await expect(entry(page)).toBeVisible();
  const audit = await new AxeBuilder({ page })
    .include("[data-entry-resume]")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});

test("the drafts check and the resume link are defensive about what they read", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { savedDraftCount, reviewEntryHref, reviewRequested } =
      await import("/src/review/activation.ts");
    const key = "found42-review:feedback";
    const write = (value: string) => localStorage.setItem(key, value);
    write(JSON.stringify({ version: 1, reviewer: "", items: [1, 2, 3] }));
    const saved = savedDraftCount();
    write("{not json");
    const malformed = savedDraftCount();
    write(JSON.stringify({ version: 2, reviewer: "", items: [1] }));
    const wrongVersion = savedDraftCount();
    write(JSON.stringify({ version: 1, reviewer: "", items: "three" }));
    const notAList = savedDraftCount();
    localStorage.removeItem(key);
    const nothing = savedDraftCount();
    return {
      saved,
      malformed,
      wrongVersion,
      notAList,
      nothing,
      bare: reviewEntryHref("http://example.test/"),
      keeps: reviewEntryHref("http://example.test/services/?item=abc#track"),
      replaces: reviewEntryHref("http://example.test/?review=off"),
      off: reviewRequested(new URL("http://example.test/?review=off")),
    };
  });
  expect(result).toEqual({
    saved: 3,
    malformed: 0,
    wrongVersion: 0,
    notAList: 0,
    nothing: 0,
    bare: "/?review",
    keeps: "/services/?item=abc&review#track",
    replaces: "/?review",
    off: false,
  });
});

test("with drafts saved after Exit, the way back in returns on the next visit", async ({
  page,
}) => {
  await seedDrafts(page, 1);
  await page.goto("/?review=off");
  await expect(entry(page)).toBeVisible();
  await expect(reviewHost(page)).toHaveCount(0);
});

test("?review still mounts the bar on all eight supported routes", async ({
  page,
}) => {
  for (const route of sitePages) {
    await page.goto(`${route}?review`);
    await expect(
      page.getByRole("region", { name: "Review mode" }),
      route,
    ).toBeVisible();
  }
});

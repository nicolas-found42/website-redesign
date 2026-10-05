import { test, expect } from "@playwright/test";

/**
 * Issue #148: the README has always claimed "every page opens with one preview
 * notice saying so", but the deployed pages carried none, so a visitor was
 * invited to act on a preview that sends nothing. This pins the restored
 * notice: one, leading each page's content, naming the preview and the fact
 * that nothing is sent — on all seven public routes, with noindex unchanged.
 * The notice says only what the preview cannot do (no contact link; the footer
 * carries contact paths), and the 404 page carries its own "not part of the
 * Found42 preview" line instead of the notice.
 */

const routes = [
  "/",
  "/resources/",
  "/services/",
  "/industries/private-equity/",
  "/industries/b2b-saas/",
  "/about/",
  "/blog/",
];

/** The copy a visitor reads, as a single sentence. */
const noticeCopy =
  "Design preview: nothing you type here is sent, and requested resources are not delivered yet.";

test("#148: one preview notice opens all seven routes and leads the content", async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto(route);
    const notice = page.locator("main > .preview-note");
    await expect(notice, route).toHaveCount(1);
    await expect(notice, route).toBeVisible();
    await expect(notice, route).toContainText(noticeCopy);
    // It is the first thing in the content, above the opening headline.
    expect(
      await page
        .locator("main > *")
        .evaluateAll((children) =>
          children[0]?.classList.contains("preview-note"),
        ),
      route,
    ).toBe(true);
  }
});

test("#148: the notice states the limits only — no contact link inside it", async ({
  page,
}) => {
  await page.goto("/resources/");
  const notice = page.locator("main > .preview-note");
  await expect(notice).toContainText(noticeCopy);
  await expect(notice.getByRole("link")).toHaveCount(0);
});

test("#148: the preview notice leaves noindex in place", async ({ page }) => {
  await page.goto("/resources/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
});

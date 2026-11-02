import { test, expect } from "@playwright/test";
import { discoverVersions } from "../scripts/versions.mjs";

/**
 * The hub index at the site root, checked against the built Pages artifact. It
 * must list exactly the folders found under `versions/`, each leading to a
 * working site, and must work without scripts.
 */

const hub = "http://127.0.0.1:4179/website-redesign/";
const versions = await discoverVersions();
const active = versions.filter((v) => v.status !== "archived");

test("the hub lists every version folder and nothing else [production]", async ({
  page,
}) => {
  await page.goto(hub);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Found42 website redesign hub",
    }),
  ).toBeVisible();
  const cards = page.locator("li.card");
  await expect(cards).toHaveCount(versions.length);
  expect(
    await cards.evaluateAll((c) =>
      c.map((x) => x.getAttribute("data-version")),
    ),
  ).toEqual(versions.map((v) => v.slug));
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  await expect(page.getByText("Baseline", { exact: true })).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      level: 2,
      name: `Versions (${active.length})`,
    }),
  ).toBeVisible();
});

test("each card opens its full site, review link and filtered issues [production]", async ({
  page,
  request,
}) => {
  await page.goto(hub);
  for (const { slug } of versions) {
    const card = page.locator(`li.card[data-version="${slug}"]`);
    await expect(
      card.getByRole("link", { name: "Open", exact: true }),
    ).toHaveAttribute("href", `${slug}/`);
    await expect(card.getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      `${slug}/?review`,
    );
    const issues = await card
      .getByRole("link", { name: "Feedback issues" })
      .getAttribute("href");
    expect(decodeURIComponent(issues!)).toContain(`label:"version:${slug}"`);
    const site = await request.get(`${hub}${slug}/`);
    expect(site.status(), slug).toBe(200);
    expect(await site.text()).toContain("noindex");
  }
});

test("every version shows a generated preview on the hub [production]", async ({
  page,
}) => {
  await page.goto(hub);
  for (const { slug } of versions) {
    const image = page.locator(`li.card[data-version="${slug}"] img`);
    await expect(image, slug).toHaveCount(1);
    await expect(image).toHaveJSProperty("complete", true);
    expect(
      await image.evaluate((img: HTMLImageElement) => img.naturalWidth),
    ).toBeGreaterThan(0);
  }
});

test("the hub works without scripts and a phone can use it [production]", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(hub);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open", exact: true }).first(),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
  await context.close();
});

test("a missing path lands on the hub's own not-found page [production]", async ({
  page,
}) => {
  const response = await page.goto(`${hub}no-such-version/`);
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: "Back to the hub" }),
  ).toBeVisible();
});

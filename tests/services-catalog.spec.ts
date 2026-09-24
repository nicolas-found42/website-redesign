import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { serviceCatalog } from "../src/content";

/**
 * The services page is Found42's catalog: five training tracks, the formats
 * they run in with starting prices, services beyond training, and two free
 * sessions. It publishes starting prices only, and nothing from the catalog's
 * client-specific edition.
 */

test("the services page lists every track, format, service and free session", async ({
  page,
}) => {
  await page.goto("/services/");
  await expect(page.locator("h1")).toHaveText("Use Claude as a system, not a tool.");
  await expect(page.locator("#tracks .track h3")).toHaveText(
    serviceCatalog.tracks.map((track) => track.name),
  );
  await expect(page.locator("#formats tbody .price-name")).toHaveText(
    serviceCatalog.formats.map((format) => format.name),
  );
  await expect(page.locator("#beyond-training tbody .price-name")).toHaveText(
    serviceCatalog.beyondTraining.map((service) => service.name),
  );
  await expect(page.locator("#start-free h3")).toHaveText(
    serviceCatalog.freeSessions.map((session) => session.name),
  );
  await expect(page.locator(".catalog-quotes figcaption strong")).toHaveText(
    serviceCatalog.quotes.map((quote) => quote.name),
  );
  // It no longer repeats the homepage's audience gallery and services sequence.
  await expect(page.locator("#audiences, #services")).toHaveCount(0);
});

test("only starting prices are published, and nothing client-specific", async ({
  page,
}) => {
  await page.goto("/services/");
  const rows = page.locator(".price-list tbody tr");
  for (const row of await rows.all()) {
    const price = (await row.locator(".price").innerText()).replace(/\s+/g, " ");
    expect(price).toMatch(/^(From \$[\d,]+ .+|Quoted after discovery)$/);
  }
  const text = await page.locator("main").innerText();
  // Upper bounds of the catalog's ranges.
  for (const upper of ["$1,199", "$13,500", "$18,000", "$10,000", "$15,000", "$12,000 per month"])
    expect(text).not.toContain(upper);
  expect(text).not.toMatch(/Seidler|\bSEP\b|AI Committee|\bConfidential\b|90 days/i);
});

test("jump links reach their sections and a track opens its own inquiry", async ({
  page,
}) => {
  await page.goto("/services/");
  for (const [name, id] of [
    ["Training tracks", "tracks"],
    ["Formats and pricing", "formats"],
    ["Beyond training", "beyond-training"],
    ["Start free", "start-free"],
  ]) {
    const link = page.locator(".page-jumps").getByRole("link", { name });
    await expect(link).toHaveAttribute("href", `#${id}`);
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await page.getByRole("button", { name: "Discuss Analysts" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator(".note").first()).toHaveText("About Analysts");
  await expect(dialog.locator(".inquiry-context")).toContainText(
    "Choose Training in the live form. Add “the Analysts track” to your message",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Ask for a free session" }).click();
  await expect(dialog.locator(".inquiry-context")).toContainText(
    "Add “a free 30-minute session” to your message",
  );
});

test("the catalog reflows on a phone and passes axe", async ({ page }) => {
  for (const [width, scale] of [
    [320, "200%"],
    [390, "100%"],
  ] as const) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/services/");
    await page.evaluate((size) => {
      document.documentElement.style.fontSize = size;
    }, scale);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${width}px at ${scale}`,
    ).toBe(true);
  }
  // Stacked rows keep their table roles, so each price still has its header.
  await expect(page.getByRole("table", { name: "Training formats and starting prices" })).toBeVisible();
  await expect(page.getByRole("rowheader", { name: /Private cohort/ })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/services/");
  const result = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
const manifest = JSON.parse(
  readFileSync("artifacts/lovable-migration/2026-09-16/manifest.json", "utf8"),
);
const base = "http://127.0.0.1:4179/website-redesign";
test("static GitHub Pages routes survive direct entry, refresh, links and missing paths", async ({
  page,
  request,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (e) => failures.push(e.message));
  page.on("requestfailed", (r) => failures.push(r.url()));
  page.on("response", (r) => {
    if (r.status() >= 400 && !r.url().includes("missing-route"))
      failures.push(`${r.status()} ${r.url()}`);
  });
  for (const p of manifest.pages) {
    const url = base + p.destination;
    await page.goto(url);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const title = await page.title();
    expect(title).not.toBe("Page not found | Found42");
    await page.reload();
    await expect(page).toHaveTitle(title);
    const html = await (await request.get(url)).text();
    expect(html).toContain('<main id="main">');
    expect(html).toContain("noindex");
    const links = await page
      .locator("a")
      .evaluateAll((links) => links.map((a) => a.href));
    for (const href of new Set(links)) {
      expect(href).not.toContain("lovable.app");
      if (href.startsWith(base)) {
        const response = await request.get(href.split("#")[0]);
        expect(response.status(), href).toBe(200);
      }
    }
    if (p.destination !== "/") {
      const response = await request.get(base + p.destination.slice(0, -1), {
        maxRedirects: 0,
      });
      expect(response.status()).toBe(301);
    }
  }
  const missing = await page.goto(base + "/missing-route");
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Page not found.",
  );
  await page.goto(base + "/resources/");
  await page
    .getByRole("link", { name: "Services", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(base + "/services/");
  await page.goBack();
  await expect(page).toHaveURL(base + "/resources/");
  await page.goForward();
  await expect(page).toHaveURL(base + "/services/");
  expect(failures).toEqual([]);
});

test("prerendered content survives script failure and forms cannot submit accidentally", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(base + "/resources/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Start with the work.",
  );
  // No active local email form remains: the playbook, verified lesson and
  // toolkit each open their published destination, while unavailable items
  // stay honest and the consultation uses the live contact route.
  await expect(
    page.getByRole("link", { name: /Request the published AI Failure Modes/ }),
  ).toHaveAttribute(
    "href",
    "https://www.found42.com/ai-failure-modes-playbook",
  );
  await expect(page.locator("#library form")).toHaveCount(0);
  await page.goto(base + "/");
  // The prerendered homepage leaves every service and testimonial readable.
  await expect(page.locator(".ah-service-panel")).toHaveCount(3);
  for (const panel of await page.locator(".ah-service-panel").all())
    await expect(panel).toBeVisible();
  await expect(page.locator(".ah-quote")).toHaveCount(5);
  await page.goto(base + "/about/");
  await expect(
    page.getByText(
      "As a board advisor and fractional GTM lead, he has supported lean start-ups in the US, EMEA, and APAC.",
    ),
  ).toBeVisible();
  await context.close();
});

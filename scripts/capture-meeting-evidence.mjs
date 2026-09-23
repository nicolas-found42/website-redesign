/**
 * Public browser evidence; no live forms are submitted. Not part of dist.
 *
 * Historical: this records the September 16 site, whose resources page loaded
 * ScoreApp in an iframe on request. The scorecard is now answered on the page,
 * so run this against a checkout of 04beea4 to reproduce that evidence.
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base =
  process.env.EVIDENCE_URL || "http://127.0.0.1:4179/website-redesign/";
const group = process.env.EVIDENCE_GROUP || "after";
const dir = `artifacts/meeting-2026-09-16/${group}`;
await mkdir(dir, { recursive: true });
const b = await chromium.launch();
const report = [];
try {
  for (const [width, height] of [
    [1440, 900],
    [1366, 768],
    [768, 1024],
    [390, 844],
    [320, 844],
  ]) {
    const page = await b.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const route of [
      "",
      "resources/",
      "services/",
      "industries/private-equity/",
      "industries/b2b-saas/",
      "about/",
      "blog/",
    ]) {
      const response = await page.goto(base + route);
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        scrollTo(0, 0);
      });
      const slug = route.replaceAll("/", "-").replace(/-$/, "") || "home";
      await page.screenshot({
        path: `${dir}/${slug}-${width}.png`,
        fullPage: true,
      });
      if (!route)
        await page.screenshot({ path: `${dir}/home-opening-${width}.png` });
      report.push({
        route,
        width,
        height,
        status: response.status(),
        title: await page.title(),
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        errors: [...errors],
      });
    }
    await page.goto(base + "resources/");
    await page.locator("[data-load-scorecard]").click();
    const frame = page.frameLocator("iframe.scorecard-frame");
    // Provider renders its landing markup before its start handler hydrates.
    await page.waitForTimeout(2500);
    await frame
      .getByText("Take the Scorecard", { exact: true })
      .first()
      .click({ timeout: 20000 });
    await frame
      .getByText("Enter your details below to start the scorecard", {
        exact: true,
      })
      .waitFor();
    await page.waitForTimeout(600);
    await frame.getByText("Enter your details below to start the scorecard", { exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${dir}/scorecard-gate-${width}.png` });
    report.push({
      interaction: "real ScoreApp lead gate opened without submission",
      width,
    });
    await page.locator(".workflow-preview summary").click();
    for (let step = 0; step < 4; step++)
      await page.locator("#assessment [data-answer]").last().click();
    await page
      .locator("#assessment")
      .screenshot({ path: `${dir}/workflow-preview-${width}.png` });
    await page.locator('[data-dialog="course"]').click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Start the course/ })
      .click();
    await page.screenshot({ path: `${dir}/course-validation-${width}.png` });
    await page.keyboard.press("Escape");
    if (width === 390) {
      await page.getByRole("button", { name: "Menu" }).click();
      await page.locator("nav summary").click();
      await page.screenshot({ path: `${dir}/mobile-menu.png` });
    }
    await page.close();
  }
  await writeFile(`${dir}/report.json`, JSON.stringify(report, null, 2) + "\n");
} finally {
  await b.close();
}

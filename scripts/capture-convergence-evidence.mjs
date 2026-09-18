/**
 * Browser evidence for the stand-up convergence work: the opening, the three
 * audience states, the failure-mode figure and a few frames of one scene being
 * told. Public pages only; no form is submitted. Not part of dist.
 *
 *   npm run build && npm run preview:pages
 *   node scripts/capture-convergence-evidence.mjs
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const base =
  process.env.EVIDENCE_URL || "http://127.0.0.1:4179/website-redesign/";
const dir = process.env.EVIDENCE_DIR || "artifacts/standup-convergence";
await mkdir(dir, { recursive: true });

const browser = await chromium.launch();
const report = [];
try {
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [320, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${dir}/home-opening-${width}.png` });
    await page.locator(".audience-stage").scrollIntoViewIfNeeded();
    for (const [index, id] of [
      "executives",
      "contributors",
      "builders",
    ].entries()) {
      await page.locator(`[data-audience="${index}"]`).click();
      await page.waitForTimeout(250);
      await page
        .locator("#audiences")
        .screenshot({ path: `${dir}/audience-${id}-${width}.png` });
    }
    await page.goto(base + "resources/#playbook");
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page
      .locator("#playbook")
      .screenshot({ path: `${dir}/playbook-${width}.png` });
    report.push({
      width,
      height,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      errors,
    });
    await page.close();
  }

  // Motion on: four frames of the builder scene being told after a choice.
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  await page.goto(base + "#audiences");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3500);
  await page.locator('[data-audience="2"]').click();
  let elapsed = 0;
  for (const at of [200, 900, 1800, 3200]) {
    await page.waitForTimeout(at - elapsed);
    elapsed = at;
    await page
      .locator(".audience-panel:not([hidden]) .audience-figure")
      .screenshot({ path: `${dir}/builders-frame-${at}ms.png` });
  }
  report.push({ interaction: "builder scene told after a choice", frames: 4 });
  await page.close();

  await writeFile(`${dir}/report.json`, JSON.stringify(report, null, 2) + "\n");
} finally {
  await browser.close();
}

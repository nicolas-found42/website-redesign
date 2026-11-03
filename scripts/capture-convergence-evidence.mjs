/**
 * Browser evidence for the stand-up convergence work: the opening, the three
 * audience states, the failure-mode figure and a few frames of one scene being
 * told. Public pages only; no form is submitted. Not part of dist.
 *
 *   npm run build && npm run preview:pages
 *   node scripts/capture-convergence-evidence.mjs
 */
import {
  capturePages,
  openPage,
  overflow,
  shoot,
  shootElement,
  visit,
} from "./lib/capture.mjs";

const base =
  process.env.EVIDENCE_URL || "http://127.0.0.1:4179/website-redesign/current/";
const dir = process.env.EVIDENCE_DIR || "artifacts/standup-convergence";

await capturePages({
  dir,
  viewports: [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
    [320, 844],
  ],
  reducedMotion: "reduce",
  async each({ page, viewport, errors }) {
    const { width, height } = viewport;
    await visit(page, base);
    await page.waitForTimeout(400);
    await shoot(page, `${dir}/home-opening-${width}.png`);
    await page.locator(".audience-stage").scrollIntoViewIfNeeded();
    for (const [index, id] of [
      "executives",
      "contributors",
      "builders",
    ].entries()) {
      await page.locator(`[data-audience="${index}"]`).click();
      await page.waitForTimeout(250);
      await shootElement(
        page,
        page.locator("#audiences"),
        `${dir}/audience-${id}-${width}.png`,
      );
    }
    await visit(page, `${base}resources/#playbook`);
    await page.waitForTimeout(400);
    await shootElement(
      page,
      page.locator("#playbook"),
      `${dir}/playbook-${width}.png`,
    );
    return { width, height, overflow: await overflow(page), errors };
  },
  async afterAll({ browser, entries }) {
    // Motion on: four frames of the builder scene being told after a choice.
    const { context, page } = await openPage(browser, {
      viewport: { width: 1440, height: 900 },
    });
    try {
      await visit(page, `${base}#audiences`);
      await page.waitForTimeout(3500);
      await page.locator('[data-audience="2"]').click();
      let elapsed = 0;
      for (const at of [200, 900, 1800, 3200]) {
        await page.waitForTimeout(at - elapsed);
        elapsed = at;
        await shootElement(
          page,
          page.locator(".audience-panel:not([hidden]) .audience-figure"),
          `${dir}/builders-frame-${at}ms.png`,
        );
      }
      entries.push({
        interaction: "builder scene told after a choice",
        frames: 4,
      });
    } finally {
      await context.close();
    }
  },
});

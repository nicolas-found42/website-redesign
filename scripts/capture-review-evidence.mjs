/**
 * Review evidence only; never imported by or published with the website.
 *
 * Captures the parts of the preview the September 29 review changed — the
 * opening, the organization row, each audience choice with its scene, the
 * Workshops drawing and the review figure on Resources — at the two feedback
 * phone sizes and on a desktop, so the page before and after the change can be
 * compared shot for shot.
 *
 *   node scripts/capture-review-evidence.mjs <origin> <out-dir>
 *
 * `origin` is the site root with its base path, for example
 * `http://127.0.0.1:4173/`. Pages are captured under reduced motion, so every
 * drawing is at rest. Shots of parts a version does not have are skipped.
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const [origin, out] = process.argv.slice(2);
if (!origin || !out) {
  console.error("usage: capture-review-evidence.mjs <origin> <out-dir>");
  process.exit(1);
}
const root = origin.endsWith("/") ? origin : `${origin}/`;

const viewports = [
  { name: "phone-384x742", width: 384, height: 742, scale: 2 },
  { name: "phone-384x686", width: 384, height: 686, scale: 2 },
  { name: "desktop-1440", width: 1440, height: 900, scale: 1 },
];
const audiences = [
  ["executives", "C-level executives"],
  ["contributors", "individual contributors"],
  ["builders", "AI builders"],
];

const settle = (page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });

const browser = await chromium.launch();
try {
  await mkdir(out, { recursive: true });
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.scale,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const shoot = async (locator, name) => {
      if (!(await locator.count())) return;
      await locator.first().scrollIntoViewIfNeeded();
      await settle(page);
      await locator.first().screenshot({
        path: `${out}/${viewport.name}-${name}.png`,
        // The target can be taller than a phone viewport. Keep the fixed
        // header out of its cropped evidence image while preserving the target.
        style: ".site-header, .skip-link { visibility: hidden !important; }",
      });
    };

    await page.goto(root);
    await settle(page);
    await page.screenshot({ path: `${out}/${viewport.name}-opening.png` });
    await shoot(page.locator("#companies"), "organizations");

    for (const [id, name] of audiences) {
      await page
        .getByRole("button", { name: new RegExp(name, "i") })
        .first()
        .click();
      await settle(page);
      await shoot(page.locator(".audience-stage"), `audience-${id}`);
    }

    await shoot(
      viewport.width < 900
        ? page.locator("#service-training .service-figure")
        : page.locator(".services-art"),
      "workshops",
    );

    await page.goto(`${root}resources/`);
    await settle(page);
    await shoot(page.locator(".review-figure"), "resources-review");
    await context.close();
  }
} finally {
  await browser.close();
}

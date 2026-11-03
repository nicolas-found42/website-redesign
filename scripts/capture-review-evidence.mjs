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
import { capturePages, shoot, shootElement, visit } from "./lib/capture.mjs";

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

await capturePages({
  dir: out,
  report: null,
  viewports,
  reducedMotion: "reduce",
  async each({ page, viewport }) {
    const capture = (locator, name) =>
      shootElement(page, locator, `${out}/${viewport.name}-${name}.png`, {
        first: true,
        settle: true,
        // The target can be taller than a phone viewport. Keep the fixed
        // header out of its cropped evidence image while preserving the target.
        style: ".site-header, .skip-link { visibility: hidden !important; }",
      });

    await visit(page, root);
    await shoot(page, `${out}/${viewport.name}-opening.png`);
    await capture(page.locator("#companies"), "organizations");

    for (const [id, name] of audiences) {
      await page
        .getByRole("button", { name: new RegExp(name, "i") })
        .first()
        .click();
      await capture(page.locator(".audience-stage"), `audience-${id}`);
    }

    await capture(
      viewport.width < 900
        ? page.locator("#service-training .service-figure")
        : page.locator(".services-art"),
      "workshops",
    );

    await visit(page, `${root}resources/`);
    await capture(page.locator(".review-figure"), "resources-review");
  },
});

/**
 * Public browser evidence; no live forms are submitted. Not part of dist.
 *
 * Historical: this records the September 16 site, whose resources page loaded
 * ScoreApp in an iframe on request. The scorecard is now answered on the page,
 * so run this against a checkout of 04beea4 to reproduce that evidence.
 */
import {
  capturePages,
  overflow,
  shoot,
  shootElement,
  visit,
} from "./lib/capture.mjs";

const base =
  process.env.EVIDENCE_URL || "http://127.0.0.1:4179/website-redesign/current/";
const group = process.env.EVIDENCE_GROUP || "after";
const dir = `artifacts/meeting-2026-09-16/${group}`;
const routes = [
  "",
  "resources/",
  "services/",
  "industries/private-equity/",
  "industries/b2b-saas/",
  "about/",
  "blog/",
].map((path) => ({
  path,
  slug: path.replaceAll("/", "-").replace(/-$/, "") || "home",
}));

await capturePages({
  dir,
  viewports: [
    [1440, 900],
    [1366, 768],
    [768, 1024],
    [390, 844],
    [320, 844],
  ],
  reducedMotion: "reduce",
  routes,
  async each({ page, viewport, errors, route }) {
    const response = await visit(page, base + route.path, {
      sweep: { heightFrom: "body" },
    });
    await shoot(page, `${dir}/${route.slug}-${viewport.width}.png`, {
      fullPage: true,
    });
    if (!route.path)
      await shoot(page, `${dir}/home-opening-${viewport.width}.png`);
    return {
      route: route.path,
      width: viewport.width,
      height: viewport.height,
      status: response.status(),
      title: await page.title(),
      overflow: await overflow(page),
      errors: [...errors],
    };
  },
  async afterRoutes({ page, viewport }) {
    await page.goto(`${base}resources/`);
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
    await frame
      .getByText("Enter your details below to start the scorecard", {
        exact: true,
      })
      .scrollIntoViewIfNeeded();
    await shoot(page, `${dir}/scorecard-gate-${viewport.width}.png`);
    await page.locator(".workflow-preview summary").click();
    for (let step = 0; step < 4; step++)
      await page.locator("#assessment [data-answer]").last().click();
    await shootElement(
      page,
      page.locator("#assessment"),
      `${dir}/workflow-preview-${viewport.width}.png`,
    );
    await page.locator('[data-dialog="course"]').click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Start the course/ })
      .click();
    await shoot(page, `${dir}/course-validation-${viewport.width}.png`);
    await page.keyboard.press("Escape");
    if (viewport.width === 390) {
      await page.getByRole("button", { name: "Menu" }).click();
      await page.locator("nav summary").click();
      await shoot(page, `${dir}/mobile-menu.png`);
    }
    return {
      interaction: "real ScoreApp lead gate opened without submission",
      width: viewport.width,
    };
  },
});

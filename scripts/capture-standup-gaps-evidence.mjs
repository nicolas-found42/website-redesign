/**
 * Browser evidence for the stand-up follow-up: the services sequence on a
 * phone (the rail under the header, one article's drawing arriving), the
 * homepage's playbook figure, the converged audience panels and industries
 * strip, and the scorecard answered on the page. Public pages only; the
 * scorecard sends nothing and no form is submitted. Not part of dist.
 *
 *   npm run build && npm run preview:pages
 *   node scripts/capture-standup-gaps-evidence.mjs
 */
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const base =
  process.env.EVIDENCE_URL || "http://127.0.0.1:4179/website-redesign/";
const dir = process.env.EVIDENCE_DIR || "artifacts/standup-gaps/2026-09-23";
await mkdir(dir, { recursive: true });

const browser = await chromium.launch();
const report = [];
try {
  for (const [width, height] of [
    [1440, 900],
    [768, 1024],
    [390, 844],
    [320, 700],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    const shot = async (selector, name) => {
      const element = page.locator(selector).first();
      await element.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      await element.screenshot({ path: `${dir}/${name}-${width}.png` });
    };
    await shot("#resources .resource--figure", "home-playbook");
    await page.locator('[data-audience="2"]').click();
    await shot("#audience-builders", "audience-builders");
    await shot(".services-foot", "services-foot");
    const homeOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );

    await page.goto(base + "resources/#scorecard");
    await page.evaluate(() => document.fonts.ready);
    await shot("#scorecard", "scorecard-question");
    const app = page.locator("#scorecard-app");
    for (const yes of [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1])
      await app
        .getByRole("button", { name: yes ? "Yes" : "No", exact: true })
        .click();
    await app.locator("textarea").fill("Weekly portfolio update");
    await app.getByRole("button", { name: /See my result/ }).click();
    await shot("#scorecard-app", "scorecard-result");
    report.push({
      width,
      height,
      overflow:
        homeOverflow ||
        (await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )),
      stage: await app.locator("h3").innerText(),
      errors,
    });
    await page.close();
  }

  // Motion on, at phone width: the rail under the header, and the second
  // article's drawing as it comes on screen and after it has arrived.
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const phoneErrors = [];
  page.on("pageerror", (error) => phoneErrors.push(error.message));
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  const place = (share) =>
    page.evaluate((share) => {
      const figure = document.querySelectorAll(".service-figure")[1];
      const box = figure.getBoundingClientRect();
      window.scrollTo({
        top: scrollY + box.top - innerHeight + box.height * share,
        behavior: "instant",
      });
    }, share);
  const labels = () =>
    page.evaluate(() =>
      [
        ...document
          .querySelectorAll(".service-figure")[1]
          .querySelectorAll(".system-label"),
      ].map((label) => label.textContent),
    );
  await place(0.3);
  await page.waitForTimeout(300);
  const approaching = await labels();
  await page.screenshot({ path: `${dir}/phone-services-approach.png` });
  await place(1);
  await page.waitForTimeout(1600);
  const arrived = await labels();
  await page.screenshot({ path: `${dir}/phone-services-arrived.png` });
  report.push({
    interaction: "phone: the Workflows drawing arrives from Workshops",
    approaching,
    arrived,
    overflow: await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    errors: phoneErrors,
  });
  await page.close();

  await writeFile(`${dir}/report.json`, JSON.stringify(report, null, 2) + "\n");
} finally {
  await browser.close();
}

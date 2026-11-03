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
const dir = process.env.EVIDENCE_DIR || "artifacts/standup-gaps/2026-09-23";

await capturePages({
  dir,
  viewports: [
    [1440, 900],
    [768, 1024],
    [390, 844],
    [320, 700],
  ],
  reducedMotion: "reduce",
  async each({ page, viewport, errors }) {
    const { width, height } = viewport;
    await visit(page, base);
    const shot = (selector, name) =>
      shootElement(
        page,
        page.locator(selector).first(),
        `${dir}/${name}-${width}.png`,
        { wait: 200 },
      );
    await shot("#resources .resource--figure", "home-playbook");
    await page.locator('[data-audience="2"]').click();
    await shot("#audience-builders", "audience-builders");
    await shot(".services-foot", "services-foot");
    const homeOverflow = await overflow(page);

    await visit(page, `${base}resources/#scorecard`);
    await shot("#scorecard", "scorecard-question");
    const app = page.locator("#scorecard-app");
    for (const yes of [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1])
      await app
        .getByRole("button", { name: yes ? "Yes" : "No", exact: true })
        .click();
    await app.locator("textarea").fill("Weekly portfolio update");
    await app.getByRole("button", { name: /See my result/ }).click();
    await shot("#scorecard-app", "scorecard-result");
    return {
      width,
      height,
      overflow: homeOverflow || (await overflow(page)),
      stage: await app.locator("h3").innerText(),
      errors,
    };
  },
  async afterAll({ browser, entries }) {
    // Motion on, at phone width: the rail under the header, and the second
    // article's drawing as it comes on screen and after it has arrived.
    const { context, page, errors } = await openPage(browser, {
      viewport: { width: 390, height: 844 },
    });
    try {
      await visit(page, base);
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
      await shoot(page, `${dir}/phone-services-approach.png`);
      await place(1);
      await page.waitForTimeout(1600);
      const arrived = await labels();
      await shoot(page, `${dir}/phone-services-arrived.png`);
      entries.push({
        interaction: "phone: the Workflows drawing arrives from Workshops",
        approaching,
        arrived,
        overflow: await overflow(page),
        errors,
      });
    } finally {
      await context.close();
    }
  },
});

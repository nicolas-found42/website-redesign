/** Review evidence only; never imported by or published with the website. */
import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch();
const root = "artifacts/lovable-migration/2026-09-16";
const metrics = [];
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width === 390 ? 844 : 1000 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    for (const [group, origin, routes] of [
      [
        "destination",
        "http://127.0.0.1:4179/website-redesign",
        [
          "",
          "resources",
          "services",
          "industries/private-equity",
          "industries/b2b-saas",
          "about",
          "blog",
        ],
      ],
      [
        "source",
        "https://found42-claude-lab.lovable.app",
        [
          "",
          "resources",
          "services",
          "industries/private-equity",
          "industries/b2b-saas",
          "about",
          "blog",
        ],
      ],
      ["baseline", "https://nicolas-found42.github.io/website-redesign", [""]],
      ["baseline", "http://127.0.0.1:4181", [""]],
    ]) {
      for (const route of routes) {
        await page.goto(origin + "/" + route + (route ? "/" : ""), {
          waitUntil: "networkidle",
        });
        await page.evaluate(() => document.fonts.ready);
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
            scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 40));
          }
          scrollTo(0, 0);
        });
        const slug =
          group === "baseline"
            ? origin.includes("4181")
              ? "local"
              : "deployed"
            : route.replaceAll("/", "-") || "home";
        await page.screenshot({
          path: `${root}/${group}/${slug}-${width}.png`,
          fullPage: true,
        });
        await page.screenshot({
          path: `${root}/${group}/${slug}-opening-${width}.png`,
        });
        metrics.push({
          group,
          route,
          width,
          ...(await page.evaluate(() => ({
            height: innerHeight,
            documentHeight: document.documentElement.scrollHeight,
            documentWidth: document.documentElement.scrollWidth,
            h1: document.querySelector("h1")?.textContent,
          }))),
        });
      }
    }
    await page.goto("http://127.0.0.1:4179/website-redesign/resources/");
    for (const [choice, label] of [
      [0, "clarify"],
      [1, "guardrails"],
      [2, "strong"],
    ]) {
      for (let step = 0; step < 4; step++)
        await page.locator("#assessment [data-answer]").nth(choice).click();
      await page
        .locator("#assessment")
        .screenshot({
          path: `${root}/destination/assessment-${label}-${width}.png`,
        });
      await page.getByRole("button", { name: "Retake", exact: true }).click();
    }
    await page.locator('[data-dialog="course"]').click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Start the course/ })
      .click();
    await page.screenshot({
      path: `${root}/destination/course-error-${width}.png`,
    });
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /Talk to our team/ }).click();
    await page.getByRole("button", { name: "Review inquiry" }).click();
    await page.screenshot({
      path: `${root}/destination/inquiry-error-${width}.png`,
    });
    await page.keyboard.press("Escape");
    if (width === 390) {
      await page.goto(
        "http://127.0.0.1:4179/website-redesign/industries/private-equity/",
      );
      await page.locator(".industry-grid").scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: "Menu" }).click();
      await page.getByRole("navigation").locator("summary").click();
      await page.screenshot({
        path: `${root}/destination/mobile-menu-${width}.png`,
      });
    }
    await context.close();
  }
  await writeFile(
    `${root}/capture-metrics.json`,
    JSON.stringify(metrics, null, 2) + "\n",
  );
} finally {
  await browser.close();
}

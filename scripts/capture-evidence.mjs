/** Review evidence only; never imported by or published with the website. */
import { capturePages, shoot, shootElement, visit } from "./lib/capture.mjs";

const root = "artifacts/lovable-migration/2026-09-16";
const destination = "http://127.0.0.1:4179/website-redesign/current";
const routes = [
  [
    "destination",
    destination,
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
].flatMap(([group, origin, paths]) =>
  paths.map((route) => ({
    group,
    route,
    url: `${origin}/${route}${route ? "/" : ""}`,
    slug:
      group === "baseline"
        ? origin.includes("4181")
          ? "local"
          : "deployed"
        : route.replaceAll("/", "-") || "home",
  })),
);

await capturePages({
  dir: root,
  report: "capture-metrics.json",
  viewports: [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 },
  ],
  reducedMotion: "reduce",
  routes,
  async each({ page, viewport, route }) {
    await visit(page, route.url, {
      waitUntil: "networkidle",
      sweep: { heightFrom: "body" },
    });
    await shoot(
      page,
      `${root}/${route.group}/${route.slug}-${viewport.width}.png`,
      { fullPage: true },
    );
    await shoot(
      page,
      `${root}/${route.group}/${route.slug}-opening-${viewport.width}.png`,
    );
    return {
      group: route.group,
      route: route.route,
      width: viewport.width,
      ...(await page.evaluate(() => ({
        height: innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        documentWidth: document.documentElement.scrollWidth,
        h1: document.querySelector("h1")?.textContent,
      }))),
    };
  },
  async afterRoutes({ page, viewport }) {
    const { width } = viewport;
    await page.goto(`${destination}/resources/`);
    for (const [choice, label] of [
      [0, "clarify"],
      [1, "guardrails"],
      [2, "strong"],
    ]) {
      for (let step = 0; step < 4; step++)
        await page.locator("#assessment [data-answer]").nth(choice).click();
      await shootElement(
        page,
        page.locator("#assessment"),
        `${root}/destination/assessment-${label}-${width}.png`,
      );
      await page.getByRole("button", { name: "Retake", exact: true }).click();
    }
    await page.locator('[data-dialog="course"]').click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /Start the course/ })
      .click();
    await shoot(page, `${root}/destination/course-error-${width}.png`);
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /Talk to our team/ }).click();
    await page.getByRole("button", { name: "Review inquiry" }).click();
    await shoot(page, `${root}/destination/inquiry-error-${width}.png`);
    await page.keyboard.press("Escape");
    if (width === 390) {
      await page.goto(`${destination}/industries/private-equity/`);
      await page.locator(".industry-grid").scrollIntoViewIfNeeded();
      await page.getByRole("button", { name: "Menu" }).click();
      await page.getByRole("navigation").locator("summary").click();
      await shoot(page, `${root}/destination/mobile-menu-${width}.png`);
    }
  },
});

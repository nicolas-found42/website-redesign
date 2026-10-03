import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
const browser = await chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 2 });
const evidence = [];
const scenes = [
  [
    "workflows",
    "Workflows",
    "#service-automation .service-figure .system-field",
    ".services-art .system-field",
  ],
  [
    "automations",
    "Automations",
    "#service-product .service-figure .system-field",
    ".services-art .system-field",
  ],
  [
    "executives",
    "C-level executives",
    "#audience-executives .scene-field",
    '.audience-art [data-audience-scene="0"] .scene-field',
  ],
  [
    "contributors",
    "Individual Contributors and Teams",
    "#audience-contributors .scene-field",
    '.audience-art [data-audience-scene="1"] .scene-field',
  ],
  [
    "builders",
    "AI builders",
    "#audience-builders .scene-field",
    '.audience-art [data-audience-scene="2"] .scene-field',
  ],
];
for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({
    reducedMotion: width === 1440 ? "no-preference" : "reduce",
  });
  for (const [id, name, narrow, wide] of scenes) {
    await page.goto("http://127.0.0.1:4183/");
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole("button", { name, exact: true }).click();
    const field = page.locator(width === 1440 ? wide : narrow);
    await field.scrollIntoViewIfNeeded();
    await page.waitForFunction(
      (selector) => {
        const field = document.querySelector(selector);
        return (
          field &&
          !field
            .getAnimations({ subtree: true })
            .some((a) => a.playState === "running")
        );
      },
      width === 1440 ? wide : narrow,
    );
    await field.evaluate((field) => {
      const w = field.getBoundingClientRect().width;
      const clone = field.cloneNode(true);
      const wrap = document.createElement("div");
      wrap.className = "system";
      wrap.style.cssText = `width:${w}px; margin:0;`;
      wrap.dataset.scene =
        field.closest("[data-scene]")?.getAttribute("data-scene") ?? "";
      wrap.append(clone);
      document.body.replaceChildren(wrap);
      document.body.style.cssText = "min-height:0; height:auto; padding:0;";
    });
    await page.locator(".system-field").screenshot({
      path: new URL(`./${id}-${width}.png`, import.meta.url).pathname,
    });
    evidence.push({
      id,
      width,
      ...(await page.locator(".system-field").evaluate((field) => ({
        viewBox: field.querySelector("svg").getAttribute("viewBox"),
        labels: [...field.querySelectorAll(".system-label")].map((l) => ({
          key: l.dataset.node,
          text: l.textContent.trim(),
        })),
        links: [
          ...new Set(
            [...field.querySelectorAll("[data-links]")].flatMap((p) =>
              p.dataset.links.split(" "),
            ),
          ),
        ].sort(),
        overflow: document.documentElement.scrollWidth > innerWidth,
      }))),
    });
  }
}
await writeFile(
  new URL("./captures.json", import.meta.url),
  JSON.stringify(evidence, null, 2) + "\n",
);
await browser.close();

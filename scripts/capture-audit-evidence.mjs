/**
 * Site-audit evidence: every route at the audit viewport matrix, with
 * page-level overflow, elements that reach past the viewport, console errors,
 * failed requests and small targets recorded to `report.json`. Viewport and
 * full-page captures are written per route and width. Public pages only; no
 * form is submitted and no external frame is loaded. Not part of dist.
 *
 *   npm run build && npm run preview:pages
 *   AUDIT_DIR=artifacts/site-audit/<stamp>/before node scripts/capture-audit-evidence.mjs
 *
 * AUDIT_ENGINE picks chromium (default), firefox or webkit.
 */
import { capturePages, overflow, shoot, sweep, visit } from "./lib/capture.mjs";

const base =
  process.env.AUDIT_URL || "http://127.0.0.1:4179/website-redesign/current/";
const dir = process.env.AUDIT_DIR || "artifacts/site-audit/latest";
const engine = process.env.AUDIT_ENGINE || "chromium";
const full = process.env.AUDIT_FULL !== "0";

const routes = [
  ["home", ""],
  ["resources", "resources/"],
  ["services", "services/"],
  ["private-equity", "industries/private-equity/"],
  ["b2b-saas", "industries/b2b-saas/"],
  ["about", "about/"],
  ["blog", "blog/"],
  ["missing", "no-such-page/"],
].map(([name, path]) => ({ name, path }));
const viewports = (
  process.env.AUDIT_VIEWPORTS ||
  "320x640,390x844,430x932,768x1024,1024x768,1440x900"
)
  .split(",")
  .map((size) => size.split("x").map(Number));

const report = await capturePages({
  engine,
  dir,
  viewports,
  routes,
  isolateRoutes: true,
  async each({ page, viewport, route, errors }) {
    const failed = [];
    // The missing route is meant to answer 404; its document's own console
    // entry is expected. Every other console error, including a failed
    // script or asset on that page, is still reported.
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const source = message.location().url ?? "";
      const expected =
        route.name === "missing" &&
        /status of 404/.test(message.text()) &&
        new URL(source, base).pathname.endsWith("/no-such-page/");
      if (!expected) errors.push(message.text());
    });
    page.on("requestfailed", (request) =>
      failed.push(`${request.url()} ${request.failure()?.errorText}`),
    );
    page.on("response", (response) => {
      if (response.status() >= 400 && !response.url().includes("no-such-page"))
        failed.push(`${response.status()} ${response.url()}`);
    });
    await visit(page, base + route.path);
    await page.waitForTimeout(1600);
    await shoot(page, `${dir}/${route.name}-${viewport.width}-top.png`);
    // Walk the page so every entrance plays before the full capture.
    await sweep(page, {
      step: 0.7,
      pause: 140,
      bottom: true,
      reset: false,
    });
    await page.waitForTimeout(900);
    const measures = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const outside = [];
      for (const el of document.querySelectorAll("body *")) {
        const style = getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden") continue;
        if (el.closest("svg") && el.tagName !== "svg") continue;
        const box = el.getBoundingClientRect();
        if (!box.width || !box.height) continue;
        // Something inside a clipping ancestor cannot move the page.
        let clipped = false;
        for (
          let p = el.parentElement;
          p && p !== document.body;
          p = p.parentElement
        ) {
          const o = getComputedStyle(p);
          if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) {
            clipped = true;
            break;
          }
        }
        if (!clipped && (box.right > vw + 1 || box.left < -1))
          outside.push(
            `${el.tagName.toLowerCase()}.${[...el.classList].join(".")} ${Math.round(box.left)}→${Math.round(box.right)}`,
          );
      }
      const small = [];
      for (const el of document.querySelectorAll(
        "a[href], button, summary, input, textarea",
      )) {
        const box = el.getBoundingClientRect();
        if (!box.width || getComputedStyle(el).visibility === "hidden")
          continue;
        if (
          el.closest("#navigation") &&
          !el.closest("#navigation").checkVisibility()
        )
          continue;
        if (box.height < 24 || box.width < 24)
          small.push(
            `${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40)}" ${Math.round(box.width)}×${Math.round(box.height)}`,
          );
      }
      return {
        scrollWidth: document.documentElement.scrollWidth,
        outside: outside.slice(0, 20),
        small: small.slice(0, 20),
        hiddenReveals: [
          ...document.querySelectorAll("[data-reveal],[data-reveal-lines]"),
        ].filter((el) => getComputedStyle(el).opacity === "0").length,
      };
    });
    const pageOverflow = await overflow(page, { against: "client" });
    if (full) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await shoot(page, `${dir}/${route.name}-${viewport.width}-full.png`, {
        fullPage: true,
      });
    }
    return {
      route: "/" + route.path,
      width: viewport.width,
      height: viewport.height,
      overflow: pageOverflow,
      ...measures,
      errors,
      failed,
    };
  },
});

const problems = report.filter(
  (r) =>
    r.overflow ||
    r.outside.length ||
    r.errors.length ||
    r.failed.length ||
    r.hiddenReveals,
);
console.log(`${report.length} captures, ${problems.length} with problems`);
for (const r of problems) console.log(JSON.stringify(r));

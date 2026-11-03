/**
 * Shared Playwright scaffold for the manual `capture-*.mjs` evidence scripts.
 * Owns the browser lifecycle, the viewport matrix, page creation, the font and
 * animation settle, the full-page scroll sweep, overflow measurement,
 * page-error collection, screenshots and report writing. Each entry script
 * keeps only its routes, selectors, viewports and output paths.
 *
 * Review evidence only; never imported by or published with the website.
 */
import { chromium, firefox, webkit } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const engines = { chromium, firefox, webkit };

const normalizeViewport = (viewport) =>
  Array.isArray(viewport)
    ? { width: viewport[0], height: viewport[1] }
    : { ...viewport };

/** Resolve once webfonts are loaded and two animation frames have passed. */
export const settle = (page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });

/**
 * Walk the page so every entrance plays, then return to the top.
 *
 * `step` is a viewport fraction, or `"viewport"` for one full screen at a
 * time. `heightFrom` matches the scroll height the original scripts read.
 */
export const sweep = (
  page,
  {
    step = "viewport",
    pause = 40,
    heightFrom = "document",
    bottom = false,
    reset = true,
  } = {},
) =>
  page.evaluate(
    async ({ step, pause, heightFrom, bottom, reset }) => {
      const height = (
        heightFrom === "body" ? document.body : document.documentElement
      ).scrollHeight;
      const stride =
        step === "viewport"
          ? innerHeight
          : Math.max(1, Math.round(innerHeight * step));
      for (let y = 0; y < height; y += stride) {
        scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, pause));
      }
      if (bottom) scrollTo(0, document.documentElement.scrollHeight);
      if (reset) scrollTo(0, 0);
    },
    { step, pause, heightFrom, bottom, reset },
  );

/** Whether the document scrolls past the viewport (or the client) width. */
export const overflow = (page, { against = "viewport" } = {}) =>
  page.evaluate(
    (against) =>
      document.documentElement.scrollWidth >
      (against === "client"
        ? document.documentElement.clientWidth
        : innerWidth),
    against,
  );

/** Navigate, wait for fonts and frames, and optionally run the scroll sweep. */
export async function visit(
  page,
  url,
  { waitUntil = "load", sweep: sweepOptions = false } = {},
) {
  const response = await page.goto(url, { waitUntil });
  await settle(page);
  if (sweepOptions)
    await sweep(page, sweepOptions === true ? {} : sweepOptions);
  return response;
}

/** Screenshot the page, optionally after another settle. */
export async function shoot(
  page,
  path,
  { settle: shouldSettle = false, ...options } = {},
) {
  if (shouldSettle) await settle(page);
  await page.screenshot({ path, ...options });
}

/**
 * Scroll an element into view and screenshot it. `first` skips the shot when
 * the selector matches nothing; otherwise a missing or ambiguous target fails
 * as the original locator screenshot did.
 */
export async function shootElement(
  page,
  locator,
  path,
  { settle: shouldSettle = false, wait = 0, style, first = false } = {},
) {
  if (first) {
    if (!(await locator.count())) return false;
    locator = locator.first();
  }
  await locator.scrollIntoViewIfNeeded();
  if (shouldSettle) await settle(page);
  if (wait) await page.waitForTimeout(wait);
  await locator.screenshot({ path, ...(style ? { style } : {}) });
  return true;
}

/** Write one JSON report with the newline every capture script emits. */
export const writeReport = (dir, name, value) =>
  writeFile(`${dir}/${name}`, `${JSON.stringify(value, null, 2)}\n`);

/**
 * Open an isolated context and page, collecting uncaught page errors.
 * The caller closes `context`.
 */
export async function openPage(
  browser,
  { viewport, deviceScaleFactor, reducedMotion, recordVideo } = {},
) {
  const context = await browser.newContext({
    viewport,
    ...(deviceScaleFactor ? { deviceScaleFactor } : {}),
    ...(reducedMotion ? { reducedMotion } : {}),
    ...(recordVideo ? { recordVideo } : {}),
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return { context, page, errors };
}

/**
 * Run the shared scaffold over a viewport matrix.
 *
 * `each` runs once per viewport, or once per viewport × route when `routes` is
 * provided. Routes share a page unless `isolateRoutes` asks for a fresh
 * context per route. `afterRoutes` runs once per viewport after its routes;
 * `afterAll` runs once after the matrix and before the report is written.
 * `each` and `afterRoutes` receive `{ browser, dir, viewport, page, context,
 * errors }`; `afterAll` receives `{ browser, dir, entries }`. A hook may return
 * one report entry or an array of them.
 */
export async function capturePages({
  engine = "chromium",
  dir,
  viewports = [],
  routes = [null],
  isolateRoutes = false,
  reducedMotion,
  deviceScaleFactor,
  report = "report.json",
  each,
  afterRoutes,
  afterAll,
}) {
  const driver = engines[engine];
  if (!driver) throw new Error(`unknown browser engine: ${engine}`);
  const browser = await driver.launch();
  const entries = [];
  const add = (result) => {
    if (Array.isArray(result)) entries.push(...result);
    else if (result) entries.push(result);
  };
  try {
    if (dir) await mkdir(dir, { recursive: true });
    for (const viewport of viewports.map(normalizeViewport)) {
      const options = {
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.scale ?? deviceScaleFactor,
        reducedMotion: viewport.reducedMotion ?? reducedMotion,
      };
      if (isolateRoutes) {
        for (const route of routes) {
          const opened = await openPage(browser, options);
          try {
            add(await each({ browser, dir, viewport, route, ...opened }));
          } finally {
            await opened.context.close();
          }
        }
      } else {
        const opened = await openPage(browser, options);
        try {
          const shared = { browser, dir, viewport, ...opened };
          for (const route of routes) add(await each({ ...shared, route }));
          if (afterRoutes) add(await afterRoutes(shared));
        } finally {
          await opened.context.close();
        }
      }
    }
    if (afterAll) await afterAll({ browser, dir, entries });
    if (report) await writeReport(dir, report, entries);
    return entries;
  } finally {
    await browser.close();
  }
}

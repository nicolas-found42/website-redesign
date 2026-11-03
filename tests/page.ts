import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * The one page seam for browser tests. Specs describe what a visitor sees;
 * opening a page, waiting for entrances to settle, checking that nothing
 * overflows and running the accessibility audit all happen here, so a policy
 * change is one edit instead of one per spec.
 */

/** The Vite dev server for the baseline version. */
export const devBase = "http://127.0.0.1:4173";
/** The strict Pages preview the production specs exercise. */
export const previewOrigin = "http://127.0.0.1:4179";
/** Absolute preview URL of any version, without a trailing slash. */
export const previewBase = (slug: string) =>
  `${previewOrigin}/website-redesign/${slug}`;
export const productionBase = `${previewBase("current")}/`;
export const hubBase = `${previewOrigin}/website-redesign/`;

export const wcagTags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] as const;

export interface OpenOptions {
  /** Path relative to `base`, or an absolute URL. */
  path?: string;
  base?: string;
  width?: number;
  height?: number;
  reducedMotion?: "reduce" | "no-preference";
  waitUntil?: "load" | "domcontentloaded" | "networkidle";
  /** Leave entrances alone when the test is specifically observing them. */
  settle?: boolean;
}

/** Opens a page at the requested size and motion preference, then settles it. */
export async function open(
  page: Page,
  {
    path = "/",
    base = devBase,
    width,
    height = 900,
    reducedMotion = "reduce",
    waitUntil = "load",
    settle: shouldSettle = true,
  }: OpenOptions = {},
) {
  if (width) await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion });
  await page.goto(/^https?:/.test(path) ? path : `${base}${path}`, {
    waitUntil,
  });
  if (shouldSettle) await settle(page);
}

/**
 * Visits every reveal and waits for its real final state. A timed scroll sweep
 * can leave a viewport before WebKit delivers its intersection callback on a
 * busy runner, so each target is observed until it reveals, then every final
 * opacity is checked, without forcing state.
 */
export async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  const targets = await page.locator("[data-reveal]").all();
  for (const target of targets) {
    // Re-center while observing: earlier entrances can still move this target.
    await expect
      .poll(
        () =>
          target.evaluate((element) => {
            element.scrollIntoView({ block: "center", behavior: "instant" });
            return element.classList.contains("is-in");
          }),
        { timeout: 5000, intervals: [100] },
      )
      .toBe(true);
    // Do not serialize entrance durations: visit the next reveal while this
    // one animates, then verify every target's actual final opacity below.
  }
  await Promise.all(
    targets.map((target) => expect(target).toHaveCSS("opacity", "1")),
  );
  await expect(page.locator("[data-reveal]:not(.is-in)")).toHaveCount(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.evaluate(() => {
    const { promise, resolve } = Promise.withResolvers<void>();
    requestAnimationFrame(() => requestAnimationFrame(resolve));
    return promise;
  });
}

/** True when the document does not scroll sideways at the current width. */
export function fits(page: Page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  );
}

export interface AuditOptions {
  /** Restrict the scan to one subtree, as axe's `include` does. */
  include?: string;
  /** Audit only these rules instead of the shared WCAG tag set. */
  rules?: string[];
}

/** Runs the shared accessibility audit; violations are for the caller to assert. */
export function audit(page: Page, { include, rules }: AuditOptions = {}) {
  const builder = new AxeBuilder({ page });
  const scoped = include ? builder.include(include) : builder;
  const configured = rules
    ? scoped.withRules(rules)
    : scoped.withTags([...wcagTags]);
  return configured.analyze();
}

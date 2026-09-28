import { test, expect, type Page } from "@playwright/test";

/**
 * Regression checks for the second September 23 adversarial UX review: a
 * small-business owner on a phone. Each test is named for the GitHub issue it
 * closes and asserts what a visitor should experience instead of the friction
 * the review found.
 */

const phone = { width: 390, height: 844 };
const routes = [
  "/",
  "/resources/",
  "/services/",
  "/industries/private-equity/",
  "/industries/b2b-saas/",
  "/about/",
  "/blog/",
];

/** Scrolls the whole page so every reveal and drawing has settled. */
async function settle(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 700) {
    await page.evaluate((top) => scrollTo(0, top), y);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(400);
}

/**
 * Every visible text node against the first opaque ground behind it: 4.5:1,
 * or 3:1 for large type. Drawings and decorative (aria-hidden) text are left to
 * their own checks. Unlike axe, this runs after reveals have finished, so text
 * that only becomes visible on scroll is still measured.
 */
const lowContrastText = () => {
  const rgba = (value: string) => {
    const parts = value.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0];
    return parts.length === 3 ? [...parts, 1] : parts;
  };
  const luminance = ([r, g, b]: number[]) => {
    const channel = (v: number) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const ground = (element: Element) => {
    for (let node: Element | null = element; node; node = node.parentElement) {
      const colour = rgba(getComputedStyle(node).backgroundColor);
      if (colour[3] > 0.5) return colour;
    }
    return rgba(getComputedStyle(document.documentElement).backgroundColor);
  };
  const failures: string[] = [];
  for (const element of document.querySelectorAll("header *, main *, footer *")) {
    if (!element.checkVisibility({ opacityProperty: true, visibilityProperty: true }))
      continue;
    if (element.closest('svg, [aria-hidden="true"]')) continue;
    const ownText = [...element.childNodes].some(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent!.trim().length > 1,
    );
    if (!ownText) continue;
    const style = getComputedStyle(element);
    const [a, b] = [luminance(rgba(style.color)), luminance(ground(element))].sort(
      (x, y) => y - x,
    );
    const ratio = (a + 0.05) / (b + 0.05);
    const size = parseFloat(style.fontSize);
    const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
    if (ratio < (large ? 3 : 4.5))
      failures.push(
        `${ratio.toFixed(2)}:1 ${style.color} "${(element as HTMLElement).innerText.trim().slice(0, 40)}"`,
      );
  }
  return failures;
};

test("#45: every page's text is readable against its own ground", async ({ page }) => {
  test.slow();
  await page.setViewportSize(phone);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of routes) {
    await page.goto(route);
    await settle(page);
    expect(await page.evaluate(lowContrastText), route).toEqual([]);
  }
});

test("#45: the services section reads on paper, with a visible current choice", async ({
  page,
}) => {
  await page.setViewportSize(phone);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const services = page.locator("#services");
  await expect(services).not.toHaveAttribute("data-ground", "ink");
  await services.getByRole("heading", { name: "How we deliver our services" }).scrollIntoViewIfNeeded();
  await expect(page.locator(".site-header")).not.toHaveClass(/is-over-ink/);
  const pressed = services.locator('.choice[aria-pressed="true"]');
  await expect(pressed).toHaveText("Workshops");
  expect(
    await pressed.evaluate((el) => getComputedStyle(el).color),
  ).not.toBe(await page.evaluate(() => getComputedStyle(document.body).backgroundColor));
});

test("#46: a visitor can email or call Found42 without the form", async ({ page }) => {
  await page.setViewportSize(phone);
  await page.goto("/");
  await page.getByRole("button", { name: "Talk to our team" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("link", { name: "Email richard@found42.com" }),
  ).toHaveAttribute("href", "mailto:richard@found42.com");
  await expect(
    dialog.getByRole("link", { name: "Call (646) 300-1247" }),
  ).toHaveAttribute("href", "tel:+16463001247");
  await page.keyboard.press("Escape");
  const footer = page.locator(".site-footer");
  await expect(
    footer.getByRole("link", { name: "Email richard@found42.com" }),
  ).toHaveAttribute("href", "mailto:richard@found42.com");
  await expect(
    footer.getByRole("link", { name: "Call (646) 300-1247" }),
  ).toHaveAttribute("href", "tel:+16463001247");
});

test("#47: the opening explains a skill and the services show one everyday example", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-lead")).toContainText(
    "build tailored skills (saved instructions and examples Claude follows for one recurring job)",
  );
  const example = page.locator("#services .services-example");
  await expect(example.locator("li")).toHaveText([
    "A customer emails a purchase order.",
    "A Claude skill reads it and drafts the order entry.",
    "Your order desk checks the entry and approves it.",
  ]);
  await expect(example).toContainText("A hypothetical example, not a client result.");
});

test("#48: visitor-facing copy, resources, actions and annotations", async ({ page }) => {
  await page.setViewportSize(phone);
  await page.goto("/#audiences");
  await expect(page.locator("main")).not.toContainText("owner approval");

  const actions = page.locator(".hero-actions .action");
  await expect(actions.nth(0)).not.toHaveClass(/action--ghost/);
  await expect(actions.nth(1)).toHaveClass(/action--ghost/);
  // The dialog action's arrow points on, not out like the resources link's.
  const arrows = await actions.evaluateAll((els) =>
    els.map((el) => el.querySelector("svg")!.innerHTML),
  );
  expect(arrows[1]).not.toBe(arrows[0]);

  const sizes = await page
    .locator(".system-label")
    .evaluateAll((labels) =>
      labels
        .filter((label) => (label as HTMLElement).offsetParent)
        .map((label) => parseFloat(getComputedStyle(label).fontSize)),
    );
  expect(sizes.length).toBeGreaterThan(0);
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(13);

  await page.goto("/resources/");
  const ids = await page
    .locator("main section[id], .resources-later-head")
    .evaluateAll((nodes) => nodes.map((n) => n.id || "later"));
  expect(ids).toEqual(["scorecard", "toolkit", "playbook", "later", "library", "course", "contact"]);
  for (const id of ["library", "course"]) {
    const section = page.locator(`#${id}`);
    await expect(section.getByText(/^Unavailable ·/)).toHaveCount(1);
    await expect(section).not.toHaveClass(/on-ink/);
  }
});

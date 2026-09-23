import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Regression checks for the September 23 adversarial UX review. Each test is
 * named for the GitHub issue it closes and asserts what a visitor should
 * experience instead of the friction the review found.
 */

/** Replaces the clipboard so every engine reports what a copy would carry. */
const stubClipboard = (page: Page, accept: boolean) =>
  page.addInitScript((accept) => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text: string) => {
          (window as unknown as { copied: string }).copied = text;
          return accept
            ? Promise.resolve()
            : Promise.reject(new Error("denied"));
        },
      },
    });
  }, accept);

const fillInquiry = async (page: Page) => {
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Your name").fill("Richard Thornbury");
  await dialog.getByLabel("Work email").fill("richard@ashgrove.example");
  await dialog.getByLabel("Company").fill("Ashgrove Capital");
  await dialog
    .getByLabel("What should work better?")
    .fill("Diligence packs take my team three weeks.");
  return dialog;
};

test("#32: the inquiry dialog leads with the live form, and a checked draft can be copied into it", async ({
  page,
}) => {
  await stubClipboard(page, true);
  await page.goto("/industries/private-equity/");
  await page.getByRole("button", { name: /Talk to our team/ }).click();
  const dialog = page.getByRole("dialog");
  // The way that actually reaches Found42 is the primary action, ahead of the draft.
  const live = dialog.getByRole("link", { name: "Open the live inquiry form" });
  await expect(live).toHaveClass(/\baction\b/);
  await expect(live).toHaveAttribute("href", "https://www.found42.com/contact");
  const order = await dialog.evaluate((el) => {
    const link = el.querySelector("a.action")!;
    const form = el.querySelector("form")!;
    return (
      link.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
  expect(order).toBeTruthy();
  // The draft's own action says what it does; nothing promises a review.
  await expect(dialog.getByRole("button", { name: /Review/ })).toHaveCount(0);
  const copy = dialog.getByRole("button", { name: "Copy my message" });
  await expect(copy).toBeHidden();

  await fillInquiry(page);
  await dialog.getByRole("button", { name: "Check my draft" }).click();
  const status = dialog.locator(".form-status");
  await expect(status).toContainText("Nothing was sent");
  await copy.click();
  await expect(status).toHaveText(/Copied/);
  expect(await page.evaluate(() => (window as any).copied)).toBe(
    "Diligence packs take my team three weeks.",
  );
  await expect(
    dialog.getByRole("link", { name: "Go to the live form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  const result = await new AxeBuilder({ page })
    .include("dialog")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("#32: where the clipboard is refused, the dialog says how to copy by hand", async ({
  page,
}) => {
  await stubClipboard(page, false);
  await page.goto("/services/");
  await page.getByRole("button", { name: /Talk to our team/ }).click();
  const dialog = await fillInquiry(page);
  await dialog.getByRole("button", { name: "Check my draft" }).click();
  await dialog.getByRole("button", { name: "Copy my message" }).click();
  await expect(dialog.locator(".form-status")).toHaveText(
    /Select your message above and copy it/,
  );
});

/** WCAG relative-luminance contrast between two computed `rgb()` colours. */
const contrast = (a: string, b: string) => {
  const lum = (colour: string) => {
    const [r, g, bl] = colour
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map((v) => {
        const c = Number(v) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const routes = [
  "/",
  "/resources/",
  "/services/",
  "/industries/private-equity/",
  "/industries/b2b-saas/",
  "/about/",
  "/blog/",
];

test("#33: every filled action reads at 4.5:1 or better, at rest and on hover", async ({
  page,
}) => {
  // At rest an action reads on its own fill; on hover the fill that runs
  // across it (its ::before) is the ground, read with the hover type colour.
  const read = (el: Element, ground: "rest" | "hover") => ({
    text: (el as HTMLElement).innerText.trim(),
    color: getComputedStyle(el).color,
    ground:
      ground === "rest"
        ? getComputedStyle(el).backgroundColor
        : getComputedStyle(el, "::before").backgroundColor,
  });
  for (const route of routes) {
    await page.goto(route);
    const actions = page.locator(".action:not(.action--ghost)");
    let checked = 0;
    for (const action of await actions.all()) {
      if (!(await action.isVisible())) continue;
      await page.mouse.move(0, 0);
      const states = [await action.evaluate(read, "rest" as const)];
      await action.scrollIntoViewIfNeeded();
      await action.hover();
      states.push(await action.evaluate(read, "hover" as const));
      for (const state of states)
        expect(
          contrast(state.color, state.ground),
          `${route} "${state.text}": ${state.color} on ${state.ground}`,
        ).toBeGreaterThanOrEqual(4.5);
      checked++;
    }
    expect(checked, route).toBeGreaterThan(0);
  }
});

test("#34: every opening that names Claude says what Claude is, once", async ({
  page,
}) => {
  const named: string[] = [];
  for (const route of routes) {
    await page.goto(route);
    const opening = page.locator(".hero-copy, .page-opening > div").first();
    const says = `${await opening.locator("h1").innerText()} ${await opening.locator(".lead").innerText()}`;
    const glosses = opening.getByText("Claude is Anthropic’s AI assistant.");
    if (says.includes("Claude")) {
      named.push(route);
      await expect(glosses, route).toHaveCount(1);
      await expect(glosses, route).toBeVisible();
    } else await expect(glosses, route).toHaveCount(0);
  }
  // The homepage names it in its headline, the rest in their leads.
  expect(named).toEqual([
    "/",
    "/industries/private-equity/",
    "/industries/b2b-saas/",
    "/about/",
    "/blog/",
  ]);
});

test("#35: one preview notice per page replaces per-card disclaimers and team notes", async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto(route);
    // The notice opens every page's content and points to the live contact form.
    const note = page.locator("main > .preview-note");
    await expect(note, route).toHaveCount(1);
    expect(
      await page
        .locator("main")
        .evaluate((main) => main.firstElementChild?.className),
    ).toContain("preview-note");
    await expect(note.getByRole("link")).toHaveAttribute(
      "href",
      "https://www.found42.com/contact",
    );
    // Verification status belongs in the launch backlog, not in visitor copy.
    const text = await page.locator("main").innerText();
    for (const note of [
      /has not been tested/i,
      /not been confirmed/i,
      /not been supplied/i,
      /not connected in this preview/i,
      /Some tools require/i,
    ])
      expect(text, `${route}: ${note}`).not.toMatch(note);
  }
  // A toolkit that needs ChatGPT on a Claude site says why.
  await page.goto("/resources/");
  await expect(page.locator("main")).toContainText(
    "Its practice advisors are custom GPTs, so they need a ChatGPT account.",
  );
});

test("#37: before handing off, the dialog says what the live form will ask", async ({
  page,
}) => {
  await page.goto("/about/");
  await page.getByRole("button", { name: /Talk to our team/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(
    "news and updates start at Yes: choose No if you only want a reply.",
  );
  await expect(dialog).toContainText(
    "It also asks you to agree to Found42 communications before it sends.",
  );
});

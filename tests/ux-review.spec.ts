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

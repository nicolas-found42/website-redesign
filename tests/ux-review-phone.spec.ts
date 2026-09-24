import { test, expect } from "@playwright/test";

const phone = { width: 390, height: 844 };

test("#45: the services section reads on paper, with a visible current choice", async ({
  page,
}) => {
  await page.setViewportSize(phone);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const services = page.locator("#services");
  await expect(services).not.toHaveAttribute("data-ground", "ink");
  await services
    .getByRole("heading", { name: "Three ways we help" })
    .scrollIntoViewIfNeeded();
  await expect(page.locator(".site-header")).not.toHaveClass(/is-over-ink/);
  const pressed = services.locator(
    '[data-approved-service][aria-pressed="true"]',
  );
  await expect(pressed).toContainText("Workshops");
  expect(await pressed.evaluate((el) => getComputedStyle(el).color)).not.toBe(
    await page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  );
});

test("#46: a visitor can email or call Found42 without the form", async ({
  page,
}) => {
  await page.setViewportSize(phone);
  await page.goto("/");
  await page
    .getByRole("button", { name: /Talk to us/ })
    .first()
    .click();
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
    footer.getByRole("link", { name: "richard@found42.com" }),
  ).toHaveAttribute("href", "mailto:richard@found42.com");
  await expect(
    footer.getByRole("link", { name: "(646) 300-1247" }),
  ).toHaveAttribute("href", "tel:+16463001247");
});

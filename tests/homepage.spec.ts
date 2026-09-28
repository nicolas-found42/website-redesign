import { test, expect } from "@playwright/test";
test("the homepage offers a clear resource and consultation path with near-hero proof", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Train teams. Build useful skills. Automate the work.",
  );
  const hero = page.locator(".hero");
  await expect(
    hero.getByRole("link", { name: /Explore free resources/ }),
  ).toHaveAttribute("href", "/resources/");
  const team = hero.getByRole("button", { name: "Talk to us" });
  await expect(team).toBeVisible();
  await team.click();
  const inquiry = page.getByRole("dialog");
  await expect(inquiry).toContainText("You’re sending a consultation inquiry");
  await expect(
    inquiry.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  await page.keyboard.press("Escape");
  await expect(hero).toContainText(
    "Paul Keely · Co-founder and Managing Director, Palladium Security LLC",
  );
  await expect(hero).not.toContainText("Workshops · Workflows · Automations");
  await expect(hero).not.toContainText("Fig. 01");
});
test("the homepage previews the scorecard and public toolkit in the free resources band", async ({
  page,
}) => {
  await page.goto("/");
  const start = page.locator("#resources");
  await expect(
    start.getByRole("heading", { name: "Not ready to talk? Start here" }),
  ).toBeVisible();
  await expect(start.locator("article.resource")).toHaveCount(2);
  await expect(
    start.getByRole("heading", { name: "AI Readiness Scorecard" }),
  ).toBeVisible();
  await expect(
    start.getByRole("heading", { name: "C-Level AI Toolkit" }),
  ).toBeVisible();
  await expect(
    start.getByRole("link", { name: /All free resources/ }),
  ).toHaveAttribute("href", "/resources/");
  await expect(start).not.toContainText("Strategic Advisor Mini-Course");
  await expect(start).not.toContainText("Index / 04");
  await start.getByRole("link", { name: /Take the scorecard/ }).click();
  await expect(page).toHaveURL(/\/resources\/#scorecard$/);
  await expect(
    page.getByRole("group", { name: "AI Readiness Scorecard" }),
  ).toContainText("Question 1 of 12");
});
test("all three audiences link to their catalog tracks", async ({ page }) => {
  await page.goto("/#audiences");
  const rail = page.getByRole("group", { name: "Choose an audience" });

  await rail.getByRole("button", { name: /C-level executives/ }).click();
  await expect(
    page
      .locator(".audience-card")
      .first()
      .getByRole("link", { name: "For executives" }),
  ).toHaveAttribute("href", "/services/#track-c-level-ai");

  await rail.getByRole("button", { name: /Individual contributors/ }).click();
  await expect(
    page
      .locator(".audience-card")
      .nth(1)
      .getByRole("link", { name: "For individual contributors" }),
  ).toHaveAttribute("href", "/services/#track-role-based");

  await rail.getByRole("button", { name: /AI builders/ }).click();
  await expect(
    page
      .locator(".audience-card")
      .nth(2)
      .getByRole("link", { name: "For AI builders" }),
  ).toHaveAttribute("href", "/services/#track-ai-builders");

  await expect(
    page.locator(".audience-panel:not([hidden]) .audience-scene"),
  ).toHaveCount(1);
  await expect(page.locator("#audiences h2")).toHaveText(
    "Find the work that sounds like yours",
  );
  await expect(page.locator("#audiences")).not.toContainText("One method");
});
test("published workshop quotes remain attributed and inquiries use the live route", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-proof")).toContainText("Paul Keely");
  await expect(page.locator("#testimonials")).toContainText(
    "Carmen Paredes Ramirez",
  );
  await page
    .getByRole("button", { name: "Talk to us", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).not.toContainText("booked");
  await expect(dialog.locator("form")).toHaveCount(0);
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
});

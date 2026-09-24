import { test, expect } from "@playwright/test";
test("the homepage offers a clear resource and consultation path with near-hero proof", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Train teams. Build useful skills. Automate the work.",
  );
  const hero = page.locator(".hero");
  await expect(hero.getByRole("link", { name: /Explore free resources/ })).toHaveAttribute(
    "href",
    "/resources/",
  );
  const team = hero.getByRole("button", { name: "Talk to our team" });
  await expect(team).toBeVisible();
  await team.click();
  const inquiry = page.getByRole("dialog");
  await expect(inquiry).toContainText("You’re sending a consultation inquiry");
  await expect(
    inquiry.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  await page.keyboard.press("Escape");
  await expect(hero).toContainText(
    "Paul Keely · Co-founder / Managing Director, Palladium Security LLC",
  );
  await expect(hero).not.toContainText("Workshops · Workflows · Automations");
  await expect(hero).not.toContainText("Fig. 01");
});
test("Start Here previews the scorecard and public toolkit, not the full catalog", async ({
  page,
}) => {
  await page.goto("/");
  const start = page.locator("#resources");
  await expect(start.getByRole("heading", { name: "Start Here" })).toBeVisible();
  await expect(start.locator("article.resource")).toHaveCount(2);
  await expect(start.getByRole("heading", { name: "AI Readiness Scorecard" })).toBeVisible();
  await expect(start.getByRole("heading", { name: "C-Level AI Toolkit" })).toBeVisible();
  await expect(
    start.getByRole("link", { name: /Explore all free resources/ }),
  ).toHaveAttribute("href", "/resources/");
  await expect(start).not.toContainText("Strategic Advisor Mini-Course");
  await expect(start).not.toContainText("Index / 04");
  await start
    .getByRole("link", { name: /Take the scorecard/ })
    .click();
  await expect(page).toHaveURL(/\/resources\/#scorecard$/);
  await expect(page.getByRole("group", { name: "AI Readiness Scorecard" })).toContainText(
    "Question 1 of 12",
  );
});
test("all three audiences expose a truthful interim next step", async ({ page }) => {
  await page.goto("/#audiences");
  const rail = page.getByRole("group", { name: "Choose an audience" });

  await rail.getByRole("button", { name: /C-level executives/ }).click();
  const executive = page.locator(".audience-panel:not([hidden])");
  await expect(
    executive.getByRole("link", {
      name: "Explore the Four-Hour AI Executive on Maven",
    }),
  ).toHaveAttribute("href", "https://maven.com/richard-achee/four-hour-ai");
  await expect(executive).toContainText(
    "Preview link, still being confirmed. The course page and its access terms are on Maven.",
  );

  await rail.getByRole("button", { name: /Individual contributors/ }).click();
  const contributor = page.locator(".audience-panel:not([hidden])");
  await expect(
    contributor.getByRole("link", { name: "Explore tailored training" }),
  ).toHaveAttribute("href", /services\/#tracks$/);

  await rail.getByRole("button", { name: /AI builders/ }).click();
  const builder = page.locator(".audience-panel:not([hidden])");
  await expect(builder).toContainText(
    "Interim path: no verified AI Builder course is published.",
  );
  await builder
    .getByRole("button", { name: "Ask about AI builder support" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("AI builder support");
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");

  await expect(page.locator("#audiences h2")).toHaveText("Who Found42 helps");
  await expect(page.locator("#audiences")).not.toContainText("One method");
});
test("published workshop quotes remain attributed and inquiries use the live route", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText(
      "Paul Keely · Co-founder / Managing Director, Palladium Security LLC",
    ),
  ).toHaveCount(2);
  await expect(
    page.getByText(
      "Carmen Paredes Ramirez · Founder & CEO of Ruruka and Maraja",
    ),
  ).toBeVisible();
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

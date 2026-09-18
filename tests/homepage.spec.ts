import { test, expect } from "@playwright/test";
test("three audiences can find the right pathway and all source resources", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Hands-on Claude skills and training for your business.",
  );
  const rail = page.getByRole("group", { name: "Choose an audience" });
  await expect(
    rail.getByRole("button", { name: /C-level executives/ }),
  ).toBeVisible();
  await expect(
    page.getByText("For C-level executives", { exact: true }),
  ).toBeVisible();
  await rail.getByRole("button", { name: /Individual contributors/ }).click();
  await expect(
    page.getByText("For individual contributors", { exact: true }),
  ).toBeVisible();
  for (const name of [
    "AI Readiness Scorecard",
    "Failure Mode Playbook",
    "Skills Starter Library",
    "Strategic Advisor Mini-Course",
  ])
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
  await page
    .getByRole("link", { name: "Take the scorecard", exact: true })
    .click();
  await expect(page).toHaveURL(/\/resources\/#scorecard$/);
  await page.locator(".workflow-preview summary").click();
  await expect(
    page.getByRole("heading", {
      name: "How repeatable is the work you want to improve?",
    }),
  ).toBeVisible();
});
test("published workshop quotes remain attributed and inquiries never claim delivery", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText(
      "Paul Keely · Co-founder / Managing Director, Palladium Security LLC",
    ),
  ).toBeVisible();
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
  await expect(dialog).toContainText("This preview cannot send inquiries.");
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
});

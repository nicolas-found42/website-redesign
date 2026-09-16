import { test, expect } from "@playwright/test";
test("two audiences can find the right pathway and all source resources", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "AI built around your work.",
  );
  await expect(page.getByText("For executives", { exact: true })).toBeVisible();
  await expect(
    page.getByText("For domain experts & teams", { exact: true }),
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
  await expect(
    page.getByRole("heading", {
      name: "How repeatable is the work you want to improve?",
    }),
  ).toBeVisible();
});
test("source samples stay explicitly labeled and inquiries never claim delivery", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByText("Sample testimonial. Replace with verified client quote."),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Name to be confirmed · Title · Company · Sample testimonial placeholder",
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

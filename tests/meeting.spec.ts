import { test, expect } from "@playwright/test";

test("the approved journey separates audiences, delivery, and resources", async ({
  page,
}) => {
  await page.goto("/");
  const bands = await page
    .locator(".approved-homepage > section")
    .evaluateAll((nodes) => nodes.map((node) => node.id || node.className));
  expect(bands).toEqual([
    "ah-hero ah-wrap",
    "ah-companies ah-wrap",
    "ah-counts ah-wrap",
    "audiences",
    "services",
    "ah-briefing",
    "ah-testimonials",
    "ah-founder ah-wrap",
    "resources",
    "contact",
  ]);
  await expect(page.locator(".ah-audience-card")).toHaveCount(3);
  await expect(page.locator("#resources h3")).toHaveText([
    "AI Readiness Scorecard",
    "C-Level AI Toolkit",
  ]);
  await page.goto("/resources/");
  expect(
    await page
      .locator("main section[id]")
      .evaluateAll((nodes) => nodes.map((node) => node.id)),
  ).toEqual([
    "scorecard",
    "toolkit",
    "playbook",
    "library",
    "course",
    "contact",
  ]);
});

test("the scorecard is answered on the page, and the original stays one link away", async ({
  page,
}) => {
  // Nothing reaches the provider unless the visitor follows the link.
  const provider: string[] = [];
  await page.route("https://found42.scoreapp.com/**", (route) => {
    provider.push(route.request().url());
    return route.abort();
  });
  await page.goto("/resources/");
  await expect(page.locator("iframe")).toHaveCount(0);
  const app = page.getByRole("group", { name: "AI Readiness Scorecard" });
  await expect(app).toContainText("Question 1 of 12");
  await expect(
    page.getByRole("link", {
      name: "Take the original assessment on ScoreApp",
    }),
  ).toHaveAttribute("href", "https://found42.scoreapp.com/");
  for (let step = 0; step < 12; step++)
    await app.getByRole("button", { name: "Yes", exact: true }).click();
  await app.getByRole("button", { name: /See my result/ }).click();
  await expect(app.locator("h3")).toHaveText("Ready to scale");
  expect(provider).toEqual([]);
  await expect(page.locator(".workflow-preview")).toContainText(
    "separate from the AI Readiness Scorecard",
  );
});

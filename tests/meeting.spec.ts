import { test, expect } from "@playwright/test";

test("meeting journey reads in order and separates audiences from delivery", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main > section").first()).toHaveClass("hero");
  const bands = await page
    .locator("main > section")
    .evaluateAll((nodes) => nodes.map((n) => n.id || n.className));
  expect(bands.slice(1, 4)).toEqual(["companies", "audiences", "services"]);
  await expect(page.locator(".hero-actions .action")).toHaveCount(2);
  await expect(page.locator(".audience-panel")).toHaveCount(3);
  await expect(page.locator("#audiences")).toContainText(
    "No engineering background needed",
  );
  await expect(page.locator("#resources h3")).toHaveText([
    "AI Readiness Scorecard",
    "C-Level AI Toolkit",
  ]);
  await page.goto("/resources/");
  expect(
    await page
      .locator("main section[id]")
      .evaluateAll((nodes) => nodes.map((n) => n.id)),
  ).toEqual([
    "scorecard",
    "toolkit",
    "playbook",
    "library",
    "course",
    "contact",
  ]);
  await expect(
    page.getByText(/Executive Communications (?:Mini[- ]?)?Course/i),
  ).toHaveCount(0);
});

test("the scorecard provides its report locally and retires the original provider", async ({
  page,
}) => {
  await page.goto("/resources/");
  const app = page.getByRole("group", { name: "AI Readiness Scorecard" });
  await expect(app).toContainText("Question 1 of 18");
  await expect(page.locator('a[href*="scoreapp"]')).toHaveCount(0);
  await expect(page.locator("iframe")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("ScoreApp");
  for (let i = 0; i < 18; i++)
    await app.locator("[data-readiness-answer]").last().click();
  await app.getByRole("button", { name: /See my report/ }).click();
  await expect(app).toContainText("Stage 3 of 3: Ready to scale");
  await expect(app).toContainText("51 of 51 points");
  await expect(
    app.getByRole("button", { name: /Download my PDF/ }),
  ).toBeVisible();
  await expect(page.locator(".workflow-preview")).toContainText(
    "separate from the AI Readiness Scorecard",
  );
});

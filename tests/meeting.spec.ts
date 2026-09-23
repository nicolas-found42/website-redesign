import { test, expect } from "@playwright/test";

test("meeting journey reads in order and separates audiences from delivery", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main > section").first()).toHaveClass("hero");
  const bands = await page
    .locator("main > section")
    .evaluateAll((nodes) => nodes.map((n) => n.id || n.className));
  expect(bands[1]).toBe("resources");
  expect(bands[2]).toBe("audiences");
  expect(bands[3]).toBe("services");
  await expect(page.locator(".hero-actions .action")).toHaveCount(1);
  await expect(page.locator(".audience-panel")).toHaveCount(3);
  await expect(page.locator("#audiences")).toContainText(
    "You do not need to be an engineer",
  );
  const names = [
    "AI Readiness Scorecard",
    "Strategic Advisor Mini-Course",
    "Skills Starter Library",
    "Failure Mode Playbook",
  ];
  expect(await page.locator("#resources h3").allTextContents()).toEqual([
    ...names,
    "Start with value. Build what proves useful.",
  ]);
  await page.goto("/resources/");
  expect(
    await page
      .locator("main section[id]")
      .evaluateAll((nodes) => nodes.map((n) => n.id)),
  ).toEqual(["scorecard", "course", "library", "playbook", "contact"]);
  await expect(
    page.getByText("Executive Communications", { exact: false }),
  ).toHaveCount(0);
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

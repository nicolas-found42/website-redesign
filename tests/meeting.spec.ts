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

test("scorecard loads on request and keeps a direct fallback during delay and failure", async ({
  page,
}) => {
  await page.route("https://found42.scoreapp.com/**", (route) => route.abort());
  await page.goto("/resources/");
  await expect(page.locator("iframe")).toHaveCount(0);
  const link = page.getByRole("link", {
    name: "Open the scorecard on ScoreApp",
  });
  await expect(link).toHaveAttribute("href", "https://found42.scoreapp.com/");
  await page.getByRole("button", { name: "Load the scorecard here" }).click();
  await expect(page.locator("iframe")).toHaveAttribute(
    "title",
    "Found42 AI Readiness Scorecard on ScoreApp",
  );
  await expect(link).toBeVisible();
  await expect(page.locator("[data-scorecard-status]")).toContainText(
    /direct|unavailable|longer/,
  );
  await expect(page.locator(".workflow-preview")).toContainText(
    "separate from the AI Readiness Scorecard",
  );
});

import { expect, test } from "@playwright/test";

const diagrams = [
  ["Your people", "Human direction", "Practical AI at work"],
  ["Your problem", "Tailored skill", "Decision brief", "Executive direction"],
  ["Your company", "Role-specific skills", "Work reviewed", "Your judgment"],
  ["Work problem", "Test", "Troubleshoot", "Workflow in use"],
  [
    "Your team's real work",
    "Live guided practice",
    "Group review",
    "Reusable skill",
  ],
  ["Your brief", "Design and build", "Test together", "Deployable workflow"],
  ["Map handoffs", "Automate repeat work", "Human review", "Reliable output"],
];

test("the homepage diagrams can be explored and progress while in view", async ({
  page,
}) => {
  await page.goto("/");
  const flows = page.locator(".approved-homepage .ah-flow");
  await expect(flows).toHaveCount(7);
  for (const [index, labels] of diagrams.entries()) {
    await expect(flows.nth(index).locator("button.ah-flow-step")).toHaveText(
      labels,
    );
  }
  const hero = flows.first();
  await hero.locator("button.ah-flow-step").nth(1).click();
  await expect(hero).toHaveAttribute("data-active-step", "1");
  await hero.locator("button.ah-flow-step").nth(2).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(hero).toHaveAttribute("data-active-step", "1");

  const audience = flows.nth(1);
  await audience.scrollIntoViewIfNeeded();
  await expect(audience).toHaveAttribute("data-motion", "running");
  const firstStep = await audience.getAttribute("data-active-step");
  await expect
    .poll(() => audience.getAttribute("data-active-step"), { timeout: 5000 })
    .not.toBe(firstStep);
  await expect(audience.locator("button.ah-flow-step")).toHaveCount(4);
  await audience.locator("button.ah-flow-step").nth(1).click();
  // The scroll observer must not replace a visitor's chosen step after a click.
  await page.waitForTimeout(550);
  await expect(audience).toHaveAttribute("data-active-step", "1");

  await page.locator('[data-approved-service="2"]').click();
  const automation = page.locator('[data-approved-panel="2"] .ah-flow');
  await automation.locator("button.ah-flow-step").nth(2).click();
  await page.waitForTimeout(550);
  await expect(automation).toHaveAttribute("data-active-step", "2");
});

test("pause and reduced motion stop automatic diagram progression", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.locator(".ah-system .ah-flow");
  await expect(hero).toHaveAttribute("data-active-step", /[0-2]/);
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(hero).toHaveAttribute("data-motion", "paused");
  await expect(hero).toHaveAttribute("data-active-step", "2");

  await page.getByRole("button", { name: "Resume motion" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(hero).toHaveAttribute("data-motion", "paused");
});

test("without JavaScript the diagrams retain their complete still content", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4179/website-redesign/");
  const flows = page.locator(".approved-homepage .ah-flow");
  await expect(flows).toHaveCount(diagrams.length);
  for (const [index, labels] of diagrams.entries()) {
    await expect(flows.nth(index).locator(".ah-flow-step")).toHaveText(labels);
  }
  await context.close();
});

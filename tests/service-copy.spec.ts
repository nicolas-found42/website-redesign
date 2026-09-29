import { test, expect } from "@playwright/test";

for (const path of ["/", "/services/"]) {
  test(`services distinguish everyday skills from connected automations on ${path}`, async ({
    page,
  }) => {
    await page.goto(path);
    const services = page.locator("#services");
    await expect(services).toContainText(
      "Custom Claude skills and plugins built around high-value, time-consuming tasks your team does every day. Your source material, examples and quality bar shape the result.",
    );
    await expect(services).toContainText(
      "Skills and plugins the team can deploy",
    );
    await expect(services).toContainText(
      "End-to-end automations tied directly to your CRM, productivity apps and systems of record to take repetitive work off your team, with people in control wherever judgment is needed.",
    );
    await expect(services).not.toContainText(
      "End-to-end workflows for repetitive work",
    );
    await expect(services).not.toContainText("A workflow the team can deploy");
  });
}

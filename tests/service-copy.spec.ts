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

/**
 * #147: Robb Henshaw was attributed to two different employers on the homepage
 * and the services page. Both surfaces now carry the same combined attribution.
 */
const ROBB_HENSHAW_ATTRIBUTION =
  "CMO, Edgescale AI; former Co-Founder and CMO, Cameyo (acquired by Google)";

test("Robb Henshaw carries one identical attribution on the homepage and services page", async ({
  page,
}) => {
  const attributionOn = async (path: string) => {
    await page.goto(path);
    const caption = page
      .locator("figcaption", { hasText: "Robb Henshaw" })
      .first();
    const text = ((await caption.textContent()) ?? "")
      .replace(/\s+/g, " ")
      .trim();
    return text.replace("Robb Henshaw", "").trim();
  };
  const homepage = await attributionOn("/");
  const services = await attributionOn("/services/");
  expect(homepage).toBe(ROBB_HENSHAW_ATTRIBUTION);
  expect(services).toBe(ROBB_HENSHAW_ATTRIBUTION);
  expect(homepage).toBe(services);
});

test("Services explains the input and result for each distinct engagement", async ({
  page,
}) => {
  await page.goto("/services/");
  const engagements = page.locator("#engagements");
  await expect(engagements).toContainText(
    "Discovery around the high-value, time-consuming tasks your team does every day.",
  );
  await expect(engagements).toContainText(
    "An end-to-end automation connected to your systems, with human review points.",
  );
  await expect(engagements).toContainText(
    "The process, the systems it passes between, and the people who review its results.",
  );
  await expect(engagements).not.toContainText(
    "An end-to-end workflow with human review points and system handoffs.",
  );
});

import { expect, test } from "@playwright/test";

test("the homepage follows the approved story around the deployed drawings", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main > section")).toHaveCount(10);
  await expect(
    page
      .locator("main > section")
      .evaluateAll((sections) => sections.map((section) => section.id)),
  ).resolves.toEqual([
    "hero",
    "companies",
    "counts",
    "audiences",
    "services",
    "briefing",
    "testimonials",
    "founder",
    "resources",
    "contact",
  ]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Train teams. Build useful skills. Automate the work.",
  );
  await expect(page.getByText("Google", { exact: true })).toBeVisible();
  await expect(page.getByText("PeakSpan", { exact: true })).toBeVisible();
  await expect(page.getByText("SEP", { exact: true })).toBeVisible();
  await expect(page.getByText("20+", { exact: true })).toBeVisible();
  await expect(page.getByText("500+", { exact: true })).toBeVisible();
  await expect(page.getByText("50+", { exact: true })).toBeVisible();
  await expect(page.locator(".hero-art [data-system-host]")).toHaveCount(0);
  await expect(page.locator(".hero-art .system")).toHaveCount(1);
});

test("audience cards select the original scene and link to catalog tracks", async ({
  page,
}) => {
  await page.goto("/#audiences");
  const cards = page.locator(".audience-card");
  await expect(cards).toHaveCount(3);
  for (const [index, anchor] of [
    "c-level-ai",
    "role-based",
    "ai-builders",
  ].entries()) {
    await expect(cards.nth(index).getByRole("link")).toHaveAttribute(
      "href",
      `/services/#track-${anchor}`,
    );
    await cards.nth(index).getByRole("button").click();
    await expect(cards.nth(index).getByRole("button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      page.locator(".audience-panel:not([hidden]) .audience-scene"),
    ).toHaveCount(1);
  }
  await page.getByRole("button", { name: "Previous audience" }).click();
  await expect(cards.nth(1).getByRole("button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("all five complete testimonials remain reachable with bundled portraits", async ({
  page,
}) => {
  await page.goto("/#testimonials");
  const cards = page.locator(".testimonial-card");
  await expect(cards).toHaveCount(5);
  for (const name of [
    "Robb Henshaw",
    "Paul Keely",
    "Carmen Paredes Ramirez",
    "Andrew Miller",
    "Neville Louison",
  ]) {
    const image = page.getByRole("img", { name });
    await expect(image).toHaveCount(1);
    await expect(image).toHaveJSProperty("complete", true);
    await expect(image).not.toHaveJSProperty("naturalWidth", 0);
  }
  const next = page.getByRole("button", { name: "Next testimonial" });
  for (let index = 2; index <= 5; index++) {
    await next.click();
    await expect(page.locator("[data-testimonial-count]")).toHaveText(
      `${index} / 5`,
    );
  }
  await page.locator(".testimonial-track").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-testimonial-count]")).toHaveText("1 / 5");
});

test("Services has the complete public catalog and contextual inquiry handoff", async ({
  page,
}) => {
  await page.goto("/services/");
  await expect(page.locator("#tracks .track")).toHaveCount(5);
  await expect(page.locator("#formats .catalog-option")).toHaveCount(6);
  await expect(page.locator("#beyond-training .catalog-option")).toHaveCount(4);
  await expect(page.locator("#start-free article")).toHaveCount(2);
  await expect(page.locator(".catalog-quotes .quote")).toHaveCount(3);
  await expect(
    page.getByRole("heading", { name: "About Richard Achée" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A useful place to begin" }),
  ).toBeVisible();
  await expect(page.locator("#tracks .track a[data-dialog]")).toHaveCount(5);
  await expect(
    page.locator("#beyond-training .catalog-option a[data-dialog]"),
  ).toHaveCount(4);
  await page
    .locator("#track-ai-builders")
    .getByRole("link", { name: /Inquire about AI Builders/ })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("AI Builders");
  await expect(dialog).toContainText(
    "Add “the AI Builders track” to your message",
  );
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  await expect(page.locator("main")).not.toContainText(
    /\$\d|Price range|Prepared for Seidler|Confidential/,
  );
});

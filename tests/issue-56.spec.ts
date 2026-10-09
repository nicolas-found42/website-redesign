import { expect, test } from "@playwright/test";

test("the homepage follows the approved story around the deployed drawings", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("main > section")).toHaveCount(8);
  await expect(
    page
      .locator("main > section")
      .evaluateAll((sections) => sections.map((section) => section.id)),
  ).resolves.toEqual([
    "hero",
    "companies",
    "audiences",
    "services",
    "testimonials",
    "founder",
    "resources",
    "contact",
  ]);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Train teams. Build useful skills. Automate the work.",
  );
  await expect(page.locator("#companies")).toBeVisible();
  await expect(page.locator(".hero-art")).toHaveCount(0);
});

test("#168: services lead into complete testimonials without scripting [production]", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4179/website-redesign/");
  await expect(page.locator("#briefing")).toHaveCount(0);
  await expect(page.locator("#services + #testimonials")).toHaveCount(1);
  await expect(page.locator("#testimonials .testimonial-card")).toHaveCount(5);
  await expect(
    page.getByRole("heading", { name: "What founders are saying" }),
  ).toBeVisible();
  await context.close();
});

test("audience pills jump to complete articles linked to catalog tracks", async ({
  page,
}) => {
  await page.goto("/#audiences");
  const articles = page.locator(".audience-panel");
  const choices = page
    .getByRole("group", { name: "Choose an audience" })
    .getByRole("button");
  await expect(articles).toHaveCount(3);
  for (const [index, anchor] of [
    "c-level-ai",
    "role-based",
    "ai-builders",
  ].entries()) {
    await expect(articles.nth(index).getByRole("link")).toHaveAttribute(
      "href",
      `/services/#track-${anchor}`,
    );
    await choices.nth(index).click();
    await expect(choices.nth(index)).toHaveAttribute("aria-pressed", "true");
    await expect(articles.nth(index)).toBeInViewport();
  }
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

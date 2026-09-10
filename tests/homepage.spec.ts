import { test, expect } from "@playwright/test";
test("an executive can immediately explore resources or make a consultation inquiry", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Put AI to work on what moves your business.",
  );
  await page
    .getByRole("link", { name: "Explore free resources", exact: true })
    .click();
  await expect(page).toHaveURL(/#resources$/);
  await expect(
    page
      .getByRole("link", { name: "Request a consultation", exact: true })
      .first(),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
});

test("a resource seeker can distinguish form gates, external assessment and public reading", async ({
  page,
}) => {
  await page.goto("/#resources");
  const prompt = page
    .getByRole("article")
    .filter({
      has: page.getByRole("heading", {
        name: "Industry-specific prompt packs",
        exact: true,
      }),
    });
  await expect(prompt).toContainText(
    "Requires name, email, job title, industry and company website.",
  );
  await expect(
    prompt.getByRole("link", { name: "Request a prompt pack" }),
  ).toHaveAttribute("href", "https://www.found42.com/industryprompts");
  const scorecard = page
    .getByRole("article")
    .filter({
      has: page.getByRole("heading", {
        name: "AI Readiness Scorecard",
        exact: true,
      }),
    });
  await expect(scorecard).toContainText(
    "Personal and business details are required before the questions.",
  );
  await expect(scorecard.getByRole("link")).toHaveAttribute(
    "href",
    "https://found42.scoreapp.com/",
  );
  await expect(
    page.getByText("Requires email, LinkedIn profile and CAPTCHA."),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Read the article" }),
  ).toHaveAttribute("href", "https://www.found42.com/blog/choosing-to-inspire");
});

test("a prospective client can assess the offers and attributed evidence before opening an inquiry", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "AI Empowerment Training", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "AI-Powered Automation", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "AI Product Differentiation for B2B SaaS",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "From the workshop, in their words." }),
  ).toBeVisible();
  await expect(page.getByText("Paul Keely", { exact: true })).toBeVisible();
  await expect(page.getByText("Andrew Miller", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Richard Achée, founder of Found42" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open the inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  await expect(
    page.getByRole("link", { name: /mini-course|sign.up.*course/i }),
  ).toHaveCount(0);
});

import { test, expect } from "@playwright/test";

const titles = [
  "Train teams.Build useful skills.Automate the work.",
  "Find the work that sounds like yours",
  "Three ways we help",
  "From a busy week to a ready briefing",
  "What founders are saying",
  "Led by Richard Achée, Founder and CEO",
  "Not ready to talk? Start here",
  "Want this built for your team?",
];

test("approved homepage preserves section order, proof, portraits and resource copy", async ({
  page,
}) => {
  await page.goto("/");
  const headings = await page
    .locator(".approved-homepage h1, .approved-homepage h2")
    .allTextContents();
  expect(headings.map((heading) => heading.trim())).toEqual(titles);
  await expect(page.locator(".ah-companies")).toContainText("Google");
  await expect(page.locator(".ah-companies")).toContainText("PeakSpan");
  await expect(page.locator(".ah-companies")).toContainText("SEP");
  await expect(page.locator(".ah-counts")).toContainText(
    "20+workshops delivered",
  );
  await expect(page.locator(".ah-counts")).toContainText("500+people trained");
  await expect(page.locator(".ah-counts")).toContainText(
    "50+skills and workflows built",
  );
  await expect(page.locator(".approved-homepage")).not.toContainText(
    "[Client logo]",
  );
  await expect(page.locator(".ah-quote")).toHaveCount(5);
  const expectedQuotes = [
    "“C-Level AI is a completely unique approach that cuts through the AI hype. It starts with the C-Level AI training workshop, providing your execs with practical AI skills and immediate value. Following it up with the Scorecard gives you a clear understanding of your current state. You head into the discovery session with great ideas of what could be possible that is grounded in reality.”",
    "“What stood out in the C-Level AI workshop was how practical it was. The exercises turned AI from concept to execution, with role-play coaching and tailored prompts that improved my client outreach instantly. Richard brings the balance of a trusted advisor and a hands-on coach.”",
    "“This course was amazing and incredibly useful! The sessions were engaging and interactive, which made learning enjoyable. I especially appreciated having access to the materials on demand after the live session. It was perfect for catching up on anything I missed during the live sessions. The pacing was just right, and everything was explained clearly and easy to understand.”",
    "“Richard’s C-Level AI workshop went beyond theory. It helped me turn ChatGPT into a trusted advisor and a sounding board in less than 1 hour. The role-play coaching and personalized AI tools delivered quick, actionable tweaks I could implement immediately. It’s already changing how I approach client conversations.”",
    "“Working with Richard in the Strategy Pivot Workshop unlocked a clear, actionable path forward for my business pivot. With his expert guidance through ChatGPT, Gemini, and Gamma, I not only refined my positioning and GTM playbook, but also had a fully functional landing page live in under three hours!”",
  ];
  await expect(page.locator(".ah-quote blockquote")).toHaveText(expectedQuotes);
  for (const image of await page.locator(".ah-quote img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalWidth),
      )
      .toBeGreaterThan(1);
  }
  await expect(page.locator(".ah-resource-grid")).toContainText(
    "12 yes-or-no questions · No email required",
  );
  await expect(page.locator(".ah-resource-grid")).toContainText(
    "Public page · Some links need a ChatGPT account",
  );
  await expect(page.locator(".ah-faux-controls button")).toHaveCount(0);
  await expect(page.locator(".ah-faux-controls")).toContainText(
    "Open briefing",
  );
  await expect(page.locator(".ah-faux-controls")).toContainText("Reply");
});

test("service selector and inquiry preserve the selected offering", async ({
  page,
}) => {
  await page.goto("/#services");
  const serviceDescriptions = [
    "Live or on-demand training on your team's real decisions, documents and operating rhythms. Teams learn on their own work, not on demo prompts.",
    "Custom Claude skills and plugins built around one high-value job your team does often. Your source material, examples and quality bar shape the result.",
    "End-to-end workflows for repetitive work that should not consume expert attention, with people in control wherever judgment is needed.",
  ];
  for (const [index, name] of [
    "Workshops",
    "Workflows",
    "Automations",
  ].entries()) {
    await page
      .getByRole("group", { name: "Choose a service" })
      .getByRole("button", { name: new RegExp(name) })
      .click();
    const panel = page.locator(".ah-service-panel:not([hidden])");
    await expect(panel.getByRole("heading", { name })).toBeVisible();
    await expect(panel).toContainText(serviceDescriptions[index]);
    await panel
      .getByRole("link", { name: `Talk to us about ${name.toLowerCase()} →` })
      .click();
    await expect(page.getByRole("dialog")).toContainText(name);
    await expect(
      page
        .getByRole("dialog")
        .getByRole("link", { name: "Open the live inquiry form" }),
    ).toHaveAttribute("href", "https://www.found42.com/contact");
    await page.keyboard.press("Escape");
  }
  const workflows = page
    .getByRole("group", { name: "Choose a service" })
    .getByRole("button", { name: /Workflows/ });
  await workflows.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page
      .getByRole("group", { name: "Choose a service" })
      .getByRole("button", { name: /Automations/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("audience, resource, and testimonial journeys remain available", async ({
  page,
}) => {
  await page.goto("/");
  for (const [action, anchor] of [
    ["For executives", "track-c-level-ai"],
    ["For individual contributors", "track-role-based"],
    ["For AI builders", "track-ai-builders"],
  ]) {
    await expect(
      page.getByRole("link", { name: `${action} →` }),
    ).toHaveAttribute("href", `/services/#${anchor}`);
  }
  await expect(
    page
      .locator(".ah-resource-grid")
      .getByRole("link", { name: "Take the scorecard →" }),
  ).toHaveAttribute("href", "/resources/#scorecard");
  await expect(
    page
      .locator(".ah-resource-grid")
      .getByRole("link", { name: "Explore the toolkit →" }),
  ).toHaveAttribute("href", "https://www.found42.com/toolkit");
  for (const [index, name] of [
    "Robb Henshaw",
    "Paul Keely",
    "Carmen Paredes Ramirez",
    "Andrew Miller",
    "Neville Louison",
  ].entries()) {
    await expect(page.locator(".ah-quote").first()).toContainText(name);
    await expect(page.locator("[data-testimonial-count]")).toHaveText(
      `${index + 1} / 5`,
    );
    await page.getByRole("button", { name: "Next testimonial" }).click();
  }
  await expect(page.locator("[data-testimonial-count]")).toHaveText("1 / 5");
  await page.getByRole("button", { name: "Previous testimonial" }).click();
  await expect(page.locator("[data-testimonial-count]")).toHaveText("5 / 5");
  await page.locator(".ah-quote-track").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-testimonial-count]")).toHaveText("1 / 5");
});

test("no script and reduced motion retain content", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4179/website-redesign/");
  await expect(page.locator(".ah-service-panel")).toHaveCount(3);
  await expect(page.locator(".ah-service-panel").nth(2)).toBeVisible();
  await expect(page.locator(".ah-quote")).toHaveCount(5);
  await expect(page.locator(".ah-hero a[data-dialog]")).toHaveAttribute(
    "href",
    "https://www.found42.com/contact",
  );
  await expect(page.locator(".ah-service-panel a[data-dialog]")).toHaveCount(3);
  await expect(page.locator(".ah-closing a[data-dialog]")).toHaveAttribute(
    "href",
    "https://www.found42.com/contact",
  );
  await expect(page.locator("#navigation a.nav-contact")).toHaveAttribute(
    "href",
    "https://www.found42.com/contact",
  );
  await context.close();
});

test("narrow and enlarged layouts have no horizontal overflow", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const dimensions = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      view: document.documentElement.clientWidth,
    }));
    expect(dimensions.scroll, `${width}px viewport`).toBeLessThanOrEqual(
      dimensions.view + 1,
    );
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "24px";
  });
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    view: document.documentElement.clientWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.view + 1);
});

test("footer and inquiry actions have live destinations", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator(".site-footer");
  await expect(
    footer.getByRole("link", { name: "Free resources" }),
  ).toHaveAttribute("href", "/resources/");
  await expect(footer.getByRole("link", { name: "Services" })).toHaveAttribute(
    "href",
    "/services/",
  );
  await expect(footer.getByRole("link", { name: "About" })).toHaveAttribute(
    "href",
    "/about/",
  );
  await expect(footer.getByRole("link", { name: "Blog" })).toHaveAttribute(
    "href",
    "/blog/",
  );
  await expect(
    footer.getByRole("link", { name: "Private Equity" }),
  ).toHaveAttribute("href", "/industries/private-equity/");
  await expect(footer.getByRole("link", { name: "B2B SaaS" })).toHaveAttribute(
    "href",
    "/industries/b2b-saas/",
  );
  await expect(
    footer.getByRole("link", { name: "richard@found42.com" }),
  ).toHaveAttribute("href", "mailto:richard@found42.com");
  await expect(
    footer.getByRole("link", { name: "(646) 300-1247" }),
  ).toHaveAttribute("href", "tel:+16463001247");
  await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute(
    "href",
    "https://www.found42.com/privacy-policy",
  );
  await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute(
    "href",
    "https://www.found42.com/terms-of-use",
  );
  await page
    .locator(".ah-closing")
    .getByRole("link", { name: /Talk to us/ })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
});

test("footer navigation opens each internal destination", async ({ page }) => {
  for (const [name, path] of [
    ["Free resources", "/resources/"],
    ["Services", "/services/"],
    ["About", "/about/"],
    ["Blog", "/blog/"],
    ["Private Equity", "/industries/private-equity/"],
    ["B2B SaaS", "/industries/b2b-saas/"],
  ]) {
    await page.goto("/");
    await page.locator(".site-footer").getByRole("link", { name }).click();
    await expect(page).toHaveURL(new RegExp(`${path.replaceAll("/", "\\/")}$`));
    await expect(page.locator("main h1")).toBeVisible();
  }
});

test("footer policy links navigate and contact links activate", async ({
  page,
}) => {
  for (const [name, path] of [
    ["Privacy", "/privacy-policy"],
    ["Terms", "/terms-of-use"],
  ]) {
    await page.route(`https://www.found42.com${path}`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<main>Policy</main>",
      }),
    );
    await page.goto("/");
    await page.locator(".site-footer").getByRole("link", { name }).click();
    await expect(page).toHaveURL(`https://www.found42.com${path}`);
    await expect(page.getByText("Policy")).toBeVisible();
  }

  for (const [name, protocol] of [
    ["richard@found42.com", "mailto:"],
    ["(646) 300-1247", "tel:"],
  ]) {
    await page.goto("/");
    await page.evaluate(() => {
      (window as Window & { footerActivation?: string }).footerActivation = "";
      document
        .querySelector(".site-footer")
        ?.addEventListener("click", (event) => {
          const link = (event.target as Element).closest("a");
          (window as Window & { footerActivation?: string }).footerActivation =
            link?.protocol ?? "";
        });
    });
    await page.locator(".site-footer").getByRole("link", { name }).click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as Window & { footerActivation?: string }).footerActivation,
        ),
      )
      .toBe(protocol);
  }
});

test("touch and reduced-motion controls expose every service and testimonial", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  for (const [index, service] of [
    "Workshops",
    "Workflows",
    "Automations",
  ].entries()) {
    await page.locator(`[data-approved-service="${index}"]`).tap();
    await expect(page.locator(".ah-service-panel:not([hidden]) h3")).toHaveText(
      service,
    );
  }
  await page.getByRole("button", { name: "Next testimonial" }).tap();
  await expect(page.locator("[data-testimonial-count]")).toHaveText("2 / 5");
  await context.close();
});

test("audience and resource links reach their named pages", async ({
  page,
}) => {
  for (const [label, anchor, title] of [
    ["For executives →", "track-c-level-ai", "C-Level AI"],
    [
      "For individual contributors →",
      "track-role-based",
      "Customized Role-Based Training",
    ],
    ["For AI builders →", "track-ai-builders", "AI Builders"],
  ]) {
    await page.goto("/");
    await page.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(new RegExp(`/services/#${anchor}$`));
    await expect(page.locator(`#${anchor} h3`)).toHaveText(title);
  }
  await page.goto("/");
  await page
    .locator(".ah-resource-grid")
    .getByRole("link", { name: "Take the scorecard →" })
    .click();
  await expect(page).toHaveURL(/\/resources\/#scorecard$/);
  await expect(
    page.getByRole("group", { name: "AI Readiness Scorecard" }),
  ).toContainText("Question 1 of 12");
  await page.goto("/");
  await page
    .locator(".site-footer")
    .getByRole("link", { name: "About" })
    .click();
  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

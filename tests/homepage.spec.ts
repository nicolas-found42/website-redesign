import { test, expect } from "@playwright/test";

/**
 * #151: the audience skews 45+, so body copy and the small print that carries
 * attribution and access notes must stay comfortably readable on a phone. The
 * documented minimums in tokens.css are body copy 16px and small print 16px;
 * these read the settled page rather than the token text.
 */
test("body and small print hold their documented minimums across pages", async ({
  page,
}) => {
  const smallPrint = [
    "#testimonials .testimonial-card figcaption",
    "#testimonials .section-label",
    ".hero-proof figcaption",
    "#resources .note--plain",
    ".track-term",
    ".track-format",
    "#navigation a",
  ];
  for (const route of ["/", "/services/", "/resources/"]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    for (const selector of smallPrint) {
      const sizes = await page
        .locator(selector)
        .evaluateAll((elements) =>
          elements
            .filter((element) => (element as HTMLElement).offsetParent)
            .map((element) => parseFloat(getComputedStyle(element).fontSize)),
        );
      for (const size of sizes)
        expect(size, `${route} ${selector}`).toBeGreaterThanOrEqual(16);
    }
  }
  for (const selector of [".hero-lead", ".body"]) {
    await page.goto("/");
    const size = await page
      .locator(selector)
      .first()
      .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
    expect(size, `homepage ${selector}`).toBeGreaterThanOrEqual(16);
  }
});

// The fifteen owner-confirmed organizations, in the approved order.
const COMPANY_NAMES = [
  "Google",
  "Edgescale AI",
  "Millsapps, Ballinger & Associates (MB&A)",
  "Seidler Equity Partners (SEP)",
  "PeakSpan Capital",
  "Palladium Security",
  "Marajá",
  "Ruruka",
  "Crown Point Advisory Group",
  "IDC",
  "ParaVet.live",
  "mobile.club",
  "MINDSi Sports Performance",
  "Mindsight",
  "Prelude Solutions",
];

test("the homepage offers a clear resource and consultation path with near-hero proof", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Train teams. Build useful skills. Automate the work.",
  );
  const hero = page.locator(".hero");
  await expect(
    hero.getByRole("link", { name: /Explore free resources/ }),
  ).toHaveAttribute("href", "/resources/");
  const team = hero.getByRole("link", { name: "Talk to us" });
  await expect(team).toBeVisible();
  await team.click();
  const inquiry = page.getByRole("dialog");
  await expect(inquiry).toContainText("You’re sending a consultation inquiry");
  await expect(
    inquiry.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  await page.keyboard.press("Escape");
  await expect(hero).toContainText(
    "Paul Keely · Co-founder and Managing Director, Palladium Security LLC",
  );
  await expect(hero).not.toContainText("Workshops · Workflows · Automations");
  await expect(hero).not.toContainText("Fig. 01");
});
test("the homepage previews the scorecard and public toolkit in the free resources band", async ({
  page,
}) => {
  await page.goto("/");
  const start = page.locator("#resources");
  await expect(
    start.getByRole("heading", { name: "Not ready to talk? Start here" }),
  ).toBeVisible();
  await expect(start.locator("article.resource")).toHaveCount(2);
  await expect(
    start.getByRole("heading", { name: "AI Readiness Scorecard" }),
  ).toBeVisible();
  await expect(
    start.getByRole("heading", { name: "C-Level AI Toolkit" }),
  ).toBeVisible();
  await expect(
    start.getByRole("link", { name: /All free resources/ }),
  ).toHaveAttribute("href", "/resources/");
  await expect(start).not.toContainText("Strategic Advisor Mini-Course");
  await expect(start).not.toContainText("Index / 04");
  await start.getByRole("link", { name: /Take the scorecard/ }).click();
  await expect(page).toHaveURL(/\/resources\/#scorecard$/);
  await expect(
    page.getByRole("group", { name: "AI Readiness Scorecard" }),
  ).toContainText("Question 1 of 12");
});
test("all three audiences link to their catalog tracks", async ({ page }) => {
  await page.goto("/#audiences");
  const rail = page.getByRole("group", { name: "Choose an audience" });

  await rail.getByRole("button", { name: /C-level executives/ }).click();
  await expect(
    page
      .locator(".audience-panel")
      .first()
      .getByRole("link", { name: "For executives" }),
  ).toHaveAttribute("href", "/services/#track-c-level-ai");

  await rail
    .getByRole("button", { name: /Individual Contributors and Teams/ })
    .click();
  await expect(
    page
      .locator(".audience-panel")
      .nth(1)
      .getByRole("link", { name: "For Individual Contributors and Teams" }),
  ).toHaveAttribute("href", "/services/#track-role-based");

  await rail.getByRole("button", { name: /AI builders/ }).click();
  await expect(
    page
      .locator(".audience-panel")
      .nth(2)
      .getByRole("link", { name: "For AI builders" }),
  ).toHaveAttribute("href", "/services/#track-ai-builders");

  await expect(
    page.locator(".audience-pinned-scene:not([hidden]) .audience-scene"),
  ).toHaveCount(1);
  await expect(page.locator("#audiences h2")).toHaveText(
    "Find the work that sounds like yours",
  );
  await expect(page.locator("#audiences")).not.toContainText("One method");
});
test("published workshop quotes remain attributed and inquiries use the live route", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-proof")).toContainText("Paul Keely");
  await expect(page.locator("#testimonials")).toContainText(
    "Carmen Paredes Ramirez",
  );
  await page
    .getByRole("link", { name: "Talk to us", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).not.toContainText("booked");
  await expect(dialog.locator("form")).toHaveCount(0);
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
});

test("the opening is text-led with the approved lead and no proof numbers", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".hero-lead")).toHaveText(
    "Found42 helps non-technical teams use AI in the work they already own. We train people how to create and use Claude Skills tailored to their roles, and automate repeatable work while judgment stays with your team.",
  );
  await expect(page.locator(".hero")).toContainText(
    "Claude is Anthropic’s AI assistant.",
  );
  await expect(page.locator(".hero .system, .hero svg[role=img]")).toHaveCount(
    0,
  );
  await expect(page.locator(".hero-proof")).toContainText("Paul Keely");
  const main = page.locator("main");
  await expect(main).not.toContainText("Found42 in numbers");
  for (const claim of [/\b20\+/, /\b500\+/, /\b50\+/, /workshops delivered/])
    await expect(main).not.toContainText(claim);
});

test("the companies strip announces 15 locally bundled marks once in the approved order", async ({
  page,
}) => {
  await page.goto("/");
  const row = page.locator("#companies");
  await expect(row).toContainText("Teams we have worked with");
  const logos = row.getByRole("img");
  // The heading names the row, so the logos read as the answer to it.
  await expect(
    page.getByRole("region", { name: "Teams we have worked with" }),
  ).toHaveAttribute("id", "companies");
  await expect(
    row.getByRole("heading", { name: "Teams we have worked with" }),
  ).toBeVisible();
  await expect(logos).toHaveCount(15);
  const names = [
    "Google",
    "Edgescale AI",
    "Millsapps, Ballinger & Associates (MB&A)",
    "Seidler Equity Partners (SEP)",
    "PeakSpan Capital",
    "Palladium Security",
    "Marajá",
    "Ruruka",
    "Crown Point Advisory Group",
    "IDC",
    "ParaVet.live",
    "mobile.club",
    "MINDSi Sports Performance",
    "Mindsight",
    "Prelude Solutions",
  ];
  await Promise.all(
    names.map((name, index) =>
      expect(logos.nth(index)).toHaveAccessibleName(name),
    ),
  );
  const mindsight = row.getByRole("img", { name: "Mindsight", exact: true });
  await expect(mindsight).toHaveAttribute("src", "/assets/logos/mindsight.jpg");
  await expect(mindsight).toHaveAttribute("width", "200");
  await expect(mindsight).toHaveAttribute("height", "200");
  await expect(
    row
      .locator(".company-logos")
      .first()
      .getByText("Mindsight", { exact: true }),
  ).toBeVisible();
  await expect(
    row.getByRole("img", { name: "MINDSi Sports Performance", exact: true }),
  ).toHaveCount(1);
  const images = await logos.evaluateAll((elements) =>
    elements.map((element) => ({
      complete: (element as HTMLImageElement).complete,
      naturalWidth: (element as HTMLImageElement).naturalWidth,
      src: element.getAttribute("src"),
    })),
  );
  for (const image of images) {
    expect(image.complete).toBe(true);
    expect(image.naturalWidth).not.toBe(0);
    expect(image.src).toMatch(/^\/assets\/logos\//);
  }
});

test("the companies heading reads at section-heading scale and wraps above the logos", async ({
  page,
}) => {
  const sizes = [
    { width: 1440, height: 900, min: 28, max: 32 },
    { width: 384, height: 686, min: 24, max: 24 },
    { width: 384, height: 742, min: 24, max: 24 },
  ];
  await page.goto("/");
  for (const { width, height, min, max } of sizes) {
    await page.setViewportSize({ width, height });
    const heading = page
      .locator("#companies")
      .getByRole("heading", { name: "Teams we have worked with" });
    const size = await heading.evaluate((el) =>
      parseFloat(getComputedStyle(el).fontSize),
    );
    expect(size, `${width}px`).toBeGreaterThanOrEqual(min);
    expect(size, `${width}px`).toBeLessThanOrEqual(max);
  }
  for (const [width, height, text] of [
    [384, 686, "100%"],
    [384, 742, "100%"],
    [384, 742, "200%"],
    [320, 700, "200%"],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.evaluate(
      (size) => (document.documentElement.style.fontSize = size),
      text,
    );
    const fit = await page.locator("#companies").evaluate((row) => {
      const heading = row.querySelector("h2");
      const list = row.querySelector("ul");
      if (!heading || !list) throw new Error("row is missing its parts");
      const head = heading.getBoundingClientRect();
      const first = list.getBoundingClientRect();
      return {
        bottom: head.bottom,
        listTop: first.top,
        left: head.left,
        right: head.right,
        clipped: heading.scrollWidth > heading.clientWidth,
        pageFits: document.documentElement.scrollWidth <= innerWidth,
      };
    });
    const label = `${width}px at ${text} text`;
    expect(fit.bottom, label).toBeLessThanOrEqual(fit.listTop);
    expect(fit.left, label).toBeGreaterThanOrEqual(0);
    expect(fit.right, label).toBeLessThanOrEqual(width);
    expect(fit.clipped, label).toBe(false);
    expect(fit.pageFits, label).toBe(true);
  }
});

test("the companies row keeps proportions and fits without scrolling at any width", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const logos = page.locator("#companies").getByRole("img");
  await expect(logos).toHaveCount(15);
  await expect
    .poll(() =>
      logos.evaluateAll((images) =>
        images.every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);
  for (const width of [1440, 1024, 768, 430, 384, 320]) {
    await page.setViewportSize({ width, height: 800 });
    const fit = await logos.evaluateAll((images) =>
      images.map((image) => {
        const img = image as HTMLImageElement;
        const box = img.getBoundingClientRect();
        return {
          ratio: box.width / box.height,
          natural: img.naturalWidth / img.naturalHeight,
          right: box.right,
        };
      }),
    );
    for (const image of fit) {
      expect(image.right, `${width}px`).toBeLessThanOrEqual(width);
      expect(Math.abs(image.ratio - image.natural), `${width}px`).toBeLessThan(
        0.05,
      );
    }
    const pageFits = await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    );
    expect(pageFits, `${width}px`).toBe(true);
  }
});

test("every company mark carries its company name as visible, wrapping text", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const marks = page.locator(
    "#companies .company-logos:not([aria-hidden]) .company-logo",
  );
  await expect(marks).toHaveCount(15);
  const labels = marks.locator(".company-logo-name");
  await expect(labels).toHaveCount(15);
  await Promise.all(
    COMPANY_NAMES.map(async (name, index) => {
      const label = labels.nth(index);
      await expect(label).toBeVisible();
      await expect(label).toHaveText(name);
    }),
  );
  // The name sits inside the mark, reads at the 14px annotation floor and is
  // allowed to wrap rather than overflow its card.
  const readings = await labels.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      return {
        size: parseFloat(style.fontSize),
        wraps:
          style.whiteSpace === "normal" || style.whiteSpace === "break-spaces",
        inMark: Boolean(element.closest(".company-logo")),
      };
    }),
  );
  for (const reading of readings) {
    expect(reading.size).toBeGreaterThanOrEqual(14);
    expect(reading.wraps).toBe(true);
    expect(reading.inMark).toBe(true);
  }
});

test("the looping copy repeats the marks without doubling the announced names", async ({
  page,
}) => {
  await page.goto("/");
  const region = page.getByRole("region", {
    name: "Teams we have worked with",
  });
  // One announced list; the marquee's second list is hidden from the tree.
  await expect(region.getByRole("list")).toHaveCount(1);
  await expect(region.locator(".company-logos")).toHaveCount(2);
  await expect(
    region.locator('.company-logos[aria-hidden="true"]'),
  ).toHaveCount(1);
  await expect(region.getByRole("listitem")).toHaveCount(15);
  // The visible list names all fifteen; the looping copy's names are each
  // removed from the accessibility tree, so none is announced twice.
  await expect(
    region.locator(".company-logos:not([aria-hidden]) .company-logo-name"),
  ).toHaveCount(15);
  await expect(
    region.locator(
      '.company-logos[aria-hidden="true"] .company-logo-name[aria-hidden="true"]',
    ),
  ).toHaveCount(15);
});

test("the named marks fit without sideways overflow at 390px and 1440px", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}px`,
    ).toBe(true);
    const overflow = await page
      .locator("#companies .company-logo-name")
      .evaluateAll((elements) =>
        elements.map((element) => ({
          clipped: element.scrollWidth > element.clientWidth + 1,
        })),
      );
    for (const name of overflow) expect(name.clipped, `${width}px`).toBe(false);
  }
});

test("the companies strip moves without script at phone and desktop widths [production]", async ({
  browser,
}) => {
  for (const width of [384, 1440]) {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: "no-preference",
      viewport: { width, height: 742 },
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4179/website-redesign/");
    const region = page.getByRole("region", {
      name: "Teams we have worked with",
    });
    await expect(region.getByRole("list")).toHaveCount(1);
    await expect(region.getByRole("listitem")).toHaveCount(15);
    const mark = region.getByRole("img", { name: "Google", exact: true });
    const first = await mark.boundingBox();
    await expect
      .poll(async () => (await mark.boundingBox())?.x)
      .toBeLessThan(first!.x - 2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await context.close();
  }
});

test("the companies strip is still and shows every mark in wrapped rows with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [384, 1440]) {
    await page.setViewportSize({ width, height: 742 });
    await page.goto("/");
    const region = page.getByRole("region", {
      name: "Teams we have worked with",
    });
    const marks = region.getByRole("img");
    await expect(marks).toHaveCount(15);
    for (const mark of await marks.all()) await expect(mark).toBeVisible();
    const first = await marks.first().boundingBox();
    const last = await marks.last().boundingBox();
    expect(last!.y).toBeGreaterThan(first!.y);
    await page.waitForTimeout(150);
    expect((await marks.first().boundingBox())!.x).toBe(first!.x);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

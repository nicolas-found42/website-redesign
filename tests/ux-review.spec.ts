import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Regression checks for the September 23 adversarial UX review. Each test is
 * named for the GitHub issue it closes and asserts what a visitor should
 * experience instead of the friction the review found.
 */

test("#32: the inquiry dialog leads to the live form and carries service context", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Discuss workflows/ }).click();
  const dialog = page.getByRole("dialog");
  const live = dialog.getByRole("link", { name: "Open the live inquiry form" });
  await expect(live).toHaveClass(/\baction\b/);
  await expect(live).toHaveAttribute("href", "https://www.found42.com/contact");
  await expect(dialog.locator(".note").first()).toHaveText("About Workflows");
  await expect(dialog.locator(".inquiry-context")).toContainText(
    "Choose Automation in the live form. Add “Workflows” to your message so Found42 knows what to discuss.",
  );
  await expect(dialog.locator("form")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Talk to our team/ }).click();
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  await expect(dialog.locator(".note").first()).toHaveText(
    "Start with the bottleneck",
  );
  const result = await new AxeBuilder({ page })
    .include("dialog")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
});

test("#35, #36: business chrome avoids document furniture and technical surfaces", async ({
  page,
}) => {
  await page.goto("/");
  const interfaceFont = await page
    .locator("#navigation .nav-contact")
    .evaluate((element) => getComputedStyle(element).fontFamily);
  expect(interfaceFont).not.toMatch(/JetBrains|mono/i);
  await expect(page.locator("#audiences .choice-index")).toHaveCount(0);
  await expect(page.locator("#services .choice-index")).toHaveCount(0);
  for (const selector of ["#services", "#contact"]) {
    expect(
      await page
        .locator(selector)
        .evaluate(
          (element) => getComputedStyle(element, "::before").backgroundImage,
        ),
      selector,
    ).toBe("none");
  }

  await page.goto("/industries/private-equity/");
  expect(
    await page
      .locator(".page-stat")
      .first()
      .evaluate((element) => getComputedStyle(element).fontFamily),
  ).not.toMatch(/JetBrains|mono/i);
});

/** WCAG relative-luminance contrast between two computed `rgb()` colours. */
const contrast = (a: string, b: string) => {
  const lum = (colour: string) => {
    const [r, g, bl] = colour
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map((v) => {
        const c = Number(v) / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const routes = [
  "/",
  "/resources/",
  "/services/",
  "/industries/private-equity/",
  "/industries/b2b-saas/",
  "/about/",
  "/blog/",
];

test("#33: every filled action reads at 4.5:1 or better, at rest and on hover", async ({
  page,
}) => {
  // Seven routes, and a scroll and hover for every action on each: a sweep,
  // not a single journey, so it gets a sweep's time.
  test.slow();
  // At rest an action reads on its own fill; on hover the fill that runs
  // across it (its ::before) is the ground, read with the hover type colour.
  const read = (el: Element, ground: "rest" | "hover") => ({
    text: (el as HTMLElement).innerText.trim(),
    color: getComputedStyle(el).color,
    ground:
      ground === "rest"
        ? getComputedStyle(el).backgroundColor
        : getComputedStyle(el, "::before").backgroundColor,
  });
  for (const route of routes) {
    await page.goto(route);
    const actions = page.locator(".action:not(.action--ghost)");
    let checked = 0;
    for (const action of await actions.all()) {
      if (!(await action.isVisible())) continue;
      await page.mouse.move(0, 0);
      const states = [await action.evaluate(read, "rest" as const)];
      await action.scrollIntoViewIfNeeded();
      await action.hover();
      states.push(await action.evaluate(read, "hover" as const));
      for (const state of states)
        expect(
          contrast(state.color, state.ground),
          `${route} "${state.text}": ${state.color} on ${state.ground}`,
        ).toBeGreaterThanOrEqual(4.5);
      checked++;
    }
    expect(checked, route).toBeGreaterThan(0);
  }
});

test("#34: every opening that names Claude says what Claude is, once", async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto(route);
    const opening = page.locator(".hero-copy, .page-opening > div").first();
    const allOpeningText = await opening.innerText();
    const glosses = opening.getByText("Claude is Anthropic’s AI assistant.");
    if (allOpeningText.includes("Claude")) {
      await expect(glosses, route).toHaveCount(1);
      await expect(glosses, route).toBeVisible();
    } else await expect(glosses, route).toHaveCount(0);
  }
  // The homepage names Claude in its supporting copy, not the H1; the other
  // named routes keep the one-gloss rule.
  const named: string[] = [];
  for (const route of routes) {
    await page.goto(route);
    const opening = page.locator(".hero-copy, .page-opening > div").first();
    const says = await opening.innerText();
    if (says.includes("Claude")) named.push(route);
  }
  expect(named).toEqual([
    "/",
    "/services/",
    "/industries/private-equity/",
    "/industries/b2b-saas/",
    "/about/",
    "/blog/",
  ]);
});

test("#35: release-ready journeys no longer carry a global preview notice", async ({
  page,
}) => {
  for (const route of routes) {
    await page.goto(route);
    // #43 replaces the page-wide no-send disclaimer with truthful action-level
    // copy. The launch gate (noindex and production routing) remains unchanged.
    await expect(page.locator("main > .preview-note"), route).toHaveCount(0);
    const text = await page.locator("main").innerText();
    for (const notice of [
      /Design preview/i,
      /Design prototype/i,
      /not connected in this preview/i,
      /Nothing was sent/i,
      /nothing you type here is sent/i,
      /requested resources are not delivered/i,
    ])
      expect(text, `${route}: ${notice}`).not.toMatch(notice);
  }
  // A toolkit that needs ChatGPT on a Claude site says why.
  await page.goto("/resources/");
  await expect(page.locator("main")).toContainText(
    "Its practice advisors are custom GPTs, so they need a ChatGPT account.",
  );
});

test("#37: before handing off, the dialog says what the live form will ask", async ({
  page,
}) => {
  await page.goto("/about/");
  await page.getByRole("button", { name: /Talk to our team/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText(
    "starts news and updates at Yes: choose No if you only want a reply.",
  );
  await expect(dialog).toContainText(
    "It also asks you to agree to Found42 communications before it sends.",
  );
});

test("#38: the Private Equity page shows the founder's published M&A experience", async ({
  page,
}) => {
  await page.goto("/industries/private-equity/");
  const band = page.locator(".founder-band");
  await expect(band.getByRole("heading", { level: 2 })).toHaveText(
    "Richard Achée",
  );
  await expect(band).toContainText(
    "As an M&A business sponsor, he closed two successful strategic acquisitions at Google: Cameyo and Neverware.",
  );
  await expect(
    band.getByRole("link", { name: /Meet Richard Achée/ }),
  ).toHaveAttribute("href", /\/about\/$/);
  // It sits after what the firm would get, before how it is built.
  const order = await page
    .locator("main > section")
    .evaluateAll((sections) =>
      sections.map((s) => s.querySelector("h2")?.textContent?.trim()),
    );
  expect(order.indexOf("Richard Achée")).toBe(
    order.indexOf("High context. Clear controls.") + 1,
  );
  // Biography only: nothing presents it as a client or an endorsement.
  await expect(band).not.toContainText(/client|endorse/i);
});

test("#39: Services opens with the training tracks and publishes starting prices only", async ({
  page,
}) => {
  await page.goto("/services/");
  // The first band after the opening answers the buyer's first question.
  const first = await page
    .locator("main > section")
    .evaluateAll((sections) => sections[1]?.id);
  expect(first).toBe("tracks");
  const prices = await page
    .locator("#formats .price, #beyond-training .price")
    .allInnerTexts();
  for (const price of prices)
    expect(price.replace(/\s+/g, " ")).toMatch(
      /^(From \$[\d,]+ .+|Quoted after discovery)$/,
    );
  await expect(page.locator("#formats")).toContainText(
    "Every engagement gets a fixed quote after a free discovery assessment",
  );
  // The resources page's pointer lands on it.
  await page.goto("/resources/");
  await page.getByRole("link", { name: /See formats and pricing/ }).click();
  await expect(page).toHaveURL(/\/services\/#formats$/);
});

test("#40: the band and the dialog say what happens after an inquiry, not only what does not", async ({
  page,
}) => {
  const steps = [
    "You send an inquiry through Found42’s contact form.",
    "Found42 replies to arrange a first conversation.",
    "That conversation maps one workflow, its decision, source material, failure modes and review points, before any build is recommended.",
  ];
  await page.goto("/industries/b2b-saas/");
  const band = page.locator("#contact");
  await expect(band.locator(".inquiry-steps li")).toHaveText(steps);
  await expect(band).not.toContainText("does not book an appointment");
  await band.getByRole("button", { name: "Talk to us" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator(".inquiry-steps li")).toHaveText(steps);
  // Nothing claims a meeting has been booked.
  expect(await dialog.innerText()).not.toMatch(/\bbook(ed|ing)?\b/i);
});

test("#41: a Discuss button names the service in the live handoff", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Discuss workflows/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator(".note").first()).toHaveText("About Workflows");
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
  await expect(dialog.locator(".inquiry-context")).toContainText(
    "Choose Automation in the live form",
  );
});

test("#41: unavailable resource forms and local inquiry forms are absent", async ({
  page,
}) => {
  await page.goto("/resources/");
  await expect(page.locator("#library form")).toHaveCount(0);
  await expect(page.locator("#course form")).toHaveCount(0);
  await expect(page.locator("form[data-contact-form]")).toHaveCount(0);
  await page.getByRole("button", { name: /Talk to our team/ }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator("form")).toHaveCount(0);
  await expect(
    dialog.getByRole("link", { name: "Open the live inquiry form" }),
  ).toHaveAttribute("href", "https://www.found42.com/contact");
});

test("#41: unwritten essays are not timed, and unavailable newsletter copy is honest", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/blog/");
  const essays = page.locator(".essay-list article");
  await expect(essays).toHaveCount(3);
  await expect(essays.getByText("Coming soon")).toHaveCount(3);
  expect(await page.locator(".essay-list").innerText()).not.toMatch(
    /\d+\s*min/i,
  );
  await expect(page.locator("main")).toContainText(
    "No newsletter subscription is available yet.",
  );
  await expect(page.locator("[data-email-form]")).toHaveCount(0);
});

test("#41: the PE page leads with a workflow and makes no unapproved savings claim", async ({
  page,
}) => {
  await page.goto("/industries/private-equity/");
  const aside = page.locator(".page-opening .page-aside");
  await expect(aside).toContainText("A consistent first-pass screen");
  await expect(page.locator("main")).toContainText(
    "Turn a house view into a consistent first-pass screen without flattening judgment.",
  );
  await expect(page.locator("main")).not.toContainText(
    /8h|weekly capacity returned/i,
  );
});

test("#41: the scorecard says what its result is, not what it is not", async ({
  page,
}) => {
  await page.goto("/resources/");
  const intro = page.locator(".scorecard-intro");
  await expect(intro).toContainText(
    "Your result is a readiness stage, a status for each area and where to start.",
  );
  await expect(intro).not.toContainText("not a score");
});

import { test, expect } from "@playwright/test";

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

const routes = [
  "/",
  "/resources/",
  "/services/",
  "/industries/private-equity/",
  "/industries/b2b-saas/",
  "/about/",
  "/blog/",
];

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

test("#39: Services opens with training tracks and keeps delivery details without paid terms", async ({
  page,
}) => {
  await page.goto("/services/");
  // The first band after the opening answers the buyer's first question.
  const first = await page
    .locator("main > section")
    .evaluateAll((sections) => sections[1]?.id);
  expect(first).toBe("tracks");
  await expect(page.locator("#formats .catalog-option")).toHaveCount(6);
  await expect(page.locator("#beyond-training .catalog-option")).toHaveCount(4);
  expect(await page.locator("main").innerText()).not.toMatch(
    /\$[\d,]+|starting price|pricing/i,
  );
  // The resources page's pointer lands on it.
  await page.goto("/resources/");
  await page.getByRole("link", { name: /See delivery formats/ }).click();
  await expect(page).toHaveURL(/\/services\/#formats$/);
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

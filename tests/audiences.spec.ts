import { test, expect, type Page } from "@playwright/test";

/**
 * Three audiences, one method, each drawn its own way.
 *
 * These cover what the gallery has to guarantee rather than how it is built:
 * three audiences a visitor can discover and choose with a pointer, a touch or
 * a keyboard; copy, drawing, control state and link that agree with each other;
 * three genuinely different drawings; a complete still picture under reduced
 * motion or a pause; and all three panels readable without a script.
 */

const names = [/C-level executives/, /Individual contributors/, /AI builders/];
const kickers = [
  "For C-level executives",
  "For individual contributors",
  "For AI builders",
];
const links = [
  ["Explore usable systems", /services\/#service-automation$/],
  ["Explore tailored training", /services\/#service-training$/],
  ["Explore how we help builders", /services\/#services$/],
] as const;
const drawings = [
  /Executive illustration:/,
  /Contributor illustration:/,
  /Builder illustration:/,
];

/** Everything the shown scene has settled into, as a browser reports it. */
const shown = (page: Page) =>
  page.evaluate(() => {
    const panel = document.querySelector(".audience-panel:not([hidden])")!;
    const field = panel.querySelector(".scene-field")!;
    return {
      kicker: panel.querySelector(".audience-kicker")?.textContent?.trim(),
      describedBy: field.getAttribute("aria-label"),
      pressed: [...document.querySelectorAll("[data-audience]")].map((el) =>
        el.getAttribute("aria-pressed"),
      ),
      // A settled drawing carries no half-finished draw on any route.
      drawing: [...field.querySelectorAll(".route")].filter((route) =>
        route.hasAttribute("stroke-dasharray"),
      ).length,
      faded: [...field.querySelectorAll(".marker-body, .system-label-text")]
        .map((el) => getComputedStyle(el).opacity)
        .filter((opacity) => opacity !== "1").length,
    };
  });

test("a visitor can discover and choose all three audiences, and everything agrees", async ({
  page,
}) => {
  await page.goto("/#audiences");
  const rail = page.getByRole("group", { name: "Choose an audience" });
  for (const name of names)
    await expect(rail.getByRole("button", { name })).toBeVisible();
  await expect(page.locator(".audience-panel:not([hidden])")).toHaveCount(1);

  for (const [index, name] of names.entries()) {
    await rail.getByRole("button", { name }).click();
    const panel = page.locator(".audience-panel:not([hidden])");
    await expect(panel).toHaveCount(1);
    await expect(panel.locator(".audience-kicker")).toHaveText(kickers[index]);
    await expect(panel.getByRole("img")).toHaveAccessibleName(drawings[index]);
    await expect(
      panel.getByRole("link", { name: links[index][0] }),
    ).toHaveAttribute("href", links[index][1]);
    await expect(rail.getByRole("button", { name })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      (await shown(page)).pressed.filter((p) => p === "true"),
    ).toHaveLength(1);
  }
});

test("the arrows and the arrow keys move the choice, and focus stays where it was", async ({
  page,
}) => {
  await page.goto("/#audiences");
  const next = page.getByRole("button", { name: "Next audience" });
  const previous = page.getByRole("button", { name: "Previous audience" });
  await next.click();
  await expect(page.locator(".audience-panel:not([hidden]) h3")).toHaveText(
    /Automate the repetitive,\s*keep the craft\./,
  );
  // Focus is not moved into the panel by the choice. WebKit does not focus a
  // clicked button at all, so what is asserted is where focus did not go.
  expect(
    await page.evaluate(
      () => !document.activeElement?.closest(".audience-panel"),
    ),
  ).toBe(true);
  await next.click();
  await next.click();
  await expect(page.locator(".audience-panel:not([hidden]) h3")).toHaveText(
    /Install a system,\s*not a tool rollout\./,
  );
  await previous.click();
  await expect(page.locator(".audience-panel:not([hidden]) h3")).toHaveText(
    /Build for your team,\s*no engineering background\./,
  );

  const first = page.getByRole("button", { name: names[0] });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  const second = page.getByRole("button", { name: names[1] });
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("End");
  await expect(page.getByRole("button", { name: names[2] })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.locator(".audience-panel:not([hidden]) .audience-kicker"),
  ).toHaveText(kickers[0]);
});

test("the three audience drawings are three different drawings, not one relabelled", async ({
  page,
}) => {
  await page.goto("/#audiences");
  await page.evaluate(() => document.fonts.ready);
  const signatures = await page.evaluate(() =>
    [...document.querySelectorAll(".audience-panel .scene-field")].map(
      (field) =>
        JSON.stringify([
          [...field.querySelectorAll(".route")].map((route) =>
            route.getAttribute("d"),
          ),
          [...field.querySelectorAll(".frame")].map((frame) =>
            frame.getAttribute("width"),
          ),
          [...field.querySelectorAll(".marker")].map((marker) =>
            marker.getAttribute("class"),
          ),
        ]),
    ),
  );
  expect(signatures).toHaveLength(3);
  expect(new Set(signatures).size).toBe(3);
  // Distinct from the service schematics as well, not only from each other.
  const cast = await page.evaluate(() =>
    [...document.querySelectorAll(".audience-panel .system-label")].map(
      (label) => label.textContent,
    ),
  );
  expect(cast).toContain("Install a system");
  expect(cast).toContain("Deal team");
  expect(cast).toContain("Troubleshoot");
  expect(cast).not.toContain("Useful prompts");
});

test("a reduced-motion visitor gets a complete still scene on every choice", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#audiences");
  await page.evaluate(() => document.fonts.ready);
  for (const name of [names[1], names[2], names[0]]) {
    await page.getByRole("button", { name }).click();
    const state = await shown(page);
    expect(state.drawing).toBe(0);
    expect(state.faded).toBe(0);
    expect(
      await page.evaluate(() =>
        document
          .getAnimations()
          .map((animation) =>
            Number(animation.effect?.getTiming().duration ?? 0),
          )
          .filter((duration) => duration > 1),
      ),
    ).toEqual([]);
  }
});

test("pausing while a scene is being told leaves it complete, not mid-draw", async ({
  page,
}) => {
  await page.goto("/#audiences");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: names[2] }).click();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect.poll(async () => (await shown(page)).drawing).toBe(0);
  await expect.poll(async () => (await shown(page)).faded).toBe(0);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBe(0);
  await expect(
    page.locator(".audience-panel:not([hidden]) .system-label").first(),
  ).toBeVisible();
});

test("a visitor on a phone gets the portrait scenes and can choose by touch", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/#audiences");
  const ratio = await page
    .locator(".audience-panel:not([hidden]) .scene-field")
    .evaluate((field) =>
      (field as HTMLElement).style.getPropertyValue("--ratio"),
    );
  expect(ratio.trim()).toMatch(/^620 \//);
  await page.getByRole("button", { name: names[1] }).tap();
  await expect(
    page.locator(".audience-panel:not([hidden]) .audience-kicker"),
  ).toHaveText(kickers[1]);
  await expect(
    page.locator(".audience-panel:not([hidden])").getByText("Deal team", {
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});

test("the failure-mode figure explains the playbook without inventing its checks", async ({
  page,
}) => {
  await page.goto("/resources/#playbook");
  const figure = page.locator("#playbook .review-figure");
  await expect(figure.getByRole("img")).toHaveAccessibleName(
    /weak outputs, missing context, false confidence/,
  );
  for (const check of ["Weak outputs", "Missing context", "False confidence"])
    await expect(figure.getByText(check, { exact: true })).toBeVisible();
  await expect(figure).toContainText("not reproduced here");
  await expect(
    page.getByRole("link", {
      name: /Request the published AI Failure Modes Playbook/,
    }),
  ).toHaveAttribute(
    "href",
    "https://www.found42.com/ai-failure-modes-playbook",
  );
});

test("public copy no longer says “no fluff” on any route or in the course dialog", async ({
  page,
}) => {
  for (const route of [
    "",
    "resources/",
    "services/",
    "industries/private-equity/",
    "industries/b2b-saas/",
    "about/",
    "blog/",
  ]) {
    await page.goto(`/${route}`);
    if (route === "resources/") {
      await page.locator('[data-dialog="course"]').click();
      await expect(page.getByRole("dialog")).toContainText(
        "One short, practical lesson each day for five days.",
      );
    }
    const text = await page.evaluate(() => document.documentElement.outerHTML);
    expect(text, route).not.toMatch(/no[\s-]*fluff/i);
  }
});

import { test, expect, type Page } from "@playwright/test";
import { readField } from "./drawing";

/**
 * The working-system drawing.
 *
 * These cover what the drawing has to guarantee rather than how it is built:
 * three distinct compositions a visitor can reach with a keyboard or a touch,
 * the same still composition at rest however it was reached, and no drawing
 * state — a piece still lifted, a word still faded, an animation still
 * attached — left behind by an interrupted or reduced-motion transition.
 */

/** Everything the sticky drawing shows, as a browser would report it. */
const drawing = async (target: Page) => ({
  field: await target
    .locator(".services-art .system-field")
    .evaluate(readField),
  ...(await target.evaluate(() => {
    const round = (value: number) => Math.round(value * 10) / 10;
    return {
      caption: document.querySelector(".services-caption")?.textContent,
      pressed: [...document.querySelectorAll("#services .choice")].map(
        (choice) => choice.getAttribute("aria-pressed"),
      ),
      leaning: [
        ...document.querySelectorAll(".services-art .system-field"),
      ].map((el) =>
        round(
          Number((el as HTMLElement).style.getPropertyValue("--lean-x")) || 0,
        ),
      ),
    };
  })),
});

test("the service diagrams make each customer stage visible", async ({
  page,
}) => {
  await page.goto("/#services");
  const visibleLabels = (service: string) =>
    page.locator(`#service-${service} .system-label`).allTextContents();

  expect(await visibleLabels("training")).toEqual([
    "Team's real work, designed at the whiteboard",
    "Live guided practice at the keyboard",
    "Group review",
    "Reusable skill",
    "Apply afterwards",
  ]);
  expect(await visibleLabels("automation")).toEqual([
    "Brief / operating problem",
    "Tailored design and build",
    "Team deploys and uses it",
    "Test and review",
    "Review in customer context",
    "Review point: does it still fit the work?",
    "Iteration back into tailored design and build",
  ]);
  expect(await visibleLabels("product")).toEqual([
    "Repetitive work",
    "System handoffs",
    "Human direction",
    "Human review",
    "Usable output",
  ]);
});

test("every service stays readable on the page whichever drawing is shown", async ({
  page,
}) => {
  await page.goto("/#services");
  for (const title of ["Workshops", "Workflows", "Automations"]) {
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
});

test("a completed choice rests in the same still composition as a fresh page", async ({
  page,
  context,
}) => {
  await page.goto("/#services");
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole("button", { name: "Workflows", exact: true }).click();

  const motionlessPage = await context.newPage();
  await motionlessPage.emulateMedia({ reducedMotion: "reduce" });
  await motionlessPage.goto("/#services");
  await motionlessPage.evaluate(() => document.fonts.ready);
  await motionlessPage
    .getByRole("button", { name: "Workflows", exact: true })
    .click();
  // WebKit suspends animations in background tabs. Capture the fresh still
  // state while its tab is active, then close it before polling the first page.
  await expect
    .poll(async () => (await drawing(motionlessPage)).field.animating)
    .toBe(0);
  const still = await drawing(motionlessPage);
  await motionlessPage.close();
  await page.bringToFront();

  await expect
    .poll(async () => drawing(page), {
      message: "a settled drawing should leave no entrance state behind",
      timeout: 8000,
    })
    .toEqual(still);
});

for (const interruption of ["queued", "moving"]) {
  test(`switching to reduced motion during rapid choices leaves a complete drawing (${interruption})`, async ({
    page,
    context,
  }) => {
    await page.goto("/#services");
    await page.evaluate(() => document.fonts.ready);
    // Four choices in one task, so the last transition is genuinely in flight
    // when the motion preference changes.
    const { interrupted, movement } = await page.evaluate(async (mode) => {
      // Start away from the final article so the moving case always has a
      // real smooth scroll to interrupt, even in an engine that aligns the
      // initial fragment differently.
      window.scrollTo({ top: 0, behavior: "instant" });
      const origin = scrollY;
      // Observe every frame before clicking: driver round trips can miss a
      // native jump entirely, especially when WebKit is under load.
      const moving =
        mode === "moving"
          ? new Promise<number>((resolve) => {
              let frame = 0;
              let previous = origin;
              const timeout = window.setTimeout(() => {
                cancelAnimationFrame(frame);
                resolve(0);
              }, 2000);
              const sample = () => {
                const current = scrollY;
                const delta = Math.abs(current - previous);
                if (previous !== origin && current !== origin && delta > 0) {
                  clearTimeout(timeout);
                  resolve(delta);
                } else {
                  previous = current;
                  frame = requestAnimationFrame(sample);
                }
              };
              frame = requestAnimationFrame(sample);
            })
          : Promise.resolve(0);
      const choices = [
        ...document.querySelectorAll<HTMLButtonElement>("#services .choice"),
      ];
      [1, 2, 0, 2].forEach((index) => choices[index].click());
      const interrupted = document
        .querySelector(".services-art .system-field")
        ?.getAttribute("aria-label");
      matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
        "change",
        () => {
          document.documentElement.dataset.motionChanged = "true";
        },
        { once: true },
      );
      return { interrupted, movement: await moving };
    }, interruption);
    if (interruption === "moving") {
      expect(
        movement,
        "native scrolling is still moving before the switch",
      ).toBeGreaterThan(0);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-motion-changed",
      "true",
    );
    await expect
      .poll(
        () =>
          page.locator('[data-service-article="2"]').evaluate((article) => {
            const box = article.getBoundingClientRect();
            return Math.abs(box.top + box.height / 2 - innerHeight / 2);
          }),
        { message: "the requested service lands at the reading position" },
      )
      .toBeLessThan(60);

    const expectedPage = await context.newPage();
    await expectedPage.emulateMedia({ reducedMotion: "reduce" });
    await expectedPage.goto("/#services");
    await expectedPage.evaluate(() => document.fonts.ready);
    await expectedPage
      .getByRole("button", { name: "Automations", exact: true })
      .click();
    await expectedPage.waitForTimeout(500);
    await expect
      .poll(async () => (await drawing(expectedPage)).field.animating)
      .toBe(0);
    const still = await drawing(expectedPage);
    await expectedPage.close();
    await page.bringToFront();

    // The last explicit choice remains authoritative while its scroll settles;
    // the reading observer may pass other articles on the way there.
    await expect
      .poll(
        () =>
          page
            .getByRole("button", { name: "Automations", exact: true })
            .getAttribute("aria-pressed"),
        { timeout: 8000 },
      )
      .toBe("true");
    await expect(page.locator('[data-service-article="2"]')).toHaveClass(
      /is-current/,
    );
    await expect
      .poll(async () => drawing(page), {
        message: "an interrupted drawing should finish as the motionless one",
        timeout: 8000,
      })
      .toEqual(still);
    // The rapid clicks end on Automations; the drawing must settle on that
    // customer journey even if the reading observer briefly reports another.
    // This checks the label captured before the motion change, not its current value.
    expect(interrupted).toBe(
      "Automation illustration: a repetitive process crosses system handoffs, passes human review where judgment matters, and ends in a usable output the team can rely on.",
    );
  });
}

for (const timing of [
  "before the jump frame",
  "without a frame wait",
  "after the jump frame",
]) {
  test(`a reduced-motion service jump lands after later layout handlers (${timing})`, async ({
    page,
  }) => {
    await page.goto("/#services");
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate((holdFrame) => {
      // Hold animation frames until the media event has reached all subscribers,
      // so the before-frame case exercises cancellation of the pending click.
      const raf = requestAnimationFrame;
      const cancel = cancelAnimationFrame;
      const pending = new Map<number, FrameRequestCallback>();
      let nextId = -1;
      if (holdFrame) {
        window.requestAnimationFrame = (callback) => {
          const id = nextId--;
          pending.set(id, callback);
          return id;
        };
        window.cancelAnimationFrame = (id) => {
          if (id < 0) pending.delete(id);
          else cancel(id);
        };
      }
      // Native smooth scrolling can suppress scroll anchoring. Model a later
      // motion subscriber restoring content after the reading handler runs.
      document.documentElement.style.overflowAnchor = "none";
      matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
        "change",
        () => {
          document.querySelector<HTMLElement>("#services")!.style.paddingTop =
            "1200px";
          if (holdFrame) {
            window.requestAnimationFrame = raf;
            window.cancelAnimationFrame = cancel;
            for (const callback of pending.values()) raf(callback);
            pending.clear();
          }
        },
        { once: true },
      );
      document.querySelector<HTMLButtonElement>('[data-service="2"]')!.click();
    }, timing === "before the jump frame");
    if (timing === "after the jump frame") {
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve()),
          ),
      );
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect
      .poll(() =>
        page.locator('[data-service-article="2"]').evaluate((article) => {
          const box = article.getBoundingClientRect();
          return Math.abs(box.top + box.height / 2 - innerHeight / 2);
        }),
      )
      .toBeLessThan(60);
    await expect(
      page.getByRole("button", { name: "Automations", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });
}

test("a visitor on a phone gets each service's own drawing and can jump between them", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/#services");

  // The narrow layout gives every article its own drawing rather than one
  // sticky pane, so all three are on the page at once.
  for (const name of [
    /Workshop illustration:/,
    /Workflow illustration:/,
    /Automation illustration:/,
  ]) {
    await expect(page.getByRole("img", { name })).toHaveCount(1);
  }
  await expect(
    page
      .locator("#service-training")
      .getByText("Live guided practice at the keyboard", {
        exact: true,
      }),
  ).toBeVisible();
  await expect(
    page.locator("#service-automation").getByText("Brief / operating problem", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.locator("#service-product").getByText("Repetitive work", {
      exact: true,
    }),
  ).toBeVisible();

  const automation = page.getByRole("button", {
    name: "Workflows",
    exact: true,
  });
  await automation.tap();
  await expect(automation).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-service-article="1"]')).toHaveClass(
    /is-current/,
  );
  await context.close();
});

test("every route removes the manual motion toggle while keeping drawing content", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/services/",
    "/resources/",
    "/about/",
    "/blog/",
    "/industries/private-equity/",
    "/industries/b2b-saas/",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("button", {
        name: /Pause motion|Play motion|Resume motion/,
      }),
    ).toHaveCount(0);
  }
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  // The opening is text alone: no drawing on the homepage before Audiences.
  await expect(page.locator("#hero .system-field")).toHaveCount(0);
});

test("a slow font does not hold the opening headline back", async ({
  page,
}) => {
  // The split waits for the fonts so it can measure real line boxes. If that
  // wait also gated the entrance, a slow font would leave the headline hidden
  // for as long as it took — so the entrance must not wait for it.
  let releaseFonts = () => {};
  const fontsHeld = new Promise<void>((resolve) => {
    releaseFonts = resolve;
  });
  await page.route("**/*.woff2", async (route) => {
    await fontsHeld;
    await route.continue();
  });

  try {
    await page.goto("/", { waitUntil: "commit" });

    const headline = page.getByRole("heading", { level: 1 });
    await expect(headline).toHaveClass(/is-in/, { timeout: 5000 });
    await expect
      .poll(
        () =>
          headline.evaluate((element) =>
            [...element.querySelectorAll(".line-move, .word")].every((part) => {
              const transform = getComputedStyle(part).transform;
              return (
                transform === "none" || transform === "matrix(1, 0, 0, 1, 0, 0)"
              );
            }),
          ),
        { timeout: 2000 },
      )
      .toBe(true);
    await expect(headline).toHaveText(
      "Train teams. Build useful skills. Automate the work.",
    );
  } finally {
    releaseFonts();
  }
});

test("requesting reduced motion during a transition leaves the drawing settled", async ({
  page,
}) => {
  await page.goto("/#services");
  await page.evaluate(() => document.fonts.ready);
  await expect(
    page.getByRole("button", { name: "Workshops", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  /**
   * Driven from inside the page so the preference change lands at a known point: the new
   * composition's pieces are laid on a timer once the old ones have been
   * lifted off, and the whole question is whether that timer survives the
   * preference change. Round-tripping each click through the driver would let its latency
   * drift past the window being tested.
   *
   * Sampled across that window rather than polled for an eventual state — a
   * stale entrance finishes on its own, so waiting for quiet would pass whether
   * or not it ever started.
   */
  await page.evaluate(async () => {
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    document.querySelector<HTMLButtonElement>('[data-service="1"]')!.click();
    await sleep(120);
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const disturbed = await page.evaluate(async () => {
    const field = document.querySelector(".services-art")!;
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const seen = { drawing: 0, running: 0 };
    for (let sample = 0; sample < 15; sample += 1) {
      await sleep(60);
      seen.drawing = Math.max(
        seen.drawing,
        // A piece lifted off, or laid and not yet at rest, is not settled.
        [...field.querySelectorAll(".part-body, .system-label-text")].filter(
          (piece) => getComputedStyle(piece).opacity !== "1",
        ).length,
      );
      seen.running = Math.max(
        seen.running,
        field
          .getAnimations({ subtree: true })
          .filter((animation) => animation.playState === "running").length,
      );
    }
    return seen;
  });
  expect(disturbed).toEqual({ drawing: 0, running: 0 });

  await expect(
    page.locator(".services-art .system-field .system-label").first(),
  ).toBeVisible();
});

test("the service drawings are three different drawings, not one repeated", async ({
  browser,
}) => {
  // Descriptions and copy are per-service already, so a drawing that lost its
  // own geometry would still satisfy every other check in this file.
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/#services");
  await page.evaluate(() => document.fonts.ready);

  const figures = page.locator(".service-figure .system-field");
  await expect(figures).toHaveCount(3);
  const states = await Promise.all(
    [0, 1, 2].map((index) => figures.nth(index).evaluate(readField)),
  );
  // The artwork differs, not only the words: no two share their geometry, and
  // no two are built from the same pieces.
  expect(new Set(states.map((state) => state.geometry)).size).toBe(3);
  expect(
    new Set(
      states.map((state) =>
        JSON.stringify(state.parts.map((piece) => piece.name)),
      ),
    ).size,
  ).toBe(3);
  await context.close();
});

test("the drawing's CSS geometry resolves the same in every engine", async ({
  page,
}) => {
  // Every entrance scales, swings or unfolds a piece about a point given in
  // the drawing's own units. That needs `transform-box: view-box` and a
  // length-valued origin; an engine that dropped either would turn every
  // piece about the wrong point, so both must resolve as written everywhere.
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const bodies = await page
    .locator(".services-art .system-field .part-body")
    .evaluateAll((all) =>
      all.map((body) => {
        const style = getComputedStyle(body);
        const lengths = (value: string) =>
          [...value.matchAll(/(-?[\d.]+)px/g)].map((match) => Number(match[1]));
        return {
          box: style.transformBox,
          // As authored in the markup, before any engine serialises it.
          written: lengths(
            /transform-origin:\s*([^;]+)/.exec(
              body.getAttribute("style") ?? "",
            )?.[1] ?? "",
          ),
          // Engines differ only in whether they print a zero depth.
          resolved: lengths(style.transformOrigin),
        };
      }),
    );
  expect(bodies.length).toBeGreaterThan(5);
  for (const body of bodies) {
    expect(body.box).toBe("view-box");
    expect(body.written).toHaveLength(2);
    expect(body.resolved.slice(0, 2)).toEqual(body.written);
    expect(body.resolved.slice(2).every((depth) => depth === 0)).toBe(true);
  }
  // And each word resolves to real, readable type in every engine.
  const sizes = await page
    .locator(".services-art .system-label-text")
    .evaluateAll((all) =>
      all.map((text) => parseFloat(getComputedStyle(text).fontSize)),
    );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(13);
});

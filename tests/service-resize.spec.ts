import { test, expect } from "@playwright/test";
import { readField } from "./drawing";

// These scenarios exercise several native scrolls and complete drawing transitions.
test.setTimeout(90_000);

const textLayout = (element: Element) => {
  const field = element.getBoundingClientRect();
  const labels = [...element.querySelectorAll(".system-label-text")].map(
    (label) => ({
      text: label.textContent,
      box: label.getBoundingClientRect(),
      size: Number.parseFloat(getComputedStyle(label).fontSize),
    }),
  );
  return {
    overlaps: labels.flatMap((a, i) =>
      labels
        .slice(i + 1)
        .filter(
          (b) =>
            a.box.left < b.box.right - 1 &&
            b.box.left < a.box.right - 1 &&
            a.box.top < b.box.bottom - 1 &&
            b.box.top < a.box.bottom - 1,
        )
        .map((b) => `${a.text} / ${b.text}`),
    ),
    clipped: labels
      .filter(
        ({ box }) =>
          box.left < field.left - 2 ||
          box.right > field.right + 2 ||
          box.top < field.top - 2 ||
          box.bottom > field.bottom + 2,
      )
      .map((label) => label.text),
    smallestType: Math.min(...labels.map((label) => label.size)),
  };
};

for (const [name, id] of [
  ["Workflows", "automation"],
  ["Automations", "product"],
] as const) {
  test(`${name} stays complete and readable after repeated contraction and expansion`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 878 });
    await page.goto("/#services");
    await page.evaluate(() => document.fonts.ready);
    // The article's own complete still composition is the independent
    // reference for every word; the pinned drawing must carry the same story.
    const expected = (
      await page.locator(`#service-${id} .system-field`).evaluate(readField)
    ).labels.map((label) => label.text);
    const field = page.locator(".services-art .system-field");
    for (let cycle = 0; cycle < 2; cycle += 1) {
      await page
        .getByRole("button", {
          name: name === "Workflows" ? "Automations" : "Workflows",
          exact: true,
        })
        .click();
      await expect
        .poll(async () => (await field.evaluate(readField)).animating)
        .toBe(0);
      await page.getByRole("button", { name, exact: true }).click();
      // Resizing within the wide layout must work without relying on an
      // orientation-change rebuild to repair a broken transition.
      for (const width of [1024, 961, 1920]) {
        await page.setViewportSize({ width, height: 878 });
        // Reflow can put a different article into the reader band without a
        // scroll. Keep the requested article at the reading position before
        // checking its drawing; the first resize still interrupts the morph.
        const article = page.locator(`#service-${id}`);
        await article.evaluate((element) =>
          element.scrollIntoView({ behavior: "instant", block: "center" }),
        );
        await expect
          .poll(() =>
            article.evaluate((element) => {
              const box = element.getBoundingClientRect();
              return (
                box.top <= innerHeight / 2 && box.bottom >= innerHeight / 2
              );
            }),
          )
          .toBe(true);
        await expect(
          page.getByRole("button", { name, exact: true }),
        ).toHaveAttribute("aria-pressed", "true");
        await expect
          .poll(
            async () =>
              (await field.evaluate(readField)).labels.map(
                (label) => label.text,
              ),
            { timeout: 8000 },
          )
          .toEqual(expected);
        await expect
          .poll(async () => (await field.evaluate(readField)).unsettled)
          .toEqual({ parts: 0, words: 0 });
        const layout = await field.evaluate(textLayout);
        expect(layout.overlaps, `${name}, cycle ${cycle}, ${width}px`).toEqual(
          [],
        );
        expect(layout.clipped).toEqual([]);
        expect(layout.smallestType).toBeGreaterThanOrEqual(13);
      }
    }
  });

  test(`${name} keeps its complete portrait and landscape story when resized during a transition`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 878 });
    await page.goto("/#services");
    await page.evaluate(() => document.fonts.ready);
    const portrait = page.locator(`#service-${id} .system-field`);
    const expected = (await portrait.evaluate(readField)).labels.map(
      (label) => label.text,
    );
    for (const width of [628, 1920, 384, 1920]) {
      // Click within the page and immediately resize while the old pieces
      // are being lifted, before the timed artwork swap can run.
      await page.evaluate(
        (choice) => {
          document
            .querySelector<HTMLButtonElement>(
              `[data-service="${choice === 1 ? 2 : 1}"]`,
            )!
            .click();
          document
            .querySelector<HTMLButtonElement>(`[data-service="${choice}"]`)!
            .click();
        },
        name === "Workflows" ? 1 : 2,
      );
      await page.setViewportSize({ width, height: 878 });
      await page.getByRole("button", { name, exact: true }).click();
      const field =
        width <= 960 ? portrait : page.locator(".services-art .system-field");
      await field.scrollIntoViewIfNeeded();
      await expect
        .poll(
          async () =>
            (await field.evaluate(readField)).labels.map((label) => label.text),
          { timeout: 8000 },
        )
        .toEqual(expected);
      await expect
        .poll(async () => (await field.evaluate(readField)).animating, {
          timeout: 8000,
        })
        .toBe(0);
      const layout = await field.evaluate(textLayout);
      expect(layout.overlaps).toEqual([]);
      expect(layout.clipped).toEqual([]);
      expect(layout.smallestType).toBeGreaterThanOrEqual(13);
    }
  });
}

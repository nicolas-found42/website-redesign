import { test, expect, type Page } from "@playwright/test";

/**
 * Review-mode visual accessibility (#124) and colour semantics (#128), plus the
 * presentation half of #126 (pinned target quote, scroll cue). Everything here
 * is measured from computed styles and real geometry — no eyeballing. The
 * review chrome lives in a shadow root, so every probe enters
 * `#found42-review`.shadowRoot.
 */

const VIEW = "#found42-review";

/** Starts picking and opens the form on the hero heading. */
async function openForm(page: Page) {
  await page.goto("/?review");
  await page.getByRole("button", { name: "Add feedback" }).click();
  await page.locator("#hero-title").click();
  const form = page.getByRole("dialog");
  await expect(form).toBeVisible();
  return form;
}

type Sample = {
  name: string;
  px: number;
  weight: string;
  ratio: number;
  ground: string;
};

/** Real WCAG 2.x contrast of each instructional string against its ground. */
const measure = (page: Page) =>
  page.evaluate((view) => {
    const root = document.querySelector(view)!.shadowRoot!;
    const parse = (value: string) => {
      const parts = (value.match(/[\d.]+/g) ?? []).map(Number);
      return parts.length === 3 ? [...parts, 1] : parts;
    };
    const over = (fg: number[], bg: number[]) =>
      [0, 1, 2].map((i) => Math.round(fg[i] * fg[3] + bg[i] * (1 - fg[3])));
    const luminance = ([r, g, b]: number[]) => {
      const channel = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const contrast = (a: number[], b: number[]) => {
      const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
      return +((hi + 0.05) / (lo + 0.05)).toFixed(2);
    };
    // The first opaque ground up the composed tree: shadow ancestors, then the
    // host, then the page.
    const ground = (element: Element) => {
      let node: Element | null = element;
      while (node) {
        const bg = parse(getComputedStyle(node).backgroundColor);
        if (bg[3] > 0.5) return bg.slice(0, 3);
        const parent: Element | null = node.parentElement;
        node =
          parent ??
          (node.getRootNode() instanceof ShadowRoot
            ? (node.getRootNode() as ShadowRoot).host
            : null);
      }
      return [250, 249, 246];
    };
    const sample = (selector: string, name: string): Sample | null => {
      const element = root.querySelector(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      const behind = ground(element.parentElement ?? element);
      const fg = over(parse(style.color), behind);
      return {
        name,
        px: +parseFloat(style.fontSize).toFixed(1),
        weight: style.fontWeight,
        ratio: contrast(fg, behind),
        ground: `rgb(${behind.join(",")})`,
      };
    };
    return [
      sample(".panel-head .eyebrow", "eyebrow"),
      sample(".panel-head .where", "where"),
      sample(".panel-body .hint", "hint"),
      sample(".choice-hint", "choice-hint"),
      sample('.choice:has(input:checked) .choice-hint', "checked choice-hint"),
      sample(".bar-notice", "bar-notice"),
      sample(".bar-warning", "bar-warning"),
    ].filter((entry): entry is Sample => entry !== null);
  }, VIEW);

test("#124: every instructional string is measured at 4.5:1 or better", async ({
  page,
}) => {
  await openForm(page);
  const samples = await measure(page);
  expect(samples.length).toBeGreaterThanOrEqual(7);
  for (const sample of samples) {
    // Nothing here is large text: all the helpers are 12-15px, so 4.5:1 is
    // the bar for every one of them.
    expect(
      sample.ratio,
      `${sample.name} (${sample.px}px/${sample.weight}) ${sample.ratio}:1 on ${sample.ground}`,
    ).toBeGreaterThanOrEqual(4.5);
  }
  // The measured figures the PR cites, pinned so they cannot silently drift.
  const byName = new Map(samples.map((s) => [s.name, s.ratio]));
  expect(byName.get("hint")).toBeCloseTo(7.13, 1);
  expect(byName.get("choice-hint")).toBeCloseTo(6.69, 1);
  expect(byName.get("eyebrow")).toBeCloseTo(6.47, 1);
  expect(byName.get("where")).toBeCloseTo(6.47, 1);
});

test("#124: helper text keeps its meaning — nothing is hidden to pass", async ({
  page,
}) => {
  const form = await openForm(page);
  // Information preservation, without pinning copy another stream may edit:
  // the instructional tier is still rendered and still says something.
  const helpers = form.locator(".hint, .eyebrow, .where, .choice-hint");
  const count = await helpers.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const helper = helpers.nth(i);
    if (!(await helper.isVisible())) continue;
    expect((await helper.innerText()).trim().length).toBeGreaterThan(0);
  }
});

test("#124: close, radios and checkbox present measured >= 24px targets", async ({
  page,
}) => {
  await openForm(page);
  const sizes = await page.evaluate((view) => {
    const root = document.querySelector(view)!.shadowRoot!;
    const box = (selector: string) => {
      const element = root.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { w: +rect.width.toFixed(1), h: +rect.height.toFixed(1) };
    };
    const visible = (element: Element) => element.getClientRects().length > 0;
    return {
      close: box(".panel .close"),
      checkbox: box(".check input"),
      card: box(".choice"),
      // Only rendered radios: a radio inside a hidden kind/action group is
      // display:none and is meant to have no box.
      radios: [...root.querySelectorAll(".choice input")]
        .filter(visible)
        .map((input) => {
          const rect = input.getBoundingClientRect();
          return { w: +rect.width.toFixed(1), h: +rect.height.toFixed(1) };
        }),
    };
  }, VIEW);

  // 44px preferred for close, and the whole square is the hit area.
  expect(sizes.close!.w).toBeGreaterThanOrEqual(44);
  expect(sizes.close!.h).toBeGreaterThanOrEqual(44);
  // Every radio and the checkbox present at least a 24x24 target.
  expect(sizes.radios.length).toBeGreaterThanOrEqual(4);
  for (const radio of sizes.radios) {
    expect(radio.w).toBeGreaterThanOrEqual(24);
    expect(radio.h).toBeGreaterThanOrEqual(24);
  }
  expect(sizes.checkbox!.w).toBeGreaterThanOrEqual(24);
  expect(sizes.checkbox!.h).toBeGreaterThanOrEqual(24);
  // The card itself stays a comfortable target.
  expect(sizes.card!.h).toBeGreaterThanOrEqual(44);
});

test("#124: whole-card tappability is visibly afforded for pointer and touch", async ({
  page,
}) => {
  const form = await openForm(page);
  const card = form.locator(".choice", { hasText: "Content" });
  expect(
    await card.evaluate((element) => getComputedStyle(element).cursor),
  ).toBe("pointer");

  const rest = await card.evaluate(
    (element) => getComputedStyle(element).borderTopColor,
  );
  await card.hover();
  const hover = await card.evaluate(
    (element) => getComputedStyle(element).borderTopColor,
  );
  // A visible hover change, not just a cursor: the affordance is real.
  expect(hover).not.toBe(rest);
  expect(hover).toBe("rgb(32, 32, 31)");

  // Touch/pointer: pressing the card anywhere (not the small circle) chooses it.
  await card.click({ position: { x: 120, y: 30 } });
  await expect(form.getByRole("radio", { name: "Content" })).toBeChecked();
});

test("#128: selection, primary, invalid and destructive are four distinct hues", async ({
  page,
}) => {
  await openForm(page);
  const styles = await page.evaluate((view) => {
    const root = document.querySelector(view)!.shadowRoot!;
    const hue = (value: string) => {
      const [r, g, b] = (value.match(/[\d.]+/g) ?? ["0", "0", "0"]).map(Number);
      const [rn, gn, bn] = [r / 255, g / 255, b / 255];
      const max = Math.max(rn, gn, bn);
      const min = Math.min(rn, gn, bn);
      const d = max - min;
      if (!d) return 0;
      let h: number;
      if (max === rn) h = ((gn - bn) / d) % 6;
      else if (max === gn) h = (bn - rn) / d + 2;
      else h = (rn - gn) / d + 4;
      return +((h * 60 + 360) % 360).toFixed(1);
    };
    const selected = root.querySelector(".choice:has(input:checked)")!;
    const selectedStyle = getComputedStyle(selected);
    const primary = root.querySelector(".panel .primary")!;
    const primaryStyle = getComputedStyle(primary);
    const barPrimary = root.querySelector(".bar .primary")!;
    return {
      selectedBorder: selectedStyle.borderTopColor,
      selectedBorderHue: hue(selectedStyle.borderTopColor),
      selectedWash: selectedStyle.backgroundColor,
      selectedWashHue: hue(selectedStyle.backgroundColor),
      selectedGlyph: getComputedStyle(selected, "::after").content,
      selectedGlyphShown:
        getComputedStyle(selected, "::after").display === "block",
      radioAccent: getComputedStyle(
        root.querySelector('.choice input[value="wording"]')!,
      ).accentColor,
      checkboxAccent: getComputedStyle(root.querySelector(".check input")!)
        .accentColor,
      primaryBackground: primaryStyle.backgroundColor,
      primaryHue: hue(primaryStyle.backgroundColor),
      primaryText: primaryStyle.color,
      barPrimaryBackground: getComputedStyle(barPrimary).backgroundColor,
      barPrimaryHue: hue(getComputedStyle(barPrimary).backgroundColor),
      errorText: getComputedStyle(root.querySelector(".field-error")!).color,
      redToken: getComputedStyle(
        root.querySelector(".panel form")!,
      ).getPropertyValue("--red"),
    };
  }, VIEW);

  // Red band: hues at or above ~330 or below ~30 degrees.
  const redHue = (h: number) => h >= 330 || h <= 30;
  // Selection is ink, never red — verified by computed hue, not by eye.
  expect(redHue(styles.selectedBorderHue)).toBe(false);
  expect(redHue(styles.selectedWashHue)).toBe(false);
  expect(styles.selectedBorder).toBe("rgb(32, 32, 31)");
  expect(styles.selectedWash).toBe("rgb(238, 242, 251)");
  // And it carries a visible non-red check glyph.
  expect(styles.selectedGlyph).toContain("✓");
  expect(styles.selectedGlyphShown).toBe(true);
  // The radio and checkbox accents follow the selection, not the error red.
  expect(styles.radioAccent).toBe("rgb(32, 32, 31)");
  expect(styles.checkboxAccent).toBe("rgb(32, 32, 31)");
  // Save is a non-red primary.
  expect(redHue(styles.primaryHue)).toBe(false);
  expect(styles.primaryBackground).toBe("rgb(19, 19, 18)");
  expect(styles.primaryText).toBe("rgb(255, 255, 255)");
  // Errors keep the red token, so red still means wrong.
  expect(styles.errorText).toBe("rgb(183, 6, 17)");
  expect(styles.redToken.trim()).toBe("#b70611");
  // The dark bar's own primary deliberately keeps --red-on-ink: it is a
  // toolbar, not an error surface.
  expect(redHue(styles.barPrimaryHue)).toBe(true);
  expect(styles.barPrimaryBackground).toBe("rgb(255, 83, 71)");
});

test("#128: focus-visible stays distinguishable from selection for keyboard users", async ({
  page,
}) => {
  await openForm(page);
  // Establish keyboard modality, then land on the first kind radio. WebKit
  // skips radios in the native Tab order, so focus the radio the way a
  // keyboard user arrives at it — but only after a key event, so
  // :focus-visible (not :focus) is what gets measured, in every engine.
  await page.keyboard.press("Tab");
  const focused = await page.evaluate((view) => {
    const root = document.querySelector(view)!.shadowRoot!;
    const active = root.querySelector(
      '.choice input[name="kind"][value="content"]',
    ) as HTMLInputElement;
    active.focus();
    const card = active.closest(".choice")!;
    const style = getComputedStyle(card);
    return {
      matchesFocusVisible: active.matches(":focus-visible"),
      outline: style.outlineColor,
      outlineWidth: style.outlineWidth,
      border: style.borderTopColor,
    };
  }, VIEW);
  expect(focused.matchesFocusVisible).toBe(true);
  // The keyboard ring is the focus blue, clearly apart from the ink selection
  // border and the red invalid border.
  expect(focused.outline).toBe("rgb(18, 100, 192)");
  expect(focused.outlineWidth).toBe("3px");
  expect(focused.border).not.toBe("rgb(18, 100, 192)");
});

test("#126: the current target pins to the top of the scrolling form", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openForm(page);
  const pinned = await page.evaluate((view) => {
    const root = document.querySelector(view)!.shadowRoot!;
    const current = root.querySelector(".current")!;
    const body = root.querySelector(".panel-body")!;
    const wording = root.querySelector('textarea[name="proposed"]')!;
    // The shell toggles these classes; the CSS is what is measured here.
    current.classList.add("is-pinned");
    body.classList.add("has-more");
    const style = getComputedStyle(current);
    // Scroll so the wording field is in view — the moment the acceptance
    // criterion is about.
    const bodyTop0 = body.getBoundingClientRect().top;
    const wordingOffset =
      wording.getBoundingClientRect().top - bodyTop0 + body.scrollTop;
    body.scrollTo({ top: Math.max(0, wordingOffset - 120), behavior: "instant" });
    const bodyRect = body.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    const wordingRect = wording.getBoundingClientRect();
    return {
      position: style.position,
      top: style.top,
      zIndex: style.zIndex,
      mask:
        getComputedStyle(body).maskImage ||
        getComputedStyle(body).webkitMaskImage,
      scrollTop: body.scrollTop,
      bodyTop: +bodyRect.top.toFixed(1),
      bodyBottom: +bodyRect.bottom.toFixed(1),
      currentTop: +currentRect.top.toFixed(1),
      currentBottom: +currentRect.bottom.toFixed(1),
      wordingTop: +wordingRect.top.toFixed(1),
      wordingBottom: +wordingRect.bottom.toFixed(1),
    };
  }, VIEW);

  expect(pinned.position).toBe("sticky");
  expect(pinned.top).toBe("-18px");
  expect(pinned.mask).toContain("linear-gradient");
  // The body genuinely scrolled and the wording field is in view.
  expect(pinned.scrollTop).toBeGreaterThan(300);
  expect(pinned.wordingTop).toBeGreaterThanOrEqual(pinned.bodyTop);
  expect(pinned.wordingBottom).toBeLessThanOrEqual(pinned.bodyBottom);
  // The quote is stuck at the top of the scroll box, fully visible, above the
  // wording field the reviewer is typing into. Unpinned it would have clipped
  // off the top of the scroll box here.
  expect(pinned.currentTop).toBeGreaterThanOrEqual(pinned.bodyTop - 2);
  expect(pinned.currentTop).toBeLessThan(pinned.bodyTop + 40);
  expect(pinned.currentBottom).toBeLessThanOrEqual(pinned.bodyBottom);
  expect(pinned.currentBottom).toBeLessThanOrEqual(pinned.wordingTop);

  // Control: with the pin removed the quote clips off the top of the scroll
  // box at the same scroll position, so the class is what keeps it visible.
  const unpinnedTop = await page.evaluate((view) => {
    const root = document.querySelector(view)!.shadowRoot!;
    const current = root.querySelector(".current")!;
    current.classList.remove("is-pinned");
    return +current.getBoundingClientRect().top.toFixed(1);
  }, VIEW);
  expect(unpinnedTop).toBeLessThan(pinned.bodyTop);
});

test("#126: pinned/scroll styling keeps the pinned phone geometry", async ({
  page,
}) => {
  // Mirrors tests/review-mode.spec.ts:285-305 at 390x844: this CSS must not
  // move the sheet or hide the chosen heading behind it.
  await page.setViewportSize({ width: 390, height: 844 });
  const form = await openForm(page);
  const geometry = await page.evaluate((view) => {
    const root = document.querySelector(view)!.shadowRoot!;
    root.querySelector(".current")!.classList.add("is-pinned");
    root.querySelector(".panel-body")!.classList.add("has-more");
    const sheet = root.querySelector(".panel[open]")!.getBoundingClientRect();
    const heading = document.querySelector("#hero-title")!.getBoundingClientRect();
    return {
      x: +sheet.x.toFixed(1),
      width: +sheet.width.toFixed(1),
      bottom: +(sheet.y + sheet.height).toFixed(1),
      sheetY: +sheet.y.toFixed(1),
      headingY: +heading.y.toFixed(1),
      scrollWidth: document.documentElement.scrollWidth,
    };
  }, VIEW);
  expect(geometry.x).toBe(0);
  expect(geometry.width).toBeGreaterThanOrEqual(370);
  expect(geometry.bottom).toBeLessThanOrEqual(844);
  expect(geometry.headingY).toBeLessThan(geometry.sheetY);
  expect(geometry.scrollWidth).toBeLessThanOrEqual(390);
  await expect(form).toBeVisible();
});

test("contract tokens are present with the agreed values", async ({ page }) => {
  await openForm(page);
  const tokens = await page.evaluate((view) => {
    const style = getComputedStyle(document.querySelector(view)!);
    return {
      sel: style.getPropertyValue("--sel").trim(),
      wash: style.getPropertyValue("--sel-wash").trim(),
      muted: style.getPropertyValue("--muted").trim(),
      red: style.getPropertyValue("--red").trim(),
      redOnInk: style.getPropertyValue("--red-on-ink").trim(),
    };
  }, VIEW);
  expect(tokens.sel).toMatch(/var\(--ink\)|#20201f/);
  expect(tokens.wash).toBe("#eef2fb");
  expect(tokens.muted).toBe("#55554f");
  // Red is untouched: errors and the bar's own primary still use it.
  expect(tokens.red).toBe("#b70611");
  expect(tokens.redOnInk).toBe("#ff5347");
});

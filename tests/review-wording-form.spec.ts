import { test, expect, type Page } from "@playwright/test";

/**
 * The wording form's own behaviour, apart from the send/list journeys:
 * #118 a prefilled replacement must be replaced, not appended to;
 * #121 the kind picker must be optional and show an example per kind;
 * #122 the first Save must give one piece of guidance, not an error wall;
 * #129 the form's chrome must read as plain context, not internal ids.
 */

const panel = (page: Page) => page.getByRole("dialog");
const saved = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("found42-review:feedback") ?? "null"),
  );

/** Starts picking and chooses `target`; returns the open feedback form. */
async function pick(page: Page, targetSelector: string) {
  await page.getByRole("button", { name: "Add feedback" }).click();
  const target = page.locator(targetSelector);
  await target.scrollIntoViewIfNeeded();
  await target.click();
  await expect(panel(page)).toBeVisible();
  return panel(page);
}

async function answer(
  form: ReturnType<typeof panel>,
  { name = "Adejoke", why = "Visitors should see who we help first." } = {},
) {
  const reviewer = form.getByLabel("Your name");
  if (await reviewer.count()) await reviewer.fill(name);
  await form.getByLabel("Why?", { exact: true }).fill(why);
  await form.getByRole("radio", { name: "Must change" }).check();
}

test("#118: the prefilled change-it-to field replaces, it does not append", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#hero-title");
  const proposed = form.getByLabel("Change it to");
  const current = await proposed.inputValue();
  expect(current.replace(/\s+/g, " ").trim()).toBe(
    "Train teams. Build useful skills. Automate the work.",
  );

  // Following the visible instructions: focus the field and paste. No manual
  // select-all, because the field presents its text as already selected.
  await proposed.click();
  await page.keyboard.insertText("Help your team do better work with Claude.");
  await expect(proposed).toHaveValue(
    "Help your team do better work with Claude.",
  );

  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);

  const { items } = await saved(page);
  expect(items[0].change.kind).toBe("wording");
  expect(items[0].change.proposed).toBe(
    "Help your team do better work with Claude.",
  );

  // Saving and reopening the draft preserves the exact replacement.
  await page.getByRole("button", { name: /My feedback/ }).click();
  await panel(page).getByRole("button", { name: "Edit" }).click();
  await expect(panel(page).getByLabel("Change it to")).toHaveValue(
    "Help your team do better work with Claude.",
  );
});

test("#118: an edit the reviewer already made is never wiped", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#hero-title");
  const proposed = form.getByLabel("Change it to");
  // The reviewer types their own words, then clicks back into the field.
  await proposed.fill("Our own wording.");
  await proposed.click();
  await expect(proposed).toHaveValue("Our own wording.");
  await proposed.press("End");
  await page.keyboard.type(" More.");
  await expect(proposed).toHaveValue("Our own wording. More.");
});

test("#121: the kind picker is optional and shows an example per kind", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#hero-title");

  // One-line examples, one per kind.
  await expect(form).toContainText("fix a typo or reword a heading");
  await expect(form).toContainText("add a missing link or a missing fact");
  await expect(form).toContainText("the wrong colour or a cramped layout");
  await expect(form).toContainText("move this section below that one");

  // "Not sure" is a real answer: the reviewer is not forced to classify.
  await expect(form.getByRole("radio", { name: /Not sure yet/ })).toBeVisible();

  // A text target still arrives with Wording suggested (shipped behaviour).
  await expect(form.getByRole("radio", { name: /Wording/ })).toBeChecked();

  // Saving without touching the kind picker works and records the words the
  // reviewer actually wrote — not a kind error.
  await form.getByLabel("Change it to").fill("This headline sounds pushy.");
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);
  const { items } = await saved(page);
  expect(items[0].change).toMatchObject({
    kind: "wording",
    proposed: "This headline sounds pushy.",
  });
});

test("#121: the taxonomy is genuinely optional, and the words decide the kind", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#hero-title");
  // The reviewer picks "Not sure yet" — no taxonomy work at all — and writes
  // only a comment in the wording field.
  await form.getByRole("radio", { name: /Not sure yet/ }).check();
  await form.getByLabel("Change it to").fill("This headline sounds pushy.");
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);
  // The kind is inferred honestly from the field they filled, not guessed.
  const { items } = await saved(page);
  expect(items[0].change).toMatchObject({
    kind: "wording",
    proposed: "This headline sounds pushy.",
  });
  expect(items[0].kindUncertain).toBe(true);
  await page.reload();
  await page.getByRole("button", { name: /My feedback/ }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(
    panel(page).getByRole("radio", { name: /Not sure yet/ }),
  ).toBeChecked();
  await panel(page).getByRole("button", { name: "Save feedback" }).click();
  expect((await saved(page)).items[0].kindUncertain).toBe(true);
});

test("#121: a plain comment saves without kind-specific fields", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#hero-title");
  await form.getByRole("radio", { name: /Not sure yet/ }).check();
  await answer(form, { why: "This headline sounds pushy." });
  await form.getByRole("button", { name: "Save feedback" }).click();
  const { items } = await saved(page);
  expect(items[0].change).toEqual({
    kind: "comment",
    detail: "This headline sounds pushy.",
  });
  expect(items[0].kindUncertain).toBe(true);
  await page.reload();
  await page.getByRole("button", { name: /My feedback/ }).click();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(panel(page).getByLabel("Your comment")).toHaveValue(
    "This headline sounds pushy.",
  );
  await expect(
    panel(page).getByRole("radio", { name: /Not sure yet/ }),
  ).toBeChecked();
});

test("#121: an explicit kind always wins over the suggestion", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#resources-title");
  await form.getByRole("radio", { name: /Layout/ }).check();
  await form.getByRole("radio", { name: "Move it", exact: true }).check();
  await form.locator('select[name="layoutPosition"]').selectOption("below");
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);
  expect((await saved(page)).items[0].change.kind).toBe("layout");
  expect((await saved(page)).items[0].kindUncertain).toBeUndefined();
});

test("#121: stored target values keep their shape (regression)", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#hero-title");
  await form.getByLabel("Change it to").fill("A different opening line.");
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);
  const { items } = await saved(page);
  expect(items[0].target).toMatchObject({
    page: "/",
    pageName: "Home",
    element: "Heading",
    selector: "#hero-title",
  });
  // #129: the displayed gloss must preserve the original stored section.
  expect(items[0].target.section).toBe("Page opening");
  expect(
    await page.evaluate(
      (selector) => document.querySelector(selector)?.id,
      items[0].target.selector,
    ),
  ).toBe("hero-title");
});

test("#122: the first Save gives one piece of guidance, not an error wall", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#hero-title");
  // Nothing is wrong until the reviewer asks to save or touches a field.
  await expect(form.locator(".field-error:not(:empty)")).toHaveCount(0);

  await form.getByRole("button", { name: "Save feedback" }).click();

  // Exactly one error, on the first-priority field, which takes focus.
  await expect(form.locator(".field-error:not(:empty)")).toHaveCount(1);
  await expect(form).toContainText("Add your name.");
  await expect(form).not.toContainText("Say why");
  await expect(form).not.toContainText("Choose how important it is.");
  await expect(form.getByLabel("Your name")).toBeFocused();

  // One summary announcement names the count and the first fix.
  const summary = form.getByRole("alert");
  await expect(summary).toContainText("fields still need attention");
  await expect(summary).toContainText("Add your name.");
  const describedBy = await form
    .getByLabel("Your name")
    .getAttribute("aria-describedby");
  expect(describedBy).toContain("e-reviewer");

  // Teeth: an incomplete draft is still refused, loudly.
  expect(await saved(page)).toBeNull();

  // Each Save advances exactly one step down the ladder — never a wall.
  await form.getByLabel("Your name").fill("Adejoke");
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(form).not.toContainText("Add your name.");
  await expect(form.locator(".field-error:not(:empty)")).toHaveCount(1);
  await expect(form).toContainText("This still matches the current text.");
  expect(await saved(page)).toBeNull();

  await form.getByLabel("Change it to").fill("A clearer opening line.");
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(form).toContainText("Say why");
  await expect(form.locator(".field-error:not(:empty)")).toHaveCount(1);

  // And a complete draft still saves.
  await form.getByLabel("Why?", { exact: true }).fill("It reads more warmly.");
  await form.getByRole("radio", { name: "Must change" }).check();
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);
  expect((await saved(page)).items).toHaveLength(1);
});

test("#122: an untouched field waits for its turn instead of scolding early", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#hero-title");
  const why = form.getByLabel("Why?", { exact: true });
  await why.fill("A reason.");
  await why.blur();
  await expect(form.locator("[data-form-errors]")).toHaveText("");
  // A field the reviewer filled is not scolded; nothing else piles on.
  await expect(form).not.toContainText("Say why");
  await expect(form.locator(".field-error:not(:empty)")).toHaveCount(0);
});

test("#129: the form chrome is plain context, not internal vocabulary", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, "#hero-title");

  const header = await form.locator(".panel-head").innerText();
  // No raw sitemap id, and the element type reads as context, not code.
  expect(header).not.toContain("Page opening");
  await expect(form.getByRole("heading", { level: 2 })).toHaveText(
    "You picked a heading “Train teams. Build useful skills. Automate the work.”",
  );
  await expect(form.locator("[data-target-where]")).toHaveText(
    "Home › Top of the page",
  );
  await expect(form).not.toContainText("FEEDBACK ON");

  // The name note states where it is kept and that it is once per browser.
  await expect(form).toContainText(
    "We save your name in this browser, so you only type it once.",
  );

  // "Change everywhere" states its scope with an example.
  await expect(form).toContainText(
    "Apply my fix to every place the same thing appears",
  );
  await expect(form).toContainText("for example, this heading on other pages");
});

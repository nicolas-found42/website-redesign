import { test, expect, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

/**
 * Review mode: the team points at the exact thing on a page and says precisely
 * what should change, then publishes feedback with a receipt. The backup file retains the page,
 * section, element and current text for every item. Visitors never load any of it.
 */

const production = "http://127.0.0.1:4179/website-redesign";
const panel = (page: Page) => page.getByRole("dialog");
const toast = (page: Page) =>
  page.locator("#found42-review").getByRole("status");
const saved = (page: Page) =>
  page.evaluate(() =>
    JSON.parse(localStorage.getItem("found42-review:feedback") ?? "null"),
  );

/** Starts picking and chooses `target`; returns the open feedback form. */
async function pick(page: Page, target: Locator) {
  await page.getByRole("button", { name: "Add feedback" }).click();
  await target.click();
  await expect(panel(page)).toBeVisible();
  return panel(page);
}

async function answer(
  form: Locator,
  { name = "Adejoke", why = "Visitors should see who we help first." } = {},
) {
  const reviewer = form.getByLabel("Your name");
  if (await reviewer.count()) await reviewer.fill(name);
  await form.getByLabel("Why?", { exact: true }).fill(why);
  await form.getByRole("radio", { name: "Must change" }).check();
}

test("visitors never load review mode; a review link does [production]", async ({
  page,
}) => {
  const requested: string[] = [];
  page.on("request", (request) => requested.push(request.url()));
  await page.goto(`${production}/`);
  // The mounted page confirms that main.ts has evaluated its review-link check.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#found42-review")).toHaveCount(0);
  expect(requested.filter((url) => /\/assets\/review-/.test(url))).toEqual([]);

  await page.goto(`${production}/?review`);
  await expect(page.getByRole("region", { name: "Review mode" })).toBeVisible();
  expect(requested.some((url) => /\/assets\/review-/.test(url))).toBe(true);
});

test("a review link stays on across pages until Exit", async ({ page }) => {
  await page.goto("/?review");
  const bar = page.getByRole("region", { name: "Review mode" });
  await expect(bar).toBeVisible();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Services", exact: true })
    .click();
  await expect(page).toHaveURL(/\/services\/$/);
  await expect(bar).toBeVisible();

  await bar.getByRole("button", { name: "Exit" }).click();
  await expect(bar).toHaveCount(0);
  await page.goto("/about/");
  await expect(page.locator("#found42-review")).toHaveCount(0);
});

test("rewording a heading records its exact words, new words and place", async ({
  page,
}) => {
  await page.goto("/?review");
  const heading = page.locator("#audiences-title");
  await heading.scrollIntoViewIfNeeded();
  const form = await pick(page, heading);

  await expect(form.getByRole("heading", { level: 2 })).toHaveText(
    "Heading “Find the work that sounds like yours”",
  );
  await expect(form.getByRole("radio", { name: /Wording/ })).toBeChecked();
  await expect(form.locator("[data-current]")).toHaveText(
    "Find the work that sounds like yours",
  );
  // The visible line break depends on font timing and browser layout in CI.
  const capturedText = await form.getByLabel("Change it to").inputValue();
  expect(capturedText.replace(/\s+/g, " ").trim()).toBe(
    "Find the work that sounds like yours",
  );
  const proposed = form.getByLabel("Change it to");
  await expect(
    form.getByText(
      "Select all the current text before pasting a replacement. The saved wording will be exactly what’s in this field.",
    ),
  ).toBeVisible();
  await proposed.press("Meta+A");
  await page.keyboard.insertText("Help your team do better work with Claude.");
  await expect(proposed).toHaveValue(
    "Help your team do better work with Claude.",
  );
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();

  await expect(panel(page)).toHaveCount(0);
  await expect(toast(page)).toContainText("Feedback saved");
  await expect(
    page.getByRole("button", { name: /^Feedback 1: Wording on Heading/ }),
  ).toBeVisible();
  const { reviewer, items } = await saved(page);
  expect(reviewer).toBe("Adejoke");
  expect(items).toHaveLength(1);
  expect(items[0]).toMatchObject({
    priority: "must",
    change: {
      kind: "wording",
      current: capturedText,
      proposed: "Help your team do better work with Claude.",
    },
    target: {
      page: "/",
      pageName: "Home",
      section: "Find the work that sounds like yours",
      element: "Heading",
    },
  });
  await page.getByRole("button", { name: /My feedback/ }).click();
  await panel(page).getByRole("button", { name: "Edit" }).click();
  const savedForm = panel(page);
  await expect(savedForm.getByLabel("Change it to")).toHaveValue(
    "Help your team do better work with Claude.",
  );
  expect(
    await page.evaluate(
      (selector) => document.querySelector(selector)?.id,
      items[0].target.selector,
    ),
  ).toBe("audiences-title");
});

test("vague or unchanged answers are refused with what is missing", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, page.locator("#hero-title"));
  await form.getByRole("button", { name: "Save feedback" }).click();

  await expect(form).toContainText("Add your name.");
  await expect(form).toContainText("This still matches the current text.");
  await expect(form).toContainText("Say why");
  await expect(form).toContainText("Choose how important it is.");
  await expect(form.getByLabel("Your name")).toBeFocused();
  await form.getByLabel("Your name").fill("Adejoke");
  await expect(form).not.toContainText("Add your name.");
  expect(await saved(page)).toBeNull();
});

test("while picking, a press chooses a link instead of following it", async ({
  page,
}) => {
  await page.goto("/?review");
  const services = page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Services", exact: true });
  const form = await pick(page, services);
  await expect(page).toHaveURL(/\/\?review$/);
  const title = form.getByRole("heading", { level: 2 });
  await expect(title).toHaveText("Link “Services”");

  await form.getByRole("button", { name: "Larger area" }).click();
  await expect(title).not.toHaveText("Link “Services”");
  await form.getByRole("button", { name: "Smaller area" }).click();
  await expect(title).toHaveText("Link “Services”");
  await expect(
    form.getByRole("button", { name: "Smaller area" }),
  ).toBeDisabled();
});

test("layout feedback names the section it should move next to", async ({
  page,
}) => {
  await page.goto("/?review");
  const heading = page.locator("#resources-title");
  await heading.scrollIntoViewIfNeeded();
  const form = await pick(page, heading);
  await form.getByRole("radio", { name: /Layout/ }).check();
  await form.getByRole("radio", { name: "Move it", exact: true }).check();
  await form.locator('select[name="layoutPosition"]').selectOption("below");
  await form
    .getByLabel("Section", { exact: true })
    .selectOption({ label: "Find the work that sounds like yours" });
  await answer(form, { why: "People should recognise themselves first." });
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);

  const { items } = await saved(page);
  expect(items[0].change).toMatchObject({
    kind: "layout",
    action: "move",
    position: "below",
    relativeTo: {
      name: "Find the work that sounds like yours",
      selector: "#audiences",
    },
  });
});

test("the sent file reads plainly and carries data the import script reads", async ({
  page,
  browserName,
}, testInfo) => {
  await page.goto("/?review");
  const form = await pick(page, page.locator("#hero-title"));
  await form.getByLabel("Change it to").fill("Claude training for your team.");
  await answer(form, { name: "Adejoke Test" });
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);

  await page.getByRole("button", { name: /My feedback/ }).click();
  await panel(page).getByRole("button", { name: "Download backup…" }).click();
  const send = panel(page);
  await expect(send.getByRole("heading", { level: 2 })).toHaveText(
    "Download a backup",
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    send.getByRole("button", { name: "Download file" }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(
    /^found42-feedback-adejoke-test-\d{4}-\d{2}-\d{2}\.md$/,
  );
  const file = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(file);
  const text = readFileSync(file, "utf8");
  expect(text).toContain("# Website feedback from Adejoke Test");
  expect(text).toContain(
    "**Where:** Home › Page opening › Heading “Train teams. Build useful skills. Automate the work.”",
  );
  expect(text).toContain("**Change it to**\n> Claude training for your team.");
  expect(text).toContain("`#hero-title`");

  // One engine is enough to prove the script reads what every engine writes.
  if (browserName !== "chromium") return;
  const dryRun = execFileSync(
    "node",
    ["scripts/feedback-to-issues.mjs", file],
    { encoding: "utf8" },
  );
  expect(dryRun).toContain(
    "━━ Wording: Home › Heading “Train teams. Build useful skills. Automate the work.”",
  );
  expect(dryRun).toContain("Reported by **Adejoke Test**");
  expect(dryRun).toContain("1 issue would be opened");
});

test("saved feedback can be found, edited and deleted", async ({ page }) => {
  await page.goto("/?review");
  const form = await pick(page, page.locator("#hero-title"));
  await form.getByLabel("Change it to").fill("First version.");
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(panel(page)).toHaveCount(0);

  await page.getByRole("button", { name: /My feedback/ }).click();
  const list = panel(page);
  await expect(list).toContainText("Wording · Must change");
  await list.getByRole("button", { name: "Edit" }).click();
  const edit = panel(page);
  await expect(edit.getByLabel("Change it to")).toHaveValue("First version.");
  await edit.getByLabel("Change it to").fill("Second version.");
  await edit.getByRole("button", { name: "Save feedback" }).click();
  await expect(toast(page)).toContainText("Feedback updated.");
  expect((await saved(page)).items[0].change.proposed).toBe("Second version.");

  await page.getByRole("button", { name: /My feedback/ }).click();
  const remove = panel(page).getByRole("button", { name: "Delete" });
  await remove.click();
  await expect(remove).toHaveText("Delete it?");
  await remove.click();
  await expect(panel(page)).toContainText("Nothing yet.");
  expect((await saved(page)).items).toEqual([]);
});

test("on a phone the bar and form fit the screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?review");
  const bar = page.getByRole("region", { name: "Review mode" });
  const box = (await bar.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(16);
  expect(box.x + box.width).toBeLessThanOrEqual(390 - 16);

  const form = await pick(page, page.locator("#hero-title"));
  const sheet = (await form.boundingBox())!;
  // The sheet spans the screen, less any scrollbar an engine reserves.
  expect(sheet.x).toBe(0);
  expect(sheet.width).toBeGreaterThanOrEqual(370);
  expect(sheet.y + sheet.height).toBeLessThanOrEqual(844);
  // The chosen heading stays visible above the sheet.
  const heading = (await page.locator("#hero-title").boundingBox())!;
  expect(heading.y).toBeLessThan(sheet.y);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test("review mode meets the site's accessibility bar", async ({ page }) => {
  await page.goto("/?review");
  await expect(page.getByRole("region", { name: "Review mode" })).toBeVisible();
  const audit = () =>
    new AxeBuilder({ page })
      .include("#found42-review")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
  expect((await audit()).violations).toEqual([]);
  await pick(page, page.locator("#hero-title"));
  expect((await audit()).violations).toEqual([]);
});

test("Send publishes a saved draft in one click and shows its public receipt", async ({
  page,
}) => {
  let deliveries = 0;
  await page.route("https://review-submission.test/submit", async (route) => {
    deliveries++;
    const request = route.request().postDataJSON();
    const { fingerprint } = await import("../src/review/submission-contract");
    await route.fulfill({
      json: {
        outcomes: await Promise.all(
          request.items.map(
            async (item: import("../src/review/store").FeedbackItem) => ({
              id: item.id,
              fingerprint: await fingerprint(request.site, item),
              status: "confirmed",
              issue: {
                number: 1234,
                url: "https://github.com/nicolas-found42/website-redesign/issues/1234",
              },
              message: "Published on GitHub.",
            }),
          ),
        ),
      },
    });
  });
  await page.goto("/?review");
  const send = page
    .getByRole("region", { name: "Review mode" })
    .getByRole("button", { name: /Send/ });
  await expect(send).toBeDisabled();
  const form = await pick(page, page.locator("#hero-title"));
  await form.getByLabel("Change it to").fill("Training for your team.");
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();
  await expect(send).toHaveText("Send 1 feedback item");
  await expect(page.getByRole("region", { name: "Review mode" })).toContainText(
    "Your feedback, name and any screenshots will be posted publicly on GitHub.",
  );
  await send.click();
  await expect(
    panel(page).getByRole("link", { name: /Issue #1234/ }),
  ).toHaveAttribute(
    "href",
    "https://github.com/nicolas-found42/website-redesign/issues/1234",
  );
  expect((await saved(page)).items).toEqual([]);
  expect(deliveries).toBe(1);
});

async function saveWording(page: Page, proposed: string) {
  const form = await pick(page, page.getByRole("heading", { level: 1 }));
  await form.getByLabel("Change it to").fill(proposed);
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();
}
const sendButton = (page: Page) =>
  page
    .getByRole("region", { name: "Review mode" })
    .getByRole("button", { name: /Send/ });
async function confirmedResponse(request: {
  site: string;
  items: import("../src/review/store").FeedbackItem[];
}) {
  const { fingerprint } = await import("../src/review/submission-contract");
  return {
    outcomes: await Promise.all(
      request.items.map(async (item, i) => ({
        id: item.id,
        fingerprint: await fingerprint(request.site, item),
        status: "confirmed",
        message: "Published on GitHub.",
        issue: {
          number: 2000 + i,
          url: `https://github.com/nicolas-found42/website-redesign/issues/${2000 + i}`,
        },
      })),
    ),
  };
}

test("a content conflict offers an explicit new draft independently of message wording", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("https://review-submission.test/submit", async (route) => {
    const result = await confirmedResponse(route.request().postDataJSON());
    attempts++;
    await route.fulfill({
      json:
        attempts === 1
          ? {
              outcomes: result.outcomes.map((outcome) => ({
                id: outcome.id,
                fingerprint: outcome.fingerprint,
                status: "invalid",
                reason: "content-conflict",
                message: "The original version already has its own issue.",
              })),
            }
          : result,
    });
  });
  await page.goto("/?review");
  await saveWording(page, "Publish this revision as separate feedback.");
  const original = (await saved(page)).items[0];
  await sendButton(page).click();
  await panel(page)
    .getByRole("button", { name: "Save as new feedback" })
    .click();
  await expect(
    panel(page).getByRole("button", { name: "Save as new feedback" }),
  ).toHaveCount(0);
  const revised = (await saved(page)).items[0];
  expect((await saved(page)).published).toContain(original.id);
  expect(revised.id).not.toBe(original.id);
  expect({ ...revised, id: original.id }).toEqual(original);
  await panel(page)
    .getByRole("button", { name: "Send 1 feedback item" })
    .click();
  await expect(panel(page).getByRole("status")).toContainText(
    "1 item published. 0 drafts remain",
  );
});

test("a mixed receipt retains the failed draft across pages and reloads", async ({
  page,
}) => {
  await page.route("https://review-submission.test/submit", async (route) => {
    const result = await confirmedResponse(route.request().postDataJSON());
    result.outcomes[1] = {
      ...result.outcomes[1],
      status: "retryable",
      message: "GitHub is temporarily limited. Your draft is saved.",
    };
    await route.fulfill({ json: result });
  });
  await page.goto("/?review");
  await saveWording(page, "A clearer opening.");
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Services", exact: true })
    .click();
  await saveWording(page, "A clearer Services heading.");
  await sendButton(page).click();
  await expect(panel(page)).toContainText("1 item published. 1 draft remains");
  await expect(
    panel(page).getByRole("link", { name: "Issue #2000 on GitHub" }),
  ).toBeVisible();
  expect((await saved(page)).items[0].target.page).toBe("/services/");
  await page.reload();
  await expect(sendButton(page)).toHaveText("Send 1 feedback item");
  await page.getByRole("button", { name: "Last receipt" }).click();
  await expect(panel(page)).toContainText("temporarily limited");
  await expect(
    panel(page).getByRole("link", { name: "Issue #2000 on GitHub" }),
  ).toBeVisible();
});

test("sending prevents repeated presses and retains a revision made in another tab", async ({
  page,
  context,
}) => {
  let release!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  let deliveries = 0;
  await page.route("https://review-submission.test/submit", async (route) => {
    deliveries++;
    await wait;
    await route.fulfill({
      json: await confirmedResponse(route.request().postDataJSON()),
    });
  });
  await page.goto("/?review");
  await saveWording(page, "Submitted version.");
  const id = (await saved(page)).items[0].id;
  await sendButton(page).click();
  await expect(
    panel(page).getByRole("button", { name: "Sending…" }),
  ).toBeDisabled();
  await expect(panel(page).getByRole("status")).toContainText("0 of 1");
  await panel(page)
    .getByRole("button", { name: "Sending…" })
    .dispatchEvent("click");
  const other = await context.newPage();
  await other.goto("/?review");
  await other.getByRole("button", { name: /My feedback/ }).click();
  await panel(other).getByRole("button", { name: "Edit" }).click();
  await panel(other).getByLabel("Change it to").fill("Revised during sending.");
  await panel(other).getByRole("button", { name: "Save feedback" }).click();
  release();
  await expect(
    panel(page).getByRole("link", { name: "Issue #2000 on GitHub" }),
  ).toBeVisible();
  const remaining = (await saved(page)).items;
  expect(remaining).toHaveLength(1);
  expect(remaining[0].change.proposed).toBe("Revised during sending.");
  expect(remaining[0].id).not.toBe(id);
  expect(deliveries).toBe(1);
});

for (const failure of [
  "offline",
  "lost-response",
  "quota",
  "validation",
  "github",
  "malformed-receipt",
  "wrong-version",
  "wrong-repository",
]) {
  test(`${failure} preserves the unconfirmed draft and an accessible receipt`, async ({
    page,
    context,
  }) => {
    await page.route("https://review-submission.test/submit", async (route) => {
      if (failure === "lost-response") return route.abort("timedout");
      if (["quota", "validation", "github"].includes(failure))
        return route.fulfill({
          status: { quota: 429, validation: 400, github: 503 }[
            failure as "quota" | "validation" | "github"
          ],
          json: { message: "Failure" },
        });
      const result = await confirmedResponse(route.request().postDataJSON());
      if (failure === "wrong-version")
        result.outcomes[0].fingerprint = "wrong-version";
      if (failure === "wrong-repository")
        result.outcomes[0].issue.url =
          "https://github.com/other/repository/issues/2000";
      await route.fulfill({
        json: failure === "malformed-receipt" ? {} : result,
      });
    });
    await page.goto("/?review");
    await saveWording(page, "Keep this draft.");
    if (failure === "offline") await context.setOffline(true);
    await sendButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(panel(page).getByRole("status")).toContainText(
      "1 draft remains",
    );
    await expect(panel(page)).toContainText("draft is saved");
    const expectedMessage =
      failure === "offline"
        ? "You’re offline"
        : failure === "quota"
          ? "temporarily limited"
          : failure === "validation"
            ? "could not be accepted"
            : failure === "github"
              ? "temporarily unavailable"
              : "could not confirm delivery";
    await expect(panel(page)).toContainText(expectedMessage);
    await expect(
      panel(page).getByRole("link", { name: /Issue #/ }),
    ).toHaveCount(0);
    expect((await saved(page)).items).toHaveLength(1);
    expect(
      (
        await new AxeBuilder({ page })
          .include("#found42-review")
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await context.setOffline(false);
    await page.reload();
    await expect(sendButton(page)).toHaveText("Send 1 feedback item");
  });
}

test("a lost browser receipt can be recovered by sending the same saved ID", async ({
  page,
}) => {
  let first = true;
  let submittedId = "";
  await page.route("https://review-submission.test/submit", async (route) => {
    const request = route.request().postDataJSON();
    if (first) {
      first = false;
      submittedId = request.items[0].id;
      return route.abort("timedout");
    }
    expect(request.items[0].id).toBe(submittedId);
    await route.fulfill({ json: await confirmedResponse(request) });
  });
  await page.goto("/?review");
  await saveWording(page, "Recover this issue.");
  await sendButton(page).click();
  await expect(panel(page).getByRole("status")).toContainText(
    "1 draft remains",
  );
  await panel(page)
    .getByRole("button", { name: "Send 1 feedback item" })
    .click();
  await expect(panel(page).getByRole("status")).toContainText(
    "1 item published. 0 drafts remain",
  );
});

test("larger draft lists are sent in bounded chunks without losing items", async ({
  page,
}) => {
  const batchSizes: number[] = [];
  await page.route("https://review-submission.test/submit", async (route) => {
    const request = route.request().postDataJSON();
    batchSizes.push(request.items.length);
    await route.fulfill({ json: await confirmedResponse(request) });
  });
  await page.goto("/?review");
  for (let i = 0; i < 5; i++)
    await saveWording(page, `Feedback version ${i + 1}.`);
  await sendButton(page).click();
  await expect(panel(page).getByRole("status")).toContainText(
    "5 items published. 0 drafts remain",
  );
  expect(batchSizes).toEqual([3, 2]);
  expect((await saved(page)).items).toEqual([]);
});

test("concurrent tab sends preserve the confirmed receipt after reload", async ({
  page,
  context,
}) => {
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "locks", { value: undefined });
  });
  let release!: () => void;
  let arrived!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  let requests = 0;
  await context.route(
    "https://review-submission.test/submit",
    async (route) => {
      requests++;
      arrived();
      await wait;
      await route.fulfill({
        json: await confirmedResponse(route.request().postDataJSON()),
      });
    },
  );
  await page.goto("/?review");
  await saveWording(page, "Publish one copy across tabs.");
  const other = await context.newPage();
  await other.goto("/?review");
  await sendButton(page).click();
  await started;
  await sendButton(other).click();
  release();
  await expect(
    panel(page).getByRole("link", { name: "Issue #2000 on GitHub" }),
  ).toBeVisible();
  await expect(panel(other).getByRole("status")).toContainText(
    "0 drafts remain",
  );
  expect(requests).toBe(1);
  expect((await saved(page)).receipts[0].status).toBe("confirmed");
  await other.reload();
  await other.getByRole("button", { name: "Last receipt" }).click();
  await expect(
    panel(other).getByRole("link", { name: "Issue #2000 on GitHub" }),
  ).toBeVisible();
});

test("a timestamp-only re-save during delivery leaves no duplicate draft", async ({
  page,
  context,
}) => {
  let release!: () => void;
  let arrived!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  await page.route("https://review-submission.test/submit", async (route) => {
    arrived();
    await wait;
    await route.fulfill({
      json: await confirmedResponse(route.request().postDataJSON()),
    });
  });
  await page.goto("/?review");
  await saveWording(page, "Unchanged feedback.");
  const other = await context.newPage();
  await other.goto("/?review");
  await other.getByRole("button", { name: /My feedback/ }).click();
  await panel(other).getByRole("button", { name: "Edit" }).click();
  await sendButton(page).click();
  await started;
  await panel(other).getByRole("button", { name: "Save feedback" }).click();
  release();
  await expect(panel(page).getByRole("status")).toContainText(
    "0 drafts remain",
  );
  expect((await saved(page)).items).toEqual([]);
});

test("a backup opened during delivery survives progress and completion", async ({
  page,
}) => {
  let release!: () => void;
  let arrived!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    arrived = resolve;
  });
  await page.route("https://review-submission.test/submit", async (route) => {
    arrived();
    await wait;
    await route.fulfill({
      json: await confirmedResponse(route.request().postDataJSON()),
    });
  });
  await page.goto("/?review");
  await saveWording(page, "Keep my backup open.");
  await sendButton(page).click();
  await started;
  await panel(page)
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /My feedback/ }).click();
  await panel(page).getByRole("button", { name: "Download backup…" }).click();
  const backup = panel(page).getByLabel("Backup contents");
  await expect(backup).toContainText("Keep my backup open.");
  release();
  await expect.poll(async () => (await saved(page)).items.length).toBe(0);
  await expect(
    panel(page).getByRole("heading", { name: "Download a backup" }),
  ).toBeVisible();
  await expect(backup).toContainText("Keep my backup open.");
});

for (const status of ["retryable", "pending"]) {
  test(`${status} item outcomes stop subsequent chunks and retain all drafts`, async ({
    page,
  }) => {
    let requests = 0;
    await page.route("https://review-submission.test/submit", async (route) => {
      requests++;
      const result = await confirmedResponse(route.request().postDataJSON());
      await route.fulfill({
        json: {
          outcomes: result.outcomes.map((outcome) => ({
            ...outcome,
            issue: undefined,
            status,
            message: "Please retry later.",
          })),
        },
      });
    });
    await page.goto("/?review");
    for (let i = 0; i < 4; i++)
      await saveWording(page, `Queued feedback ${i}.`);
    await sendButton(page).click();
    await expect(panel(page).getByRole("status")).toContainText(
      "4 drafts remain",
    );
    expect(requests).toBe(1);
    expect((await saved(page)).receipts).toHaveLength(4);
    expect((await saved(page)).items).toHaveLength(4);
  });
}

test("unrelated cross-tab storage writes preserve the open feedback list", async ({
  page,
  context,
}) => {
  await page.goto("/?review");
  await saveWording(page, "Keep list state.");
  await page.getByRole("button", { name: /My feedback/ }).click();
  await panel(page).evaluate((element) => {
    element.querySelector(".panel-body")!.setAttribute("data-preserved", "yes");
  });
  const other = await context.newPage();
  await other.goto("/?review");
  // An acknowledgement ensures the event has been delivered without a timing sleep.
  await page.evaluate(() => {
    addEventListener("storage", (event) => {
      if (event.key === "unrelated-test")
        document.body.dataset.storageSeen = "yes";
    });
  });
  await other.evaluate(() =>
    localStorage.setItem("unrelated-test", "new value"),
  );
  await expect(page.locator("body")).toHaveAttribute(
    "data-storage-seen",
    "yes",
  );
  await expect(panel(page).locator(".panel-body")).toHaveAttribute(
    "data-preserved",
    "yes",
  );
});

test("mobile page space follows the review bar including warning and receipt states", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  await page.goto("/?review");
  const bar = page.getByRole("region", { name: "Review mode" });
  await expect(bar).toContainText("isn’t keeping feedback");
  await expect
    .poll(async () => {
      const bounds = (await bar.boundingBox())!;
      const reservation = await page.evaluate(() =>
        parseFloat(getComputedStyle(document.body).paddingBottom),
      );
      return reservation >= bounds.height + 24;
    })
    .toBe(true);
  await saveWording(page, "Phone feedback.");
  await page.route("https://review-submission.test/submit", async (route) => {
    await route.fulfill({
      json: await confirmedResponse(route.request().postDataJSON()),
    });
  });
  await sendButton(page).click();
  await expect(panel(page).getByRole("status")).toContainText(
    "0 drafts remain",
  );
  await panel(page)
    .getByRole("button", { name: "Close", exact: true })
    .first()
    .click();
  await expect
    .poll(async () => {
      const bounds = (await bar.boundingBox())!;
      return (
        (await page.evaluate(() =>
          parseFloat(getComputedStyle(document.body).paddingBottom),
        )) >=
        bounds.height + 24
      );
    })
    .toBe(true);
});

test("invalid overlong IDs retain the service validation message using input index", async ({
  page,
}) => {
  await page.goto("/?review");
  await saveWording(page, "Fix this invalid record.");
  await page.evaluate(() => {
    const key = "found42-review:feedback";
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.items[0].id = "x".repeat(81);
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.route("https://review-submission.test/submit", async (route) => {
    await route.fulfill({
      json: {
        outcomes: [
          {
            id: "x".repeat(80),
            inputIndex: 0,
            fingerprint: "",
            status: "invalid",
            message: "The record ID is invalid. Your draft is saved.",
          },
        ],
      },
    });
  });
  await sendButton(page).click();
  await expect(panel(page)).toContainText("The record ID is invalid");
  expect((await saved(page)).items).toHaveLength(1);
});

test("a reviewer previews, replaces and removes a genuine screenshot on desktop and phone", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1280, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/?review");
    const heading = page.locator("#audiences-title");
    await heading.scrollIntoViewIfNeeded();
    const png = await page.screenshot({ type: "png" });
    const form = await pick(page, heading);
    await form.getByLabel("Attach screenshot file").setInputFiles({
      name: "review.png",
      mimeType: "image/png",
      buffer: png,
    });
    await expect(
      form.getByRole("img", { name: /Screenshot of Heading/ }),
    ).toBeVisible();
    await expect(form).toContainText("Screenshots will be public");
    await form.getByLabel("Attach screenshot file").setInputFiles({
      name: "replacement.png",
      mimeType: "image/png",
      buffer: png,
    });
    await expect(
      form.getByRole("button", { name: "Remove screenshot" }),
    ).toBeEnabled();
    await form.getByRole("button", { name: "Remove screenshot" }).focus();
    await page.keyboard.press("Enter");
    await expect(
      form.getByRole("img", { name: /Screenshot of Heading/ }),
    ).toHaveCount(0);
    await form.getByLabel("Change it to").fill("Clear audience wording.");
    await answer(form);
    await form.getByRole("button", { name: "Save feedback" }).click();
    expect((await saved(page)).items.at(-1).screenshot).toBeUndefined();
  }
});

async function saveScreenshotFeedback(page: Page) {
  await page.goto("/?review");
  const heading = page.locator("#audiences-title");
  await heading.scrollIntoViewIfNeeded();
  const png = await page.screenshot({ type: "png" });
  const form = await pick(page, heading);
  await form
    .getByLabel("Attach screenshot file")
    .setInputFiles({ name: "review.png", mimeType: "image/png", buffer: png });
  await expect(
    form.getByRole("img", { name: /Screenshot of Heading/ }),
  ).toBeVisible();
  await form.getByLabel("Change it to").fill("Screenshot feedback wording.");
  await answer(form);
  await form.getByRole("button", { name: "Save feedback" }).click();
}

test("confirmed screenshot uploads survive reload and issue delivery retries", async ({
  page,
}) => {
  let uploads = 0,
    sends = 0;
  await page.route(
    "https://review-submission.test/screenshots/*",
    async (route) => {
      uploads++;
      const image = (await saved(page)).items[0].screenshot;
      await route.fulfill({
        json: {
          sha256: image.sha256,
          width: image.width,
          height: image.height,
        },
      });
    },
  );
  await page.route("https://review-submission.test/submit", async (route) => {
    sends++;
    expect(
      route.request().postDataJSON().items[0].screenshot.dataUrl,
    ).toBeUndefined();
    if (sends === 1) return route.fulfill({ status: 503, json: {} });
    await route.fulfill({
      json: await confirmedResponse(route.request().postDataJSON()),
    });
  });
  await saveScreenshotFeedback(page);
  await sendButton(page).click();
  await expect(panel(page).getByRole("status")).toContainText(
    "1 draft remains",
  );
  await page.reload();
  await sendButton(page).click();
  await expect(panel(page).getByRole("status")).toContainText(
    "0 drafts remain",
  );
  expect(uploads).toBe(1);
  expect(sends).toBe(2);
});

for (const failure of [
  "invalid",
  "oversized",
  "interrupted",
  "rate",
  "quota",
] as const) {
  test(`${failure} screenshot delivery preserves the draft and allows an explicit text-only send`, async ({
    page,
  }) => {
    let sends = 0;
    await page.route("https://review-submission.test/screenshots/*", (route) =>
      failure === "interrupted"
        ? route.abort("timedout")
        : route.fulfill({
            status: { invalid: 422, oversized: 413, rate: 429, quota: 507 }[
              failure
            ],
            json: {},
          }),
    );
    await page.route("https://review-submission.test/submit", async (route) => {
      sends++;
      expect(
        route.request().postDataJSON().items[0].screenshot,
      ).toBeUndefined();
      await route.fulfill({
        json: await confirmedResponse(route.request().postDataJSON()),
      });
    });
    await saveScreenshotFeedback(page);
    await sendButton(page).click();
    await expect(panel(page).getByRole("status")).toContainText(
      "1 draft remains",
    );
    expect(sends).toBe(0);
    expect((await saved(page)).items[0].screenshot.dataUrl).toContain(
      "data:image/png;base64,",
    );
    await panel(page)
      .getByRole("button", { name: "Send text without screenshot" })
      .focus();
    await page.keyboard.press("Enter");
    await expect(panel(page).getByRole("status")).toContainText(
      "0 drafts remain",
    );
    expect(sends).toBe(1);
  });
}

test("an unreadable screenshot leaves written feedback submittable", async ({
  page,
}) => {
  await page.goto("/?review");
  const form = await pick(page, page.locator("#audiences-title"));
  await form.getByLabel("Change it to").fill("Preserved written feedback.");
  await answer(form);
  await form.getByLabel("Attach screenshot file").setInputFiles({
    name: "bad.png",
    mimeType: "image/png",
    buffer: Buffer.from("not an image"),
  });
  await expect(form.getByRole("status")).toContainText("could not be read");
  await form.getByRole("button", { name: "Save feedback" }).click();
  expect((await saved(page)).items[0].change.proposed).toBe(
    "Preserved written feedback.",
  );
  expect((await saved(page)).items[0].screenshot).toBeUndefined();
});

test("missing server images invalidate confirmed uploads and upload again after reload", async ({
  page,
}) => {
  let uploads = 0,
    sends = 0;
  await page.route(
    "https://review-submission.test/screenshots/*",
    async (route) => {
      uploads++;
      const image = (await saved(page)).items[0].screenshot;
      await route.fulfill({
        json: {
          sha256: image.sha256,
          width: image.width,
          height: image.height,
        },
      });
    },
  );
  await page.route("https://review-submission.test/submit", async (route) => {
    sends++;
    expect(
      route.request().postDataJSON().items[0].screenshot.dataUrl,
    ).toBeUndefined();
    if (sends === 1) {
      const response = await confirmedResponse(route.request().postDataJSON());
      await route.fulfill({
        json: {
          outcomes: response.outcomes.map((outcome) => ({
            ...outcome,
            status: "retryable",
            reason: "screenshot",
            issue: undefined,
            message: "Screenshot missing; retry.",
          })),
        },
      });
      return;
    }
    await route.fulfill({
      json: await confirmedResponse(route.request().postDataJSON()),
    });
  });
  await saveScreenshotFeedback(page);
  await sendButton(page).click();
  await expect(panel(page).getByRole("status")).toContainText(
    "1 draft remains",
  );
  await page.reload();
  await sendButton(page).click();
  await expect(panel(page).getByRole("status")).toContainText(
    "0 drafts remain",
  );
  expect(uploads).toBe(2);
  expect(sends).toBe(2);
});

test("image storage exhaustion saves written feedback and permits persistent later edits", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (
        key === "found42-review:feedback" &&
        JSON.parse(value).items.some(
          (item: { screenshot?: unknown }) => item.screenshot,
        )
      )
        throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await saveScreenshotFeedback(page);
  await expect(
    page.getByRole("status").filter({ hasText: "Browser storage is full" }),
  ).toBeVisible();
  expect((await saved(page)).items[0].screenshot).toBeUndefined();
  await page.reload();
  await page.getByRole("button", { name: "My feedback" }).click();
  await panel(page).getByRole("button", { name: "Edit" }).click();
  const form = page
    .getByRole("dialog")
    .filter({ has: page.getByLabel("Change it to") });
  await form.getByLabel("Change it to").fill("Persistent revised wording.");
  await form.getByRole("button", { name: "Save feedback" }).click();
  await page.reload();
  expect((await saved(page)).items[0].change.proposed).toBe(
    "Persistent revised wording.",
  );
});

test("PNG upload bytes match the single encoded digest", async ({ page }) => {
  await page.route(
    "https://review-submission.test/screenshots/*",
    async (route) => {
      const image = (await saved(page)).items[0].screenshot;
      const { createHash } = await import("node:crypto");
      expect(
        createHash("sha256")
          .update(route.request().postDataBuffer()!)
          .digest("hex"),
      ).toBe(image.sha256);
      await route.fulfill({
        json: {
          sha256: image.sha256,
          width: image.width,
          height: image.height,
        },
      });
    },
  );
  await page.route("https://review-submission.test/submit", async (route) =>
    route.fulfill({
      json: await confirmedResponse(route.request().postDataJSON()),
    }),
  );
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.toDataURL = () => {
      throw new Error("Second PNG encode forbidden");
    };
  });
  await saveScreenshotFeedback(page);
  await sendButton(page).click();
  await expect(panel(page).getByRole("status")).toContainText(
    "0 drafts remain",
  );
});

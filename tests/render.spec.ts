import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { renderHomepage } from "../src/homepage";
import { renderPage } from "../src/pages";
import { resources, serviceCatalog, services } from "../src/content";
import {
  homepageTestimonials,
  robbHenshawAttribution,
} from "../src/homepage/testimonials";
import {
  readinessResult,
  scorecardQuestions,
  scorecardResult,
} from "../src/interactions";
const page = renderHomepage();
test("#168: services lead directly to testimonials without the redundant briefing band", () => {
  expect(page).not.toContain('id="briefing"');
  expect(page).not.toContain("From a busy week to a ready briefing");
  const sections = [...page.matchAll(/<section id="([^"]+)"/g)].map(
    (match) => match[1],
  );
  const servicesIndex = sections.indexOf("services");
  expect(servicesIndex).toBeGreaterThanOrEqual(0);
  expect(sections.slice(servicesIndex, servicesIndex + 2)).toEqual([
    "services",
    "testimonials",
  ]);
});
test("#148: the notice opens the eight content pages and not the 404 route", () => {
  const notice = '<p class="preview-note wrap">';
  for (const route of ["", "resources", "services", "about", "blog"])
    expect(renderPage(route).includes(notice), route).toBe(true);
  const missing = renderPage("404");
  expect(missing.includes(notice)).toBe(false);
  expect(missing).toContain(
    "This destination is not part of the Found42 preview.",
  );
});
test("the complete resource page owns the current catalog and availability [browser]", async ({
  page,
}) => {
  await page.goto("/resources/");
  const sections = page.locator(".resource-detail, #scorecard");
  await expect(sections).toHaveCount(5);
  await expect(
    page.getByRole("heading", { name: "Start with the work." }),
  ).toBeVisible();
  await expect(page.locator(".page-opening")).toContainText(
    "Five free resources to explore",
  );
  for (const item of resources) {
    const section = page.locator(`#${item.id}`);
    if (item.id === "scorecard") {
      await expect(section).toContainText(
        "No email required. Name and role are optional.",
      );
    } else {
      await expect(section).toContainText(item.title);
      await expect(section).toContainText(item.description);
      await expect(section).toContainText(item.gate);
    }
  }
  await expect(page.locator("#scorecard")).toContainText("Question 1 of 18");
});
test("source offerings and attributed workshop proof are preserved", () => {
  for (const item of services) {
    expect(page).toContain(item.title);
    expect(page).toContain(item.description);
    for (const detail of item.details) expect(page).toContain(detail);
  }
  for (const item of homepageTestimonials) {
    expect(page).toContain(item.quote);
    expect(page).toContain(item.name);
    expect(page).toContain(item.role);
  }
  expect(page).not.toMatch(/8 hours saved weekly|eight hours is a target/i);
  expect(page).not.toContain("measurable results");
});
test("Robb Henshaw's attribution is one identical string across both surfaces [#147]", () => {
  const ROBB_HENSHAW_ATTRIBUTION = robbHenshawAttribution;
  const homepageRole = homepageTestimonials.find(
    (item) => item.name === "Robb Henshaw",
  )?.role;
  const servicesRole = serviceCatalog.quotes.find(
    (item) => item.name === "Robb Henshaw",
  )?.role;
  expect(homepageRole).toBe(ROBB_HENSHAW_ATTRIBUTION);
  expect(servicesRole).toBe(ROBB_HENSHAW_ATTRIBUTION);
  expect(homepageRole).toBe(servicesRole);
  expect(readable(page)).toContain(ROBB_HENSHAW_ATTRIBUTION);
  expect(readable(renderPage("services"))).toContain(ROBB_HENSHAW_ATTRIBUTION);
});
test("all 81 assessment combinations preserve public source thresholds", () => {
  for (let a = 1; a <= 3; a++)
    for (let b = 1; b <= 3; b++)
      for (let c = 1; c <= 3; c++)
        for (let d = 1; d <= 3; d++) {
          const sum = a + b + c + d;
          expect(readinessResult([a, b, c, d]).title).toBe(
            sum >= 9
              ? "Strong first workflow"
              : sum >= 6
                ? "Promising, with guardrails"
                : "Clarify before building",
          );
        }
});

/* ── Stand-up follow-up: the scorecard, the converged copy, the review figure ── */

const readable = (markup: string) =>
  markup
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");

test("the supplied Sam answers produce the approved Foundations report", () => {
  const result = scorecardResult([
    1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0,
  ]);
  expect(result.total).toBe(5);
  expect(result.pct).toBe(10);
  expect(result.stage.name).toBe("Foundations");
  expect(result.areas.map((area) => area.pct)).toEqual([22, 0, 22, 8, 0]);
});

test("the supplied middle and high samples retain exact scores, area percentages and routes", () => {
  const middle = [0, 2, 2, 1, 1, 1, 1, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1];
  const ada = scorecardResult(middle, "Sales or business development");
  expect([ada.total, ada.pct, ada.stage.name]).toEqual([
    23,
    45,
    "Ready to build",
  ]);
  expect(ada.areas.map((a) => a.pct)).toEqual([67, 25, 67, 42, 33]);
  expect(ada.route).toEqual(["builder", "workflows", "starter"]);
  expect(scorecardResult(middle, "Finance").route).toEqual([
    "workflows",
    "builder",
    "starter",
  ]);
  const tunde = scorecardResult(
    [0, 2, 3, 2, 2, 2, 2, 1, 2, 2, 2, 3, 2, 2, 2, 2, 1, 2],
    "Founder or executive",
  );
  expect([tunde.total, tunde.pct, tunde.stage.name]).toEqual([
    49,
    96,
    "Ready to scale",
  ]);
  expect(tunde.areas.map((a) => a.pct)).toEqual([100, 100, 100, 100, 78]);
  expect(tunde.route).toEqual(["automations", "workflows", "advanced"]);
});

test("safeguards take priority for tied quick wins and approved access warnings persist independently of stage", () => {
  const zero = scorecardResult(Array(18).fill(0));
  expect(zero.wins.map((w) => w.q.id)).toEqual(["4.1", "4.2", "4.3"]);
  expect(zero.warnings.map((w) => w.title)).toEqual([
    "Get approved access first",
    "Fix safeguards before you build more",
  ]);
  const high = scorecardResult([
    1, 1, 3, 2, 2, 2, 2, 1, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2,
  ]);
  expect(high.pct).toBe(96);
  expect(high.warnings.map((w) => w.title)).toEqual([
    "Get approved access first",
  ]);
  expect(high.toolNote).toContain("ChatGPT");
  expect(
    scorecardResult([0, 1, 3, 2, 2, 2, 2, 1, 2, 2, 2, 3, 2, 2, 2, 2, 2, 2])
      .toolNote,
  ).toBe("");
});

test("stage thresholds use rounded percentages and every scored option matches the supplied question set", () => {
  const source = JSON.parse(
    readFileSync("artifacts/review-tickets/170/source-data.json", "utf8"),
  ) as { QS: { text: string; opts: (string | [string, number])[] }[] };
  expect(scorecardQuestions.map((q) => q.text)).toEqual(
    source.QS.map((q) => q.text),
  );
  expect(scorecardQuestions.map((q) => q.opts.map((o) => o.label))).toEqual(
    source.QS.map((q) => q.opts.map((o) => (typeof o === "string" ? o : o[0]))),
  );
  expect(scorecardQuestions.map((q) => q.opts.map((o) => o.points))).toEqual(
    source.QS.map((q) =>
      q.opts.map((o) => (typeof o === "string" ? null : o[1])),
    ),
  );
  // Independent literal totals around both rounded stage boundaries.
  for (const [target, expected] of [
    [20, "Foundations"],
    [21, "Ready to build"],
    [41, "Ready to build"],
    [42, "Ready to scale"],
  ] as const) {
    // Find a valid example totaling target, then check the independent boundary.
    let states = new Map<number, number[]>([[0, [0]]]);
    for (const q of scorecardQuestions.slice(1)) {
      const next = new Map<number, number[]>();
      for (const [total, a] of states)
        q.opts.forEach((o, i) => {
          const sum = total + (o.points ?? 0);
          if (sum <= target && !next.has(sum)) next.set(sum, [...a, i]);
        });
      states = next;
    }
    expect(scorecardResult(states.get(target)!).stage.name).toBe(expected);
  }
  expect(() => scorecardResult([])).toThrow(/Complete all 18/);
});

test("the September 23 content delta is handled honestly rather than preserved verbatim", () => {
  const delta = JSON.parse(
    readFileSync(
      "artifacts/standup-gaps/2026-09-23/lovable-delta.json",
      "utf8",
    ),
  );
  const home = readable(page);
  expect(home).not.toContain("Three audiences. One method.");
  expect(home).not.toContain("The work changes by role. The method does not:");
  expect(home).not.toContain("Target: 8 hours saved weekly, per person");
  expect(home).toContain("Find the work that sounds like yours");
  expect(home).toContain(
    "Bring the operating problem behind a decision or result",
  );
  expect(home).toContain(
    "Train teams. Build useful skills. Automate the work.",
  );
  // Every non-adopted source line records why it is not carried forward.
  for (const item of delta.items)
    if (item.disposition === "not adopted") expect(item.note).toBeTruthy();
  expect(home).not.toContain("Useful prompts");
});

test("the business audience strip offers all services everywhere but the services page", () => {
  const home = readable(page);
  const servicesPage = readable(renderPage("services"));
  for (const text of [home, servicesPage]) {
    expect(text).toContain(
      "Built for Private equity Portfolio companies Software companies",
    );
    // #36: the strip names business audiences; it does not imply completed client work.
    expect(text).not.toContain("Delivered for");
  }
  expect(home).toContain("See all services");
  expect(servicesPage).not.toContain("See all services");
});

test("every active resource and verified lesson has its published destination", () => {
  const resourcesPage = renderPage("resources");
  for (const [label, destination] of [
    [
      "Request the published AI Failure Modes Playbook",
      "https://www.found42.com/ai-failure-modes-playbook",
    ],
    [
      "Read the verified lesson",
      "https://maven.com/p/fc1def/build-a-strategic-advisor-in-claude",
    ],
    ["Explore the toolkit", "https://www.found42.com/toolkit"],
  ] as const) {
    expect(resourcesPage).toContain(`>${label}&nbsp;→</a>`);
    expect(resourcesPage).toContain(`href="${destination}"`);
  }
  expect(resourcesPage).toContain("Four downloadable Claude skill packages");
  expect(resourcesPage).toContain(
    "A published lesson and downloadable advisor skill",
  );
  expect(resourcesPage).not.toContain("data-email-form");
  expect(renderPage("blog")).not.toContain("data-email-form");
  expect(resourcesPage).not.toContain('data-dialog="course"');
});

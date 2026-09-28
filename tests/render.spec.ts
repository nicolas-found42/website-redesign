import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { renderHomepage } from "../src/homepage";
import { renderPage } from "../src/pages";
import { resources, scorecard, services, testimonials } from "../src/content";
import {
  readinessResult,
  scorecardQuestions,
  scorecardResult,
} from "../src/interactions";
const page = renderHomepage();
test("the complete resource page owns the current catalog and availability", async ({
  page,
}) => {
  await page.goto("/resources/");
  const sections = page.locator(".resource-detail, #scorecard");
  await expect(sections).toHaveCount(5);
  await expect(
    page.getByRole("heading", { name: "Start with the work." }),
  ).toBeVisible();
  await expect(page.locator(".page-opening")).toContainText(
    "Three free resources you can use today, and two more that are coming later",
  );
  for (const item of resources) {
    const section = page.locator(`#${item.id}`);
    await expect(section).toContainText(item.title);
    await expect(section).toContainText(item.description);
    if (item.id === "scorecard") {
      await expect(section).toContainText(
        "No email required. Your answers stay in this browser and are not sent or stored.",
      );
    } else {
      await expect(section).toContainText(item.gate);
    }
  }
  await expect(page.locator("#scorecard")).toContainText("Question 1 of 12");
});
test("source offerings and attributed workshop proof are preserved", () => {
  for (const item of services) {
    expect(page).toContain(item.title);
    expect(page).toContain(item.description);
    for (const detail of item.details) expect(page).toContain(detail);
  }
  for (const item of testimonials) {
    expect(page).toContain(item.quote);
    expect(page).toContain(item.label);
  }
  expect(page).not.toMatch(/8 hours saved weekly|eight hours is a target/i);
  expect(page).not.toContain("measurable results");
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

test("the scorecard asks the Plan B assessment in the five advertised areas", () => {
  // Found42's "Scorecard Questions" draft, Plan B, in the order the areas take them.
  expect(scorecardQuestions.map((question) => question.text)).toEqual([
    "Do you currently use any AI tools to automate repetitive tasks in your business?",
    "Have you tried using an AI tool in your business and kept using it past the first week?",
    "Is your data stored in a centralized location accessible to your team?",
    "Do you have policies on what data can be shared with AI tools?",
    "Are your business processes already digitized and standardized?",
    "Have you identified any specific tasks that could benefit from automation?",
    "Do you have clear policies on which AI tools can be used at work?",
    "Is your team trained to utilize AI tools for process improvement?",
    "If you rolled out one new automation tomorrow, would your team actually use it without you pushing them to?",
    "Do you have a process for deciding which tasks are worth automating?",
    "Have you ever decided against trying an AI tool because of the cost?",
    "Have you ever decided against trying an AI tool because you weren’t sure it would work for your business?",
  ]);
  expect(scorecard.areas.map((area) => area.name)).toEqual([
    "Current AI use",
    "Data practices",
    "Workflow efficiency",
    "AI integration readiness",
    "Automation goals",
  ]);
  expect(scorecard.open).toBe("What would you like to automate instantly?");
});

test("every one of the 4,096 answer sets gets a stage and places to start, never a score", () => {
  const sizes = scorecard.areas.map((area) => area.questions.length);
  const stageFor = (yes: number) =>
    yes >= 9
      ? "Ready to scale"
      : yes >= 7
        ? "Ready for a first workflow"
        : yes >= 4
          ? "Foundations forming"
          : "Early days";
  for (let mask = 0; mask < 1 << 12; mask++) {
    const answers = Array.from({ length: 12 }, (_, i) =>
      Boolean(mask & (1 << i)),
    );
    const result = scorecardResult(answers);
    const areaYes = answers.slice(0, 10).filter(Boolean).length;
    expect(result.stage.title).toBe(stageFor(areaYes));
    let at = 0;
    result.areas.forEach((area, index) => {
      const yes = answers.slice(at, at + sizes[index]).filter(Boolean).length;
      at += sizes[index];
      expect(area.status).toBe(
        yes === sizes[index]
          ? "In place"
          : yes > 0
            ? "Partly in place"
            : "Next to build",
      );
    });
    expect(result.next.length).toBeLessThanOrEqual(3);
    expect(result.next.every((area) => area.status !== "In place")).toBe(true);
    const shares = result.next.map((area) => area.share);
    expect(shares).toEqual([...shares].sort((a, b) => a - b));
    expect(result.barriers.map((barrier) => barrier.id)).toEqual(
      [answers[10] && "cost", answers[11] && "fit"].filter(Boolean),
    );
    expect(
      readable(
        [
          result.stage.title,
          result.stage.body,
          ...result.next.map(({ area }) => area.advice),
          ...result.barriers.map((barrier) => barrier.advice),
        ].join(" "),
      ),
    ).not.toMatch(/\d/);
  }
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
  expect(home).toContain("Who Found42 helps");
  expect(home).toContain("Use AI for your decisions");
  expect(home).toContain(
    "Train teams. Build useful skills. Automate the work.",
  );
  // Every non-adopted source line records why it is not carried forward.
  for (const item of delta.items)
    if (item.disposition === "not adopted") expect(item.note).toBeTruthy();
  expect(home).not.toContain("Useful prompts");
});

test("the industries strip offers all services everywhere but the services page", () => {
  const home = readable(page);
  const servicesPage = readable(renderPage("services"));
  for (const text of [home, servicesPage]) {
    expect(text).toContain("Built for Private Equity B2B SaaS");
    // #36: the strip names industries; it does not imply completed client work.
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
  expect(resourcesPage).toContain("The five-day mini-course is not available");
  expect(resourcesPage).toContain("No starter files are available yet");
  expect(resourcesPage).not.toContain("data-email-form");
  expect(renderPage("blog")).not.toContain("data-email-form");
  expect(resourcesPage).not.toContain('data-dialog="course"');
});

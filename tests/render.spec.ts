import { test, expect } from "@playwright/test";
import { renderHomepage } from "../src/homepage";
import { resources, services, testimonials } from "../src/content";
import { readinessResult } from "../src/interactions";
const page = renderHomepage();
test("every source resource has its description and truthful access terms", () => {
  for (const item of resources) {
    expect(page).toContain(item.title);
    expect(page).toContain(item.description);
    expect(page).toContain(item.gate);
    expect(page).toContain(`resources/#${item.id}`);
  }
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
  expect(page).not.toContain("Save eight hours a week, per person.");
  expect(page).toContain("not a guaranteed result");
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

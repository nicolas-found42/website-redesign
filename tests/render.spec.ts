import { test, expect } from "@playwright/test";
import { renderHomepage } from "../src/homepage";
import {
  article,
  playbook,
  proofSource,
  resources,
  services,
  testimonials,
} from "../src/content";

// These assertions cross the homepage's own interface, so they run once rather
// than once per browser engine: the browser suite keeps the journeys.
const page = renderHomepage();
const records = [...resources, playbook, article];

test("every resource record reaches the page with its access gate", () => {
  for (const record of records) {
    expect(page, `${record.title} gate`).toContain(record.gate);
    expect(page, `${record.title} destination`).toContain(
      `href="${record.url}"`,
    );
  }
  for (const resource of resources) {
    expect(page, `${resource.title} kind`).toContain(resource.kind);
  }
});

test("records offering access without a form are exactly the inspected ones", () => {
  const ungated = records
    .filter((record) => record.gate.startsWith("No form"))
    .map((record) => record.title);
  const inspected = records
    .filter((record) => record.deliveredContentInspected)
    .map((record) => record.title);
  expect(ungated).toEqual(inspected);
  expect(inspected).toHaveLength(1);
});

test("no inventory totals, guarantees or ROI metrics reach the page", () => {
  expect(page).not.toMatch(
    /\bROI\b|guarantee|instant delivery|\d+\s*(%|hours?|days?|weeks?|months?)/i,
  );
});

test("the published offers and attributed excerpts reach the page", () => {
  for (const service of services) {
    expect(page, service.title).toContain(service.title);
  }
  for (const testimonial of testimonials) {
    expect(page, testimonial.name).toContain(testimonial.name);
    expect(page, testimonial.name).toContain(testimonial.quote);
  }
  expect(page).toContain(`href="${proofSource}"`);
});

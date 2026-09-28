import { expect, test } from "@playwright/test";

test("issue 68 controlled CI gate failure", () => {
  expect(1).toBe(2);
});

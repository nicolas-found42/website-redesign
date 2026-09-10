import { test, expect } from "@playwright/test";

test("homepage renders using local assets without contacting an external content host", async ({
  page,
}) => {
  const externalRequests: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== "127.0.0.1") {
      externalRequests.push(url.href);
      return route.abort();
    }
    return route.continue();
  });
  await page.goto("/");
  await page
    .getByRole("img", { name: "Richard Achée, founder of Found42" })
    .scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, nofollow",
  );
  expect(externalRequests).toEqual([]);
  expect(errors).toEqual([]);
});

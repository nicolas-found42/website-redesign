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
  const organizations = page.getByRole("region", {
    name: "Teams we have worked with",
  });
  await expect(organizations.getByRole("img")).toHaveCount(15);
  for (const mark of await organizations.locator("img").all()) {
    await expect(mark).toHaveJSProperty("complete", true);
    await expect(mark).not.toHaveJSProperty("naturalWidth", 0);
    expect(await mark.getAttribute("src")).toMatch(/^\/assets\/logos\//);
  }
  await page
    .getByRole("img", { name: "Richard Achée, Founder and CEO of Found42" })
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

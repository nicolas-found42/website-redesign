import { test, expect } from "@playwright/test";

test.use({
  headless: false,
  launchOptions: {
    args: [
      "--auto-accept-this-tab-capture",
      "--enable-usermedia-screen-capturing",
    ],
  },
});

test.describe("native tab screenshot", () => {
  test("captures genuine tab pixels with the target visible and controls excluded", async ({
    page,
  }) => {
    await page.goto("/?review");
    const heading = page.locator("#audiences-title");
    // A visible marker lets the genuine capture prove selected-target context.
    await heading.evaluate((element) => {
      (element as HTMLElement).style.backgroundColor = "rgb(255, 0, 0)";
    });
    await heading.scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Add feedback" }).click();
    await heading.click();
    const form = page.getByRole("dialog");
    const bounds = (await heading.boundingBox())!;
    await form.getByRole("button", { name: "Capture this tab" }).click();
    await expect(form.getByRole("status")).toContainText("Screenshot ready", {
      timeout: 10000,
    });
    await expect(
      form.getByRole("img", { name: /Screenshot of Heading/ }),
    ).toBeVisible();
    await form.getByLabel("Change it to").fill("Native screenshot feedback.");
    await form.getByLabel("Your name").fill("Capture test reviewer");
    await form
      .getByLabel("Why?", { exact: true })
      .fill("Preserve the reviewed layout.");
    await form.getByRole("radio", { name: "Must change" }).check();
    await form.getByRole("button", { name: "Save feedback" }).click();
    const image = (
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("found42-review:feedback")!),
      )
    ).items[0].screenshot;
    expect(image.source).toBe("tab");
    expect(image.width).toBeGreaterThan(300);
    await test.info().attach("native-review-tab.png", {
      body: Buffer.from(image.dataUrl.split(",")[1], "base64"),
      contentType: "image/png",
    });
    const pixel = await page.evaluate(
      async ({ image, bounds }) => {
        const img = new Image();
        img.src = image.dataUrl;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext("2d")!;
        context.drawImage(img, 0, 0);
        const x = Math.floor(((bounds.x + 2) * img.width) / innerWidth);
        const y = Math.floor(((bounds.y + 2) * img.height) / innerHeight);
        return [...context.getImageData(x, y, 1, 1).data];
      },
      { image, bounds },
    );
    // Native video colour conversion may shift a channel by a few units.
    expect(pixel[0]).toBeGreaterThan(250);
    expect(pixel[1]).toBeLessThan(5);
    expect(pixel[2]).toBeLessThan(5);
    expect(pixel[3]).toBe(255);
    const preview = await page.context().newPage();
    await preview.goto(image.dataUrl);
    await expect(preview.locator("img")).toBeVisible();
  });
});

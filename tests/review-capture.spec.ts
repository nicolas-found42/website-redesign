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
      (element as HTMLElement).style.padding = "24px";
    });
    await heading.scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Add feedback" }).click();
    await heading.click();
    const form = page.getByRole("dialog");
    await form.evaluate((element) => {
      const marker = document.createElement("div");
      marker.dataset.captureControlMarker = "";
      marker.style.cssText =
        "position:fixed;left:16px;top:16px;width:48px;height:48px;background:rgb(0,255,0);pointer-events:none;z-index:99999";
      element.append(marker);
    });
    await expect(form.locator("[data-capture-control-marker]")).toBeVisible();
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
        const x = Math.floor(((bounds.x + 12) * img.width) / innerWidth);
        const y = Math.floor(((bounds.y + 12) * img.height) / innerHeight);
        const controlX = Math.floor((32 * img.width) / innerWidth);
        const controlY = Math.floor((32 * img.height) / innerHeight);
        return {
          // Native capture is lossy: chroma subsampling moves the target's own
          // edge inward and rounds individual channels down, so a single sample
          // 12px inside the box can land just outside the marker. Sample a
          // small interior patch and keep the colour that is most clearly the
          // red marker, instead of trusting one fragile pixel.
          target: [
            ...[0, 1, 2].map((i) => {
              const patch: number[][] = [];
              for (let dx = 0; dx < 3; dx += 1)
                for (let dy = 0; dy < 3; dy += 1)
                  patch.push([
                    ...context.getImageData(x + dx, y + dy, 1, 1).data,
                  ]);
              return i === 0
                ? Math.max(...patch.map((p) => p[0]))
                : Math.min(...patch.map((p) => p[i]));
            }),
            context.getImageData(x, y, 1, 1).data[3],
          ],
          control: [...context.getImageData(controlX, controlY, 1, 1).data],
        };
      },
      { image, bounds },
    );
    // Native video colour conversion and chroma subsampling can shift individual channels.
    expect(pixel.target[0]).toBeGreaterThan(250);
    expect(pixel.target[1]).toBeLessThan(40);
    expect(pixel.target[2]).toBeLessThan(40);
    expect(pixel.target[3]).toBe(255);
    // The bright green marker belongs to the hidden review controls, not the page.
    expect(
      pixel.control[1] - Math.max(pixel.control[0], pixel.control[2]),
    ).toBeLessThan(100);
    const preview = await page.context().newPage();
    await preview.goto(image.dataUrl);
    await expect(preview.locator("img")).toBeVisible();
  });
});

for (const change of ["offscreen", "detached", "scroll"] as const) {
  test(`capture refuses a target that becomes ${change} while waiting for frames`, async ({
    page,
  }) => {
    await page.goto("/");
    const result = await page.evaluate(async (change) => {
      const modulePath = "/src/review/screenshot.ts";
      const { reviewTabCapture } = await import(modulePath);
      const canvas = document.createElement("canvas");
      const stream = canvas.captureStream();
      const track = stream.getVideoTracks()[0];
      let handle = "";
      Object.defineProperty(navigator.mediaDevices, "setCaptureHandleConfig", {
        configurable: true,
        value: (config: { handle: string }) => {
          handle = config.handle;
        },
      });
      Object.defineProperty(navigator.mediaDevices, "getDisplayMedia", {
        configurable: true,
        value: async () => stream,
      });
      Object.defineProperty(track, "getSettings", {
        value: () => ({ displaySurface: "browser" }),
      });
      Object.defineProperty(track, "getCaptureHandle", {
        value: () => ({ handle }),
      });
      HTMLVideoElement.prototype.play = async () => {};
      const selected = document.createElement("div");
      selected.style.cssText =
        "position:fixed;top:100px;left:100px;width:100px;height:100px";
      document.body.append(selected);
      let frames = 0;
      HTMLVideoElement.prototype.requestVideoFrameCallback = (callback) => {
        queueMicrotask(() => {
          if (++frames === 2) {
            if (change === "offscreen") selected.style.top = "-200px";
            if (change === "detached") selected.remove();
            if (change === "scroll")
              window.scrollTo({ top: 200, behavior: "instant" });
          }
          callback(0, {} as VideoFrameCallbackMetadata);
        });
        return frames;
      };
      const visibility: boolean[] = [];
      let message = "";
      try {
        await reviewTabCapture().capture(selected, (hidden: boolean) =>
          visibility.push(hidden),
        );
      } catch (error) {
        message = (error as Error).message;
      }
      return { message, visibility, state: track.readyState };
    }, change);
    expect(result.message).toContain("try again");
    expect(result.visibility).toEqual([true, false]);
    expect(result.state).toBe("ended");
  });
}

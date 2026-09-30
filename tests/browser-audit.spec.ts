import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

for (const width of [384, 1455]) {
  test(`original skill packages and advisor lesson are available at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 742 });
    await page.goto("/resources/#library");
    const library = page.locator("#library");
    for (const [title, filename] of [
      ["executive communications reviewer", "exec-comms-reviewer.skill"],
      ["strategy teardown", "strategy-teardown.skill"],
      ["strategic advisor", "strategic-advisor.skill"],
      ["context audit", "context-audit.skill"],
    ]) {
      const downloading = page.waitForEvent("download");
      await library
        .getByRole("link", { name: `Download ${title} skill` })
        .click();
      const download = await downloading;
      expect(download.suggestedFilename()).toBe(filename);
      expect(await download.failure()).toBeNull();
      const content = await readFile((await download.path())!);
      expect(content.subarray(0, 4).toString("hex")).toBe("504b0304");
      expect(content.length).toBeGreaterThan(1900);
    }
    const course = page.locator("#course");
    await expect(
      course.getByRole("link", { name: "Read the verified lesson" }),
    ).toHaveAttribute(
      "href",
      "https://maven.com/p/fc1def/build-a-strategic-advisor-in-claude",
    );
    const downloading = page.waitForEvent("download");
    await course
      .getByRole("link", { name: "Download the strategic advisor skill" })
      .click();
    const download = await downloading;
    expect(download.suggestedFilename()).toBe("strategic-advisor.skill");
    expect(await download.failure()).toBeNull();
    await expect(course).toContainText("references/my-context-template.md");
    await expect(course).not.toContainText("five");
  });

  test(`the early-days result leads to an available resource at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 742 });
    await page.goto("/resources/#scorecard");
    const app = page.getByRole("group", { name: "AI Readiness Scorecard" });
    for (let question = 0; question < 12; question++)
      await app.getByRole("button", { name: "No", exact: true }).click();
    await app.getByRole("button", { name: /See my result/ }).click();
    await expect(
      app.getByRole("heading", { name: "Early days" }),
    ).toBeVisible();
    await app
      .getByRole("link", { name: "Explore the C-Level AI Toolkit" })
      .click();
    await expect(page).toHaveURL(/\/resources\/#toolkit$/);
    await expect(
      page
        .locator("#toolkit")
        .getByRole("link", { name: "Explore the toolkit" }),
    ).toHaveAttribute("href", "https://www.found42.com/toolkit");
  });
}

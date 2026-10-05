import { test, expect, type Download } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// These hashes identify the original Drive packages independently validated by
// ZIP extraction. A truncated, corrupt or substituted download cannot match.
const originalPackages: Record<string, { sha256: string; entry: string }> = {
  "exec-comms-reviewer.skill": {
    sha256: "f6a1fe0a8d9e2556bcc7cc04369c4a57490c119f997f9643315973ce48e1bfa6",
    entry: "exec-comms-reviewer/SKILL.md",
  },
  "strategy-teardown.skill": {
    sha256: "c450bd3215c68c8b7507f2d1535f2b6beb80262576c4562618fa11d03c1b8848",
    entry: "strategy-teardown/SKILL.md",
  },
  "strategic-advisor.skill": {
    sha256: "83bbe6bd7fb38ac0bdac07c89f076e0447d44f3c97b93c1209964f31252fd408",
    entry: "executive-strategic-advisor-v2/SKILL.md",
  },
  "context-audit.skill": {
    sha256: "4cc741b031a5954b7aa59e4f00d129f90795349b90fdfdef8c630bf28afd4cf5",
    entry: "context-audit/SKILL.md",
  },
};

async function expectOriginalPackage(download: Download, filename: string) {
  expect(download.suggestedFilename()).toBe(filename);
  expect(await download.failure()).toBeNull();
  const content = await readFile((await download.path())!);
  const original = originalPackages[filename];
  expect(createHash("sha256").update(content).digest("hex")).toBe(
    original.sha256,
  );
  // The verified source ZIPs have no comment: their final 22 bytes are EOCD.
  const end = content.length - 22;
  expect(content.readUInt32LE(end)).toBe(0x06054b50);
  const centralDirectoryOffset = content.readUInt32LE(end + 16);
  const centralDirectorySize = content.readUInt32LE(end + 12);
  expect(centralDirectoryOffset + centralDirectorySize).toBe(end);
  expect(content.readUInt32LE(centralDirectoryOffset)).toBe(0x02014b50);
  expect(
    content
      .subarray(centralDirectoryOffset, end)
      .includes(Buffer.from(original.entry)),
  ).toBe(true);
}

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
      await expectOriginalPackage(download, filename);
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
    await expectOriginalPackage(download, "strategic-advisor.skill");
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

  /**
   * #151: the quotes should be scannable, so more than one is laid out
   * side-by-side wherever the width allows. The rail scrolls rather than
   * stacking, and it never pushes the document sideways.
   */
  test(`quotes are laid out to be scanned together at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 742 });
    await page.goto("/#testimonials");
    const layout = await page.evaluate(() => {
      const track = document.querySelector(".testimonial-track")!;
      const cards = [...document.querySelectorAll(".testimonial-card")];
      const rows = new Set(
        cards.map((card) => Math.round(card.getBoundingClientRect().top)),
      );
      return { rows: rows.size, scrolls: track.scrollWidth > track.clientWidth };
    });
    expect(layout.rows, `${width}px rows`).toBe(1);
    expect(layout.scrolls, `${width}px scrolls`).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width}px`,
    ).toBe(true);
  });
}

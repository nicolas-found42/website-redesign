import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { discoverVersions } from "../scripts/versions.mjs";

/**
 * The version contract: what every version must do so a draft can never break
 * the hub or the feedback flow. It is deliberately small and identical for all
 * versions; a version's own tests live in its folder. CI narrows the run to the
 * versions a change touches by setting VERSIONS (comma-separated slugs, `all` or `none`).
 */

const origin = "http://127.0.0.1:4179";
// `all` or unset runs every version; `none` runs none; otherwise a slug list.
const selection = process.env.VERSIONS || "all";
const only = selection === "all" ? undefined : selection.split(",");
const versions = (await discoverVersions()).filter(
  (v) => !only || only.includes(v.slug),
);

for (const { slug } of versions) {
  const base = `${origin}/website-redesign/${slug}/`;

  test.describe(`version contract: ${slug}`, () => {
    test("builds to a noindex page that reads with scripts off [production]", async ({
      browser,
      request,
    }) => {
      const html = await (await request.get(base)).text();
      expect(html).toContain("noindex");
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(base);
      await expect(page.locator("main").first()).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1 }).first(),
      ).toBeVisible();
      await context.close();
    });

    test("every page names its version and leads back to the hub, even with scripts off [production]", async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(base);
      const strip = page.getByRole("navigation", { name: "Redesign hub" });
      await expect(strip).toBeVisible();
      await expect(strip).toContainText(slug);
      await expect(
        strip.getByRole("link", { name: "All versions" }),
      ).toHaveAttribute("href", "/website-redesign/");
      await context.close();
    });

    test("internal links resolve [production]", async ({ page, request }) => {
      await page.goto(base);
      const links = await page
        .locator("a[href]")
        .evaluateAll((anchors) =>
          anchors.map((a) => (a as HTMLAnchorElement).href),
        );
      for (const href of new Set(links)) {
        if (!href.startsWith(base)) continue;
        const response = await request.get(href.split("#")[0].split("?")[0]);
        expect(response.status(), href).toBe(200);
      }
    });

    test("has no serious accessibility violations on its home page [production]", async ({
      page,
    }) => {
      await page.goto(base);
      await page.waitForLoadState("load");
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(audit.violations).toEqual([]);
    });

    test("review mode loads only from a review link and sends feedback scoped to this version [production]", async ({
      page,
    }) => {
      const requested: string[] = [];
      page.on("request", (request) => requested.push(request.url()));
      await page.goto(base);
      await expect(page.locator("main").first()).toBeVisible();
      await expect(page.locator("#found42-review")).toHaveCount(0);
      expect(requested.filter((url) => /\/assets\/review-/.test(url))).toEqual(
        [],
      );

      const own = `found42-review:feedback:${slug}`;
      const item = (id: string) => ({
        id,
        created: "2026-11-02T00:00:00.000Z",
        reviewer: "Contract Tester",
        target: {
          page: "/",
          pageName: "Home",
          section: "Page opening",
          element: "Heading",
          selector: "h1",
          text: "Heading",
          state: [],
          viewport: { width: 1280, height: 720 },
        },
        change: { kind: "comment", detail: "Contract check." },
        everywhere: false,
        why: "Contract check.",
        priority: "nice",
      });
      await page.addInitScript(
        ([key, other, own1, other1]) => {
          const list = (id: string) =>
            JSON.stringify({
              version: 1,
              reviewer: "Contract Tester",
              items: [JSON.parse(id)],
            });
          if (!localStorage.getItem(key)) localStorage.setItem(key, list(own1));
          if (!localStorage.getItem(other))
            localStorage.setItem(other, list(other1));
        },
        [
          own,
          "found42-review:feedback:some-other-version",
          JSON.stringify(item("own-draft")),
          JSON.stringify(item("other-draft")),
        ],
      );
      let submitted:
        { version: number; site: string; items: { id: string }[] } | undefined;
      await page.route(
        "https://review-submission.test/submit",
        async (route) => {
          submitted = route.request().postDataJSON();
          await route.fulfill({
            json: {
              outcomes: submitted!.items.map((sent) => ({
                id: sent.id,
                fingerprint: "unused",
                status: "pending",
                message: "Checked.",
              })),
            },
          });
        },
      );
      await page.goto(`${base}?review`);
      const bar = page.getByRole("region", { name: "Review mode" });
      await expect(bar).toBeVisible();
      // A reviewer can always see which version their feedback goes to.
      await expect(bar).toContainText(`version ${slug}`);
      // Only this version's draft is offered; another version's stays out of sight.
      const send = bar.getByRole("button", { name: /Send/ });
      await expect(send).toHaveText("Send 1 feedback item");
      await send.click();
      await expect.poll(() => submitted).toBeTruthy();
      expect(submitted!.version).toBe(2);
      expect(submitted!.site).toBe(
        `https://nicolas-found42.github.io/website-redesign/${slug}/`,
      );
      expect(submitted!.items.map((i) => i.id)).toEqual(["own-draft"]);
      const untouched = await page.evaluate(
        (key) => localStorage.getItem(key),
        "found42-review:feedback:some-other-version",
      );
      expect(untouched).toContain("other-draft");
    });
  });
}

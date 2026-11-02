import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { discoverVersions, metadataProblems } from "../scripts/versions.mjs";
import { renderHub, issuesUrl } from "../hub/render.mjs";
import { select } from "../scripts/changed-versions.mjs";

/**
 * The folders under `versions/` are the only registry. These tests prove the
 * rule that matters most: a version exists while its folder does, and deleting
 * the folder removes it from discovery, the hub and every other listing.
 */

const meta = (over: Record<string, unknown> = {}) => ({
  status: "draft",
  created: "2026-11-02",
  ...over,
});

function project() {
  const dir = mkdtempSync(join(tmpdir(), "found42-versions-"));
  mkdirSync(join(dir, "versions"));
  const add = (slug: string, data: unknown = meta()) => {
    mkdirSync(join(dir, "versions", slug), { recursive: true });
    writeFileSync(
      join(dir, "versions", slug, "version.json"),
      JSON.stringify(data),
    );
  };
  return { dir, versions: join(dir, "versions"), add };
}

test("metadata is validated field by field", () => {
  expect(metadataProblems("amber-heron", meta())).toEqual([]);
  expect(metadataProblems("Bad_Name", meta())).toHaveLength(1);
  expect(metadataProblems("a", meta({ status: "done" }))[0]).toContain(
    "status must be one of",
  );
  expect(metadataProblems("a", meta({ created: "yesterday" }))[0]).toContain(
    "YYYY-MM-DD",
  );
  expect(metadataProblems("a", meta({ extra: 1 }))[0]).toContain(
    'unknown field "extra"',
  );
  expect(metadataProblems("a", meta({ changesFacts: " " }))[0]).toContain(
    "changesFacts",
  );
  expect(metadataProblems("a", [])).toEqual(["version.json must be an object"]);
});

test("the baseline is first, then newest, and deleting a folder removes the version", async () => {
  const { dir, versions, add } = project();
  try {
    add("old-fern", meta({ created: "2026-09-01" }));
    add("new-oak", meta({ created: "2026-10-30" }));
    add("current", meta({ status: "in-review", created: "2026-01-01" }));
    expect((await discoverVersions(versions)).map((v) => v.slug)).toEqual([
      "current",
      "new-oak",
      "old-fern",
    ]);
    rmSync(join(versions, "new-oak"), { recursive: true });
    const after = await discoverVersions(versions);
    expect(after.map((v) => v.slug)).toEqual(["current", "old-fern"]);
    expect(renderHub(after)).not.toContain("new-oak");
    expect(JSON.stringify(after)).not.toContain("new-oak");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a version folder without valid metadata fails the build loudly", async () => {
  const { dir, versions, add } = project();
  try {
    mkdirSync(join(versions, "no-meta"));
    await expect(discoverVersions(versions)).rejects.toThrow(
      /versions\/no-meta\/version\.json is missing/,
    );
    rmSync(join(versions, "no-meta"), { recursive: true });
    add("bad-one", meta({ status: "nope" }));
    await expect(discoverVersions(versions)).rejects.toThrow(
      /bad-one\/version\.json: status must be one of/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the hub lists active versions, folds archived ones away and escapes text", async () => {
  const { dir, versions, add } = project();
  try {
    add("current", meta({ status: "in-review", title: "Current site" }));
    add(
      "bold-owl",
      meta({
        title: '<img src=x onerror="1">',
        summary: "Uses a bolder voice & new layout.",
        changesFacts: "Drops the 2024 outcome figure.",
      }),
    );
    add("old-elm", meta({ status: "archived" }));
    const html = renderHub(await discoverVersions(versions), {
      previews: new Set(["current"]),
    });
    expect(html).toContain('name="robots" content="noindex, nofollow"');
    expect(html).not.toContain("<script");
    expect(html).toContain("Versions (2)");
    expect(html).toContain("Archived (1)");
    expect(html).toContain('href="bold-owl/?review"');
    expect(html).toContain('src="previews/current.png"');
    expect(html).toContain("No preview yet");
    expect(html).toContain("&lt;img src=x onerror=&quot;1&quot;&gt;");
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("Changes shared facts:");
    expect(html).toContain("Baseline");
    expect(issuesUrl("bold-owl")).toContain(
      encodeURIComponent('label:"version:bold-owl"'),
    );
    // The archived card sits inside the collapsed section.
    expect(html.indexOf("old-elm")).toBeGreaterThan(html.indexOf("<details>"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("version:new scaffolds a self-contained draft that deleting removes", async () => {
  const { dir, versions, add } = project();
  try {
    add("current", meta({ status: "in-review" }));
    mkdirSync(join(versions, "current", "src"));
    writeFileSync(join(versions, "current", "src", "main.ts"), "// site");
    writeFileSync(join(versions, "current", "index.html"), "<html></html>");
    const script = resolve("scripts/new-version.mjs");
    const run = (...args: string[]) =>
      execFileSync(process.execPath, [script, ...args], {
        cwd: dir,
        encoding: "utf8",
      });
    run("--title", "Bold type", "--author", "Sam");
    run("--blank");
    const created = readdirSync(versions).filter((d) => d !== "current");
    expect(created).toHaveLength(2);
    for (const slug of created) expect(slug).toMatch(/^[a-z]+-[a-z]+$/);
    const [copy, blank] = created.map((slug) => ({
      slug,
      meta: JSON.parse(
        readFileSync(join(versions, slug, "version.json"), "utf8"),
      ),
    }));
    const copied = [copy, blank].find((v) => v.meta.title === "Bold type")!;
    const shell = [copy, blank].find((v) => v !== copied)!;
    expect(copied.meta).toMatchObject({
      status: "draft",
      author: "Sam",
      title: "Bold type",
    });
    expect(existsSync(join(versions, copied.slug, "src/main.ts"))).toBe(true);
    const html = readFileSync(join(versions, shell.slug, "index.html"), "utf8");
    expect(html).toContain("noindex");
    expect(html).toContain('<main id="main">');
    expect(
      readFileSync(join(versions, shell.slug, "src/main.ts"), "utf8"),
    ).toContain("@shared/review/activation");
    expect(
      (await discoverVersions(versions)).map((v) => v.slug).sort(),
    ).toEqual(["current", ...created].sort());
    // Deleting the folder is the whole removal.
    rmSync(join(versions, copied.slug), { recursive: true });
    expect((await discoverVersions(versions)).map((v) => v.slug)).not.toContain(
      copied.slug,
    );
    // An explicit name that already exists is refused, never overwritten.
    expect(() => run("--name", shell.slug)).toThrow();
    // A copy source must exist.
    expect(() => run("--from", "missing-one")).toThrow();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

/** Every source file under `dir`, skipping build output and dependencies. */
function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory())
      return /^(?:node_modules|dist|public)$/.test(entry.name)
        ? []
        : sources(path);
    return /\.(?:ts|mjs|js|css)$/.test(entry.name) ? [path] : [];
  });
}
const specifiers = (text: string) =>
  [
    ...text.matchAll(/(?:from|import\()\s*["']([^"']+)["']/g),
    ...text.matchAll(/@import\s+["']([^"']+)["']/g),
  ].map((match) => match[1]);

test("shared code and other versions never reach into a version folder", () => {
  const versionsRoot = resolve("versions");
  const violations: string[] = [];
  for (const dir of ["shared", "hub", "scripts", "worker"])
    for (const file of sources(resolve(dir)))
      for (const specifier of specifiers(readFileSync(file, "utf8")))
        if (/(?:^|\/)versions\//.test(specifier))
          violations.push(`${file}: ${specifier}`);
  for (const slug of readdirSync(versionsRoot)) {
    const own = join(versionsRoot, slug);
    for (const file of sources(own))
      for (const specifier of specifiers(readFileSync(file, "utf8"))) {
        if (!specifier.startsWith(".")) continue;
        const target = resolve(join(file, ".."), specifier);
        if (target.startsWith(versionsRoot) && !target.startsWith(`${own}/`))
          violations.push(`${file}: ${specifier}`);
      }
  }
  expect(violations).toEqual([]);
});

test("CI narrows the version contract to the versions a change touches", () => {
  expect(select(["versions/amber-heron/src/main.ts"])).toBe("amber-heron");
  expect(
    select(["versions/b-two/index.html", "versions/a-one/version.json"]),
  ).toBe("a-one,b-two");
  // Shared code, the build, the hub and tooling can affect every version.
  expect(select(["versions/a-one/x.ts", "shared/review/review.ts"])).toBe(
    "all",
  );
  expect(select(["hub/render.mjs"])).toBe("all");
  expect(select(["vite.config.ts"])).toBe("all");
  expect(select([".github/workflows/pages.yml"])).toBe("all");
  expect(select(["worker/index.ts"])).toBe("all");
  // Documentation alone changes no version.
  expect(select(["docs/DESIGN.md", "README.md"])).toBe("none");
  expect(select([])).toBe("none");
});

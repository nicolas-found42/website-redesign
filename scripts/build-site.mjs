/**
 * Builds the whole Pages artifact: every folder under `versions/` becomes
 * `dist/<slug>/`, and the hub index at `dist/index.html` lists them with a
 * generated preview each. Nothing here names a version, so adding or deleting a
 * folder changes the site with no other edit.
 *
 *   node scripts/build-site.mjs [--require-previews]
 */
import { execFileSync } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { discoverVersions } from "./versions.mjs";
import { hubNotFound, renderHub } from "../hub/render.mjs";
import { servePages } from "./serve-pages.mjs";

const requirePreviews =
  process.argv.includes("--require-previews") || !!process.env.CI;
const dist = resolve("dist");

/** Screenshots each built version's home page; returns the slugs that got one. */
async function capturePreviews(versions) {
  const captured = new Set();
  let chromium;
  try {
    ({ chromium } = await import("@playwright/test"));
  } catch (error) {
    return fail(`Playwright is unavailable: ${error.message}`, captured);
  }
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    return fail(`Chromium could not start: ${error.message}`, captured);
  }
  const server = await servePages({ root: dist, port: 0 });
  const { port } = server.address();
  await mkdir(resolve(dist, "previews"), { recursive: true });
  try {
    for (const { slug } of versions) {
      try {
        for (const [suffix, width, height, scale] of [
          ["", 1280, 800, 0.5],
          ["-mobile", 390, 640, 1],
        ]) {
          const context = await browser.newContext({
            viewport: { width, height },
            deviceScaleFactor: scale,
            reducedMotion: "reduce",
            javaScriptEnabled: true,
          });
          const page = await context.newPage();
          await page.goto(
            `http://127.0.0.1:${port}/website-redesign/${slug}/`,
            {
              waitUntil: "load",
            },
          );
          await page.waitForTimeout(600);
          await page.screenshot({
            path: resolve(dist, "previews", `${slug}${suffix}.png`),
            animations: "disabled",
          });
          await context.close();
        }
        captured.add(slug);
      } catch (error) {
        fail(`No preview for ${slug}: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  return captured;
}

function fail(message, value) {
  if (requirePreviews) throw new Error(message);
  console.warn(`warning: ${message}`);
  return value;
}

const versions = await discoverVersions();
if (!versions.length) throw new Error("versions/ holds no versions.");
await rm(dist, { recursive: true, force: true });
for (const version of versions) {
  console.log(`Building ${version.slug}`);
  process.env.VERSION = version.slug;
  execFileSync(resolve("node_modules/.bin/vite"), ["build"], {
    stdio: "inherit",
    env: { ...process.env, VERSION: version.slug },
  });
  if (version.hasPrerender) {
    const { default: prerender } = await import(
      pathToFileURL(resolve("versions", version.slug, "prerender.mjs")).href
    );
    await prerender({
      slug: version.slug,
      outDir: resolve(dist, version.slug),
    });
  }
}
await writeFile(resolve(dist, "404.html"), hubNotFound);
const previews = await capturePreviews(versions);
await writeFile(resolve(dist, "index.html"), renderHub(versions, { previews }));
await writeFile(
  resolve(dist, "versions.json"),
  JSON.stringify(
    versions.map((version) =>
      Object.fromEntries(
        Object.entries(version).filter(([key]) => key !== "hasPrerender"),
      ),
    ),
    null,
    2,
  ),
);
console.log(`Built ${versions.length} version(s) into dist/`);

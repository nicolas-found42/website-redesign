/**
 * Builds the whole Pages artifact: every folder under `versions/` becomes
 * `dist/<slug>/`, and the hub index at `dist/index.html` lists them with a
 * generated preview each. Nothing here names a version, so adding or deleting a
 * folder changes the site with no other edit.
 *
 *   node scripts/build-site.mjs [--require-previews]
 */
import { execFileSync } from "node:child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { discoverVersions } from "./versions.mjs";
import { hubNotFound, renderHub } from "../hub/render.mjs";
import { servePages } from "./serve-pages.mjs";
import { injectStrip, stripId } from "../hub/strip.mjs";
import {
  siteBase,
  previewHref,
  versionHref,
  versionOutput,
} from "./publish.mjs";

/** Every HTML file a version published, at any depth. */
async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(path)));
    else if (entry.name.endsWith(".html")) found.push(path);
  }
  return found;
}

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
        for (const [variant, width, height, scale] of [
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
            `http://127.0.0.1:${port}${siteBase}${versionHref(slug)}`,
            {
              waitUntil: "load",
            },
          );
          // The hub strip is not part of the design being previewed.
          await page.evaluate(
            (id) => document.getElementById(id)?.remove(),
            stripId,
          );
          await page.waitForTimeout(600);
          await page.screenshot({
            path: resolve(dist, previewHref(slug, variant)),
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
  if (version.prerender) {
    const { default: prerender } = await import(
      pathToFileURL(resolve("versions", version.slug, "prerender.mjs")).href
    );
    await prerender({
      slug: version.slug,
      outDir: versionOutput(version.slug),
    });
  }
}
// Every page of every version gets the way back to the hub and its own name.
for (const version of versions)
  for (const file of await htmlFiles(versionOutput(version.slug)))
    await writeFile(file, injectStrip(await readFile(file, "utf8"), version));
await writeFile(resolve(dist, "404.html"), hubNotFound);
const previews = await capturePreviews(versions);
await writeFile(resolve(dist, "index.html"), renderHub(versions, { previews }));
await writeFile(
  resolve(dist, "versions.json"),
  JSON.stringify(versions, null, 2),
);
console.log(`Built ${versions.length} version(s) into dist/`);

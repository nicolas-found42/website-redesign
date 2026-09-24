import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";

const manifest = JSON.parse(
  await readFile(
    "artifacts/lovable-migration/2026-09-16/manifest.json",
    "utf8",
  ),
);
const origin = "http://127.0.0.1:4179";
const base = `${origin}/website-redesign`;
const server = spawn(process.execPath, ["scripts/serve-pages.mjs"], {
  stdio: ["ignore", "pipe", "pipe"],
});
let serverOutput = "";
for (const stream of [server.stdout, server.stderr]) {
  stream.on("data", (chunk) => {
    serverOutput += chunk;
  });
}

async function get(path, options) {
  return fetch(path, { signal: AbortSignal.timeout(3000), ...options });
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) break;
    try {
      const response = await get(`${base}/`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      await delay(50);
    }
  }
  assert.ok(ready, `Pages preview did not start: ${serverOutput}`);

  const assets = new Set();
  for (const page of manifest.pages) {
    const url = base + page.destination;
    const response = await get(url);
    assert.equal(
      response.status,
      200,
      `${page.destination} must open directly`,
    );
    const html = await response.text();
    assert.match(
      html,
      /<main id="main">/,
      `${page.destination} must be prerendered`,
    );
    assert.doesNotMatch(html, /<title>Page not found \| Found42<\/title>/);
    for (const match of html.matchAll(
      /(?:src|href)="(\/website-redesign\/assets\/[^"#]+)"/g,
    )) {
      assets.add(match[1]);
    }
    if (page.destination !== "/") {
      const withoutSlash = await get(url.slice(0, -1), { redirect: "manual" });
      assert.equal(
        withoutSlash.status,
        301,
        `${page.destination} must redirect`,
      );
    }
  }
  assert.ok(assets.size > 0, "Built pages must reference bundled assets");
  for (const asset of assets) {
    const response = await get(origin + asset);
    assert.equal(response.status, 200, `${asset} must be available`);
  }
  const missing = await get(`${base}/missing-route`);
  assert.equal(missing.status, 404, "Unknown routes must return a real 404");
  assert.match(await missing.text(), /Page not found\./);
  console.log(
    `Pages smoke passed: ${manifest.pages.length} routes, ${assets.size} assets, redirects, and 404`,
  );
} finally {
  if (server.exitCode === null) {
    server.kill();
    await once(server, "exit");
  }
}

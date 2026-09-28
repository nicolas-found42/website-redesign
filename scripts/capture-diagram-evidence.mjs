/**
 * Review evidence only; never imported by or published with the website.
 *
 * Captures the seven homepage diagrams — the opening drawing, the three
 * audience scenes and the three service drawings — at rest and in motion, so a
 * redesign can be compared with the same shots of the page it replaces.
 *
 *   node scripts/capture-diagram-evidence.mjs <origin> <out-dir> [--motion]
 *
 * `origin` is the site root with its base path, for example the deployed
 * `https://nicolas-found42.github.io/website-redesign/` or the local
 * production preview `http://127.0.0.1:4179/website-redesign/`.
 */
import { chromium } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const [origin, out, ...flags] = process.argv.slice(2);
if (!origin || !out) {
  console.error(
    "usage: capture-diagram-evidence.mjs <origin> <out-dir> [--motion]",
  );
  process.exit(1);
}
const motion = flags.includes("--motion");
const root = origin.endsWith("/") ? origin : `${origin}/`;

/** Wide, the breakpoint band between the two layouts, and two phones. */
const viewports = [
  { name: "1440", width: 1440, height: 900, scale: 1 },
  { name: "1024", width: 1024, height: 768, scale: 1 },
  { name: "900", width: 900, height: 1000, scale: 1 },
  { name: "390", width: 390, height: 844, scale: 2 },
  { name: "320", width: 320, height: 640, scale: 2 },
];

const audiences = ["executives", "contributors", "builders"];
const services = ["training", "automation", "product"];
const serviceNames = ["Workshops", "Workflows", "Automations"];

const settle = (page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  });

const browser = await chromium.launch();
const shots = [];
try {
  await mkdir(out, { recursive: true });

  /* ── Still: every diagram at rest, as a reduced-motion visitor sees it ── */
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.scale,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(root);
    await settle(page);

    const hero = `hero-${viewport.name}.png`;
    await page.locator(".hero").screenshot({ path: `${out}/${hero}` });
    shots.push({ diagram: "hero", viewport, file: hero });

    for (const [index, id] of audiences.entries()) {
      await page.locator(`[data-audience="${index}"]`).click();
      const figure = page.locator(`#audience-${id} .audience-figure`);
      await figure.scrollIntoViewIfNeeded();
      await settle(page);
      const file = `audience-${id}-${viewport.name}.png`;
      await figure.screenshot({ path: `${out}/${file}` });
      shots.push({ diagram: `audience-${id}`, viewport, file });
    }

    const narrow = viewport.width <= 960;
    for (const [index, id] of services.entries()) {
      const file = `service-${id}-${viewport.name}.png`;
      if (narrow) {
        const figure = page.locator(`#service-${id} .service-figure`);
        await figure.scrollIntoViewIfNeeded();
        await settle(page);
        await figure.screenshot({ path: `${out}/${file}` });
      } else {
        await page
          .getByRole("button", { name: serviceNames[index], exact: true })
          .click();
        await page.waitForTimeout(400);
        await settle(page);
        await page
          .locator(".services-sticky")
          .screenshot({ path: `${out}/${file}` });
      }
      shots.push({ diagram: `service-${id}`, viewport, file });
    }

    // The same renderers draw the playbook's review scene and the industry
    // pages' portrait of the opening drawing.
    for (const [diagram, path, selector] of [
      ["review", "resources/", "#playbook .review-figure"],
      ["industry", "industries/private-equity/", ".page-drawing"],
    ]) {
      await page.goto(`${root}${path}`);
      await settle(page);
      const figure = page.locator(selector);
      await figure.scrollIntoViewIfNeeded();
      await settle(page);
      const file = `${diagram}-${viewport.name}.png`;
      await figure.screenshot({ path: `${out}/${file}` });
      shots.push({ diagram, viewport, file });
    }
    await context.close();
  }

  /* ── Motion: short recordings of the opening, a scene and a transition ── */
  if (motion) {
    const recordings = `${out}/motion`;
    await mkdir(recordings, { recursive: true });
    const size = { width: 1440, height: 900 };
    const record = async (name, prepare, act, seconds, crop) => {
      const context = await browser.newContext({
        viewport: size,
        recordVideo: { dir: recordings, size },
      });
      const page = await context.newPage();
      // The recording starts with the page; everything before the action is
      // preparation, which the offset trims.
      const opened = Date.now();
      await prepare(page);
      const start = Date.now();
      await act(page);
      // Measured after the action: a gallery panel has no box until chosen.
      const box = crop ? await page.locator(crop).boundingBox() : null;
      await page.waitForTimeout(seconds * 1000);
      const video = page.video();
      await context.close();
      const raw = await video.path();
      // Keep only the part after the action, cropped to the diagram.
      const offset = Math.max(0, (start - opened) / 1000);
      const filter = [
        box
          ? `crop=${Math.round(box.width)}:${Math.round(box.height)}:${Math.round(box.x)}:${Math.round(box.y)}`
          : null,
        "fps=20",
      ]
        .filter(Boolean)
        .join(",");
      execFileSync("ffmpeg", [
        "-y",
        "-loglevel",
        "error",
        "-ss",
        String(offset),
        "-i",
        raw,
        "-t",
        String(seconds),
        "-vf",
        filter,
        `${recordings}/${name}.mp4`,
      ]);
      execFileSync("ffmpeg", [
        "-y",
        "-loglevel",
        "error",
        "-i",
        `${recordings}/${name}.mp4`,
        "-vf",
        "fps=15,scale=720:-1:flags=lanczos",
        `${recordings}/${name}-%03d.png`,
      ]);
      execFileSync("sh", [
        "-c",
        `gifski --quiet --fps 15 --width 720 -o "${recordings}/${name}.gif" "${recordings}/${name}"-*.png && rm "${recordings}/${name}"-*.png "${raw}"`,
      ]);
      shots.push({ diagram: name, viewport: size, file: `motion/${name}.gif` });
    };
    await record(
      "hero-opening",
      async () => {},
      async (page) => {
        await page.goto(root);
      },
      4.5,
      null,
    );
    await record(
      "audience-builders-told",
      async (page) => {
        await page.goto(`${root}#audiences`);
        await settle(page);
        await page.locator(".audience-figure").first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(3500);
      },
      async (page) => {
        await page.locator('[data-audience="2"]').click();
      },
      4.5,
      "#audience-builders .audience-figure",
    );
    await record(
      "service-transition",
      async (page) => {
        await page.goto(`${root}#services`);
        await settle(page);
        await page
          .getByRole("button", { name: "Workshops", exact: true })
          .click();
        await page.waitForTimeout(2500);
      },
      async (page) => {
        await page
          .getByRole("button", { name: "Workflows", exact: true })
          .click();
      },
      3.5,
      ".services-art",
    );
  }

  // A later run adds to the record rather than replacing it, so stills can be
  // retaken without losing the recordings listed by an earlier `--motion` run.
  const earlier = await readFile(`${out}/capture.json`, "utf8")
    .then((text) => JSON.parse(text).shots ?? [])
    .catch(() => []);
  const taken = new Set(shots.map((shot) => shot.file));
  await writeFile(
    `${out}/capture.json`,
    `${JSON.stringify(
      {
        origin: root,
        captured: new Date().toISOString(),
        shots: [...earlier.filter((shot) => !taken.has(shot.file)), ...shots],
      },
      null,
      2,
    )}\n`,
  );
} finally {
  await browser.close();
}

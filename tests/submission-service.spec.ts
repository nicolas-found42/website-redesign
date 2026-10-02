import { test as base, expect, chromium } from "@playwright/test";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { parse } from "jsonc-parser";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSubmissionHandler, type Env } from "../worker/index";
import {
  publicSite,
  repository,
  type Outcome,
} from "../src/review/submission-contract";
import type { FeedbackItem } from "../src/review/store";

const item = (id = "service-feedback-1"): FeedbackItem => ({
  id,
  created: "2026-09-30T12:00:00.000Z",
  reviewer: "Test reviewer",
  everywhere: true,
  why: "Make the audience clearer.",
  priority: "should",
  target: {
    page: "/",
    pageName: "Home",
    section: "Page opening",
    element: "Heading",
    selector: "#hero-title",
    text: "Old words",
    state: ["Executives selected"],
    viewport: { width: 390, height: 844 },
  },
  change: { kind: "wording", current: "Old words", proposed: "New words" },
});
interface GithubRequest {
  path: string;
  body?: Record<string, unknown>;
}
interface Service {
  env: Env;
  requests: GithubRequest[];
  github: (request: GithubRequest) => Promise<Response>;
  handler: ReturnType<typeof createSubmissionHandler>;
  send: (
    items: unknown[],
    extra?: Record<string, unknown>,
  ) => Promise<Response>;
}
const test = base.extend<{ service: Service }>({
  service: async ({}, use) => {
    const mf = new Miniflare(
      convertV4MiniflareOptions({
        modules: true,
        script: "export default {fetch() { return new Response('ok') }}",
        d1Databases: ["DB"],
      }),
    );
    try {
      const DB = await mf.getD1Database("DB");
      await DB.batch(
        readFileSync("worker/migrations/0001_submission.sql", "utf8")
          .split(";")
          .filter((sql) => sql.trim())
          .map((sql) => DB.prepare(sql)),
      );
      await DB.batch(
        readFileSync("worker/migrations/0002_screenshots.sql", "utf8")
          .split(/;(?=\s*(?:CREATE|INSERT|$))/)
          .filter((sql) => sql.trim())
          .map((sql) => DB.prepare(sql)),
      );
      await DB.batch(
        readFileSync("worker/migrations/0003_screenshot_admission.sql", "utf8")
          .split(";")
          .filter((sql) => sql.trim())
          .map((sql) => DB.prepare(sql)),
      );
      const service: Service = {
        env: {
          DB,
          GITHUB_TOKEN: "test-server-secret",
          RATE_SALT: "test-rate-secret",
          ENABLED: "true",
        },
        requests: [],
        github: async (request) =>
          request.body
            ? Response.json(
                {
                  number: 1200,
                  html_url: `https://github.com/${repository}/issues/1200`,
                },
                { status: 201 },
              )
            : Response.json([]),
        handler: async () => new Response(),
        send: async () => new Response(),
      };
      const handler = createSubmissionHandler(async (url, init) => {
        const request = {
          path: String(url),
          ...(init?.body
            ? { body: JSON.parse(String(init.body)) as Record<string, unknown> }
            : {}),
        };
        service.requests.push(request);
        return service.github(request);
      });
      service.handler = handler;
      service.send = (items, extra = {}) =>
        handler(
          new Request("https://service.test/submit", {
            method: "POST",
            headers: {
              Origin: new URL(publicSite).origin,
              "Content-Type": "application/json",
              "CF-Connecting-IP": "192.0.2.1",
            },
            body: JSON.stringify({
              version: 1,
              site: publicSite,
              items,
              ...extra,
            }),
          }),
          service.env,
        );
      await use(service);
    } finally {
      await mf.dispose();
    }
  },
});
const outcomes = async (response: { json(): Promise<unknown> }) =>
  ((await response.json()) as { outcomes: Outcome[] }).outcomes;

test("the deployed Worker runtime creates and retries through its native fetch", async () => {
  const output = mkdtempSync(join(tmpdir(), "found42-worker-runtime-"));
  let mf: Miniflare | undefined;
  try {
    try {
      execFileSync(
        process.execPath,
        [
          "node_modules/wrangler/bin/wrangler.js",
          "deploy",
          "--dry-run",
          "--config",
          "worker/wrangler.jsonc",
          "--outdir",
          output,
        ],
        { stdio: "pipe", timeout: 20_000 },
      );
    } catch (error) {
      const detail = error as Error & { stdout?: Buffer; stderr?: Buffer };
      throw new Error(
        `Worker dry run failed: ${detail.message}\n${detail.stdout?.toString() ?? ""}\n${detail.stderr?.toString() ?? ""}`,
        { cause: error },
      );
    }
    const config = parse(readFileSync("worker/wrangler.jsonc", "utf8")) as {
      compatibility_date: string;
    };
    const requests: unknown[] = [];
    mf = new Miniflare(
      convertV4MiniflareOptions({
        modules: true,
        script: readFileSync(join(output, "index.js"), "utf8"),
        compatibilityDate: config.compatibility_date,
        d1Databases: ["DB"],
        bindings: {
          ENABLED: "true",
          GITHUB_TOKEN: "test-secret",
          RATE_SALT: "test-salt",
        },
        outboundService: async (request) => {
          expect(request.url).toBe(
            `https://api.github.com/repos/${repository}/issues`,
          );
          requests.push(await request.json());
          return Response.json(
            {
              number: 1201,
              html_url: `https://github.com/${repository}/issues/1201`,
            },
            { status: 201 },
          );
        },
      }),
    );
    const DB = await mf.getD1Database("DB");
    await DB.batch(
      readFileSync("worker/migrations/0001_submission.sql", "utf8")
        .split(";")
        .filter((sql) => sql.trim())
        .map((sql) => DB.prepare(sql)),
    );
    await DB.batch(
      readFileSync("worker/migrations/0002_screenshots.sql", "utf8")
        .split(/;(?=\s*(?:CREATE|INSERT|$))/)
        .filter((sql) => sql.trim())
        .map((sql) => DB.prepare(sql)),
    );
    await DB.batch(
      readFileSync("worker/migrations/0003_screenshot_admission.sql", "utf8")
        .split(";")
        .filter((sql) => sql.trim())
        .map((sql) => DB.prepare(sql)),
    );
    const png = await screenshotPng();
    const hash = (await import("node:crypto"))
      .createHash("sha256")
      .update(png)
      .digest("hex");
    const upload = await mf.dispatchFetch(
      `https://service.test/screenshots/${hash}`,
      {
        method: "POST",
        headers: {
          Origin: new URL(publicSite).origin,
          "Content-Type": "image/png",
        },
        body: new Uint8Array(png),
      },
    );
    expect(upload.status).toBe(200);
    const publicImage = await mf.dispatchFetch(
      `https://service.test/screenshots/${hash}`,
    );
    expect(Buffer.from(await publicImage.arrayBuffer())).toEqual(png);
    const send = () =>
      mf!.dispatchFetch("https://service.test/submit", {
        method: "POST",
        headers: {
          Origin: new URL(publicSite).origin,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: 1,
          site: publicSite,
          items: [
            {
              ...item("runtime-feedback"),
              screenshot: {
                sha256: hash,
                width: 320,
                height: 240,
                source: "file",
                captured: item().created,
              },
            },
          ],
        }),
      });
    const receipt = await outcomes(await send());
    expect(receipt[0]).toMatchObject({
      status: "confirmed",
      issue: { number: 1201 },
    });
    expect(await outcomes(await send())).toEqual(receipt);
    expect(requests).toHaveLength(1);
  } finally {
    await mf?.dispose();
    rmSync(output, { recursive: true, force: true });
  }
});

test("the service returns a durable receipt and creates one safe issue per item", async ({
  service,
}) => {
  const feedback = item();
  feedback.change = {
    kind: "wording",
    current: "Old words",
    proposed:
      "@nicolas-found42 <img src=x> [click](javascript:alert(1))\n```\nNew words\n===\n- list\n1. ordered\n+ list\nhttps://example.test",
  };
  const result = await outcomes(await service.send([feedback]));
  expect(result[0]).toMatchObject({
    id: feedback.id,
    status: "confirmed",
    issue: { number: 1200 },
  });
  const issue = service.requests[0].body!;
  expect(issue.labels).toEqual(["needs-triage", "review-feedback"]);
  expect(issue).not.toHaveProperty("assignees");
  expect(issue.body).toContain("@\u200bnicolas\\-found42 &lt;img src\\=x&gt;");
  expect(issue.body).toContain("**Importance:** Should change");
  expect(issue.body).toContain("> \\=\\=\\=");
  expect(issue.body).toContain("> \\- list");
  expect(issue.body).toContain("> 1\\. ordered");
  expect(issue.body).toContain("> \\+ list");
  expect(issue.body).toContain("> https\\:\\/\\/example\\.test");
  expect(issue.body).toContain("Feedback record");
  expect(issue.body).toContain('"viewport"');
  expect(issue.body).toContain('"state"');
  expect(issue.body).toContain('"everywhere": true');
  expect(issue.body).toContain(`found42-feedback:${feedback.id}:`);
  expect(JSON.stringify(result)).not.toContain(service.env.GITHUB_TOKEN);
  expect(String(issue.body)).not.toContain(service.env.GITHUB_TOKEN);
  service.requests.length = 0;
  expect(await outcomes(await service.send([feedback]))).toEqual(result);
  expect(service.requests).toHaveLength(0);
});

test("reviewer uncertainty survives hosted validation and issue formatting", async ({
  service,
}) => {
  const original = item();
  const feedback = {
    ...original,
    target: { ...original.target, section: "case-studies" },
    kindUncertain: true as const,
  };
  const result = await outcomes(await service.send([feedback]));
  expect(result[0].status).toBe("confirmed");
  expect(service.requests[0].body!.body).toContain(
    "The reviewer chose “Not sure yet”",
  );
  expect(service.requests[0].body!.body).toContain('"kindUncertain": true');
  expect(service.requests[0].body!.body).toContain(
    "**Where:** Home › case studies ›",
  );
  expect(service.requests[0].body!.body).toContain('"section": "case-studies"');
  const comment = {
    ...item("plain-comment"),
    why: "This sounds pushy.",
    kindUncertain: true as const,
    change: { kind: "comment" as const, detail: "This sounds pushy." },
  };
  expect((await outcomes(await service.send([comment])))[0].status).toBe(
    "confirmed",
  );
  expect(service.requests[1].body!.body).toContain("**Comment**");
  expect(service.requests[1].body!.body).toContain("This sounds pushy");
  expect(service.requests[1].body!.body).not.toContain("**Why**");
  const invalid = { ...item("invalid-uncertainty"), kindUncertain: "yes" };
  expect((await outcomes(await service.send([invalid])))[0].status).toBe(
    "invalid",
  );
});

test("concurrent tabs coordinate creation before calling GitHub", async ({
  service,
}) => {
  const responses = await Promise.all([
    service.send([item()]),
    service.send([item()]),
  ]);
  const results = await Promise.all(responses.map(outcomes));
  expect(
    results
      .flat()
      .every((result) => ["confirmed", "pending"].includes(result.status)),
  ).toBe(true);
  expect(service.requests.filter((request) => request.body)).toHaveLength(1);
  expect((await outcomes(await service.send([item()])))[0].status).toBe(
    "confirmed",
  );
});

test("a lost GitHub response recovers from the repository marker without search or another create", async ({
  service,
}) => {
  let accepted: Record<string, unknown> | undefined;
  service.github = async (request) => {
    if (request.body) {
      accepted = request.body;
      throw new Error("Connection lost after acceptance");
    }
    return Response.json([
      {
        number: 1400,
        html_url: `https://github.com/${repository}/issues/1400`,
        body: accepted?.body,
      },
    ]);
  };
  expect((await outcomes(await service.send([item()])))[0].status).toBe(
    "pending",
  );
  expect((await outcomes(await service.send([item()])))[0]).toMatchObject({
    status: "confirmed",
    issue: { number: 1400 },
  });
  expect(service.requests.filter((request) => request.body)).toHaveLength(1);
  expect(service.requests.at(-1)?.path).toContain("issues?state=all");
});

test("uncertain creation remains pending even when an issue is not yet visible", async ({
  service,
}) => {
  service.github = async (request) =>
    request.body ? new Response("error", { status: 502 }) : Response.json([]);
  for (let retry = 0; retry < 3; retry++)
    expect((await outcomes(await service.send([item()])))[0].status).toBe(
      "pending",
    );
  expect(service.requests.filter((request) => request.body)).toHaveLength(1);
});

test("an edited published ID cannot overwrite or create a second issue", async ({
  service,
}) => {
  await service.send([item()]);
  const revision = { ...item(), why: "A different rationale." };
  const result = await outcomes(await service.send([revision]));
  expect(result[0]).toMatchObject({ status: "invalid" });
  expect(result[0].message).toContain("different content");
  expect(result[0].reason).toBe("content-conflict");
  expect(service.requests.filter((request) => request.body)).toHaveLength(1);
});

test("mixed valid and invalid items have separate outcomes", async ({
  service,
}) => {
  const result = await outcomes(
    await service.send([
      item(),
      { ...item("invalid-item"), assignees: ["someone"] },
    ]),
  );
  expect(result.map((result) => result.status)).toEqual([
    "confirmed",
    "invalid",
  ]);
  expect(service.requests.filter((request) => request.body)).toHaveLength(1);
});

test("explicit GitHub rejection can be retried safely", async ({ service }) => {
  service.github = async () => new Response("limited", { status: 429 });
  expect((await outcomes(await service.send([item()])))[0].status).toBe(
    "retryable",
  );
  service.github = async () =>
    Response.json(
      {
        number: 1500,
        html_url: `https://github.com/${repository}/issues/1500`,
      },
      { status: 201 },
    );
  expect((await outcomes(await service.send([item()])))[0].status).toBe(
    "confirmed",
  );
});

test("service-side request limits apply even with a forged allowed Origin", async ({
  service,
}) => {
  for (let i = 0; i < 30; i++)
    expect((await service.send([item()])).status).toBe(200);
  expect((await service.send([item()])).status).toBe(429);
  expect(service.requests.filter((request) => request.body)).toHaveLength(1);
});

test("clients cannot choose destinations, labels, site context or larger batches", async ({
  service,
}) => {
  for (const extra of [
    { repository: "other/repo" },
    { labels: ["approved"] },
    { site: "https://other.test/" },
  ])
    expect((await service.send([item()], extra)).status).toBe(400);
  expect(
    (await service.send(Array.from({ length: 4 }, (_, i) => item(`item-${i}`))))
      .status,
  ).toBe(400);
  expect(
    (await service.send([{ ...item(), why: "x".repeat(70_000) }])).status,
  ).toBe(400);
  expect(service.requests).toHaveLength(0);
});

test("unrecognized pages and incomplete kind-specific changes stay invalid", async ({
  service,
}) => {
  const invalid = [
    { ...item("wrong-page"), target: { ...item().target, page: "/other/" } },
    {
      ...item("bad-layout"),
      change: { kind: "layout", action: "move", detail: "" },
    },
    { ...item("bad-name"), reviewer: " " },
  ];
  expect(
    (await outcomes(await service.send(invalid))).map(
      (result) => result.status,
    ),
  ).toEqual(["invalid", "invalid", "invalid"]);
  expect(service.requests).toHaveLength(0);
});

test("disabled delivery and storage quota failures stop before issue creation", async ({
  service,
}) => {
  service.env.ENABLED = "false";
  expect((await service.send([item()])).status).toBe(503);
  service.env.ENABLED = "true";
  service.env.DB = new Proxy(service.env.DB, {
    get() {
      throw new Error("D1 free allowance exceeded");
    },
  });
  expect((await service.send([item()])).status).toBe(503);
  expect(service.requests).toHaveLength(0);
});

test("a storage failure after GitHub acceptance recovers without another create", async ({
  service,
}) => {
  const DB = service.env.DB;
  let issue: Record<string, unknown> | undefined;
  service.github = async (request) => {
    if (!request.body)
      return Response.json([
        {
          number: 1700,
          html_url: `https://github.com/${repository}/issues/1700`,
          body: issue?.body,
        },
      ]);
    issue = request.body;
    service.env.DB = new Proxy(DB, {
      get() {
        throw new Error("D1 unavailable after GitHub creation");
      },
    });
    return Response.json(
      {
        number: 1700,
        html_url: `https://github.com/${repository}/issues/1700`,
      },
      { status: 201 },
    );
  };
  expect((await outcomes(await service.send([item()])))[0].status).toBe(
    "pending",
  );
  service.env.DB = DB;
  expect((await outcomes(await service.send([item()])))[0].status).toBe(
    "confirmed",
  );
  expect(service.requests.filter((request) => request.body)).toHaveLength(1);
});

test("access guards reject foreign origins, methods and formats without GitHub calls", async ({
  service,
}) => {
  const request = (
    method: string,
    origin = new URL(publicSite).origin,
    type = "application/json",
    path = "/submit",
  ) =>
    service.handler(
      new Request(`https://service.test${path}`, {
        method,
        headers: { Origin: origin, "Content-Type": type },
        ...(method === "POST" ? { body: "{}" } : {}),
      }),
      service.env,
    );
  expect((await request("POST", "https://other.test")).status).toBe(403);
  expect((await request("POST", "")).status).toBe(403);
  expect((await request("GET")).status).toBe(405);
  expect((await request("POST", undefined, "text/plain")).status).toBe(415);
  expect((await request("POST", undefined, undefined, "/other")).status).toBe(
    404,
  );
  const preflight = await request("OPTIONS");
  expect(preflight.status).toBe(204);
  expect(preflight.headers.get("Access-Control-Allow-Origin")).toBe(
    new URL(publicSite).origin,
  );
  expect(service.requests).toHaveLength(0);
});

test("malformed requests consume client limits but rejected clients leave the shared bucket unchanged", async ({
  service,
}) => {
  const malformed = () =>
    service.handler(
      new Request("https://service.test/submit", {
        method: "POST",
        headers: {
          Origin: new URL(publicSite).origin,
          "Content-Type": "application/json",
          "CF-Connecting-IP": "192.0.2.1",
        },
        body: "{",
      }),
      service.env,
    );
  for (let i = 0; i < 30; i++) expect((await malformed()).status).toBe(400);
  for (let i = 0; i < 3; i++) expect((await malformed()).status).toBe(429);
  const day = Math.floor(Date.now() / 86_400_000);
  const sharedLimit = await Promise.resolve(
    service.env.DB.prepare("SELECT count FROM limits WHERE key=?")
      .bind(`requests:${day}`)
      .first(),
  );
  expect(sharedLimit).toEqual({ count: 30 });
  const response = await service.handler(
    new Request("https://service.test/submit", {
      method: "POST",
      headers: {
        Origin: new URL(publicSite).origin,
        "Content-Type": "application/json",
        "CF-Connecting-IP": "192.0.2.2",
      },
      body: JSON.stringify({ version: 1, site: publicSite, items: [item()] }),
    }),
    service.env,
  );
  expect(response.status).toBe(200);
  expect((await outcomes(response))[0].status).toBe("confirmed");
});

test("invalid IDs and missing-page feedback have actionable correlated outcomes", async ({
  service,
}) => {
  const feedback = item();
  const result = await outcomes(
    await service.send([
      { ...feedback, id: undefined },
      { ...feedback, id: "x".repeat(81) },
      { ...feedback, target: { ...feedback.target, page: "/missing/" } },
    ]),
  );
  expect(result.map((outcome) => outcome.inputIndex)).toEqual([0, 1, 2]);
  expect(result.every((outcome) => outcome.status === "invalid")).toBe(true);
  expect(result[2].reason).toBe("unknown-page");
  expect(result[2].message).toContain("download a backup");
  expect(result[2].message).not.toContain("edit it");
  expect(service.requests).toHaveLength(0);
});

test("calendar-invalid timestamps are refused and valid leap days are accepted", async ({
  service,
}) => {
  const result = await outcomes(
    await service.send([
      { ...item("invalid-date"), created: "2026-02-30T12:00:00.000Z" },
      { ...item("invalid-updated"), updated: "2026-02-29T12:00:00.000Z" },
      { ...item("valid-leap"), created: "2024-02-29T12:00:00.000Z" },
    ]),
  );
  expect(result.map((outcome) => outcome.status)).toEqual([
    "invalid",
    "invalid",
    "confirmed",
  ]);
});

test("fingerprints use the same JSON representation before and after transport", async () => {
  const { fingerprint, canonical } =
    await import("../src/review/submission-contract");
  const feedback = { ...item(), updated: undefined };
  expect(await fingerprint(publicSite, feedback)).toBe(
    await fingerprint(publicSite, JSON.parse(JSON.stringify(feedback))),
  );
  expect(
    canonical({
      optional: undefined,
      nested: [undefined, { field: undefined }],
    }),
  ).toBe(canonical({ nested: [null, {}] }));
});

test("oversized formatting is invalid before a claim or GitHub attempt", async ({
  service,
}) => {
  const feedback = item();
  feedback.target.text = "&".repeat(4000);
  feedback.why = "&".repeat(4000);
  feedback.change = {
    kind: "wording",
    current: "&".repeat(4000),
    proposed: "<".repeat(3999),
  };
  expect(
    new TextEncoder().encode(JSON.stringify(feedback)).byteLength,
  ).toBeLessThan(20_000);
  const result = await outcomes(await service.send([feedback]));
  expect(result[0].status).toBe("invalid");
  expect(result[0].message).toContain("Formatted feedback is too long");
  expect(service.requests).toHaveLength(0);
  const submissionCount = await Promise.resolve(
    service.env.DB.prepare("SELECT count(*) AS count FROM submissions").first(),
  );
  expect(submissionCount).toEqual({ count: 0 });
});

test("refused creation allowance resets the claim for safe later delivery", async ({
  service,
}) => {
  const day = Math.floor(Date.now() / 86_400_000);
  await service.env.DB.prepare(
    "INSERT INTO limits(key,count,expires) VALUES (?,100,?)",
  )
    .bind(`create:${day}`, (day + 1) * 86_400_000)
    .run();
  expect((await outcomes(await service.send([item()])))[0].status).toBe(
    "retryable",
  );
  const claimState = await Promise.resolve(
    service.env.DB.prepare("SELECT state,claim FROM submissions WHERE id=?")
      .bind(item().id)
      .first(),
  );
  expect(claimState).toEqual({ state: "ready", claim: null });
  expect(service.requests).toHaveLength(0);
  await service.env.DB.prepare("DELETE FROM limits WHERE key=?")
    .bind(`create:${day}`)
    .run();
  expect((await outcomes(await service.send([item()])))[0].status).toBe(
    "confirmed",
  );
});

test("unknown tag names always classify as an Area", async () => {
  const { kindForTag } = await import("../src/review/elements");
  for (const tag of ["constructor", "__proto__", "toString", "custom-element"])
    expect(kindForTag(tag)).toBe("Area");
  expect(kindForTag("p")).toBe("Paragraph");
});

test("the shared formatter neutralizes imported metadata and refuses unsafe markers", async () => {
  const { feedbackIssue } = await import("../src/review/issue");
  const { fingerprint } = await import("../src/review/submission-contract");
  const feedback = item();
  const site =
    "https://example.test/@team/[click](javascript:alert(1))<img src=x>/";
  const issue = feedbackIssue(
    feedback,
    site,
    await fingerprint(site, feedback),
  );
  expect(issue.body).toContain("Page: https\\:");
  expect(issue.body).toContain("@\u200bteam");
  expect(issue.body).toContain("&lt;img");
  expect(() =>
    feedbackIssue({ ...feedback, id: "--><img src=x>" }, site, "a".repeat(64)),
  ).toThrow("Invalid feedback marker");
  expect(() => feedbackIssue(feedback, site, "--><img src=x>")).toThrow(
    "Invalid feedback marker",
  );
});

test("receipts merge monotonically and retiring an ID protects stale tab edits", async () => {
  const { createStore } = await import("../src/review/store");
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const data = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    },
  });
  try {
    const first = createStore();
    const second = createStore();
    const feedback = item();
    first.save(feedback);
    const receipt = {
      id: feedback.id,
      fingerprint: "hash",
      status: "confirmed" as const,
      issue: {
        number: 2000,
        url: `https://github.com/${repository}/issues/2000`,
      },
      message: "Published",
      label: "Test",
    };
    first.setReceipts([receipt]);
    second.setReceipts([{ ...receipt, status: "pending", issue: undefined }]);
    second.setReceipts([]);
    expect(first.receipts()).toEqual([receipt]);
    expect(first.saveAsNew(feedback.id)).toBe(true);
    expect(first.saveAsNew(feedback.id)).toBe(false);
    second.save({ ...feedback, why: "An old editor saved this." });
    expect(first.items()).toHaveLength(2);
    expect(first.items().every((draft) => draft.id !== feedback.id)).toBe(true);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("manual import uses the backup reviewer fallback and shared labels", async () => {
  const directory = mkdtempSync(join(tmpdir(), "found42-backup-test-"));
  try {
    const file = join(directory, "backup.md");
    const items = [
      { ...item("missing-reviewer"), reviewer: undefined },
      { ...item("empty-reviewer"), reviewer: "" },
    ];
    writeFileSync(
      file,
      "```json\n" +
        JSON.stringify({
          format: "found42-review-feedback",
          version: 1,
          site: publicSite,
          reviewer: "Backup reviewer",
          items,
        }) +
        "\n```\n",
    );
    const output = execFileSync(
      process.execPath,
      ["scripts/feedback-to-issues.mjs", file],
      { encoding: "utf8", timeout: 15_000 },
    );
    expect(output.match(/Reported by \*\*Backup reviewer\*\*/g)).toHaveLength(
      2,
    );
    expect(output.match(/labels: needs-triage, review-feedback/g)).toHaveLength(
      2,
    );
    expect(output).not.toContain("**undefined**");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("deployment reports a missing receipt database before any remote command", async () => {
  const { mkdirSync } = await import("node:fs");
  const { resolve } = await import("node:path");
  const directory = mkdtempSync(join(tmpdir(), "found42-deploy-test-"));
  const script = resolve("scripts/deploy-review-service.mjs");
  try {
    mkdirSync(join(directory, "worker"));
    for (const config of [{}, { d1_databases: [] }]) {
      writeFileSync(
        join(directory, "worker/wrangler.jsonc"),
        JSON.stringify(config),
      );
      let failure = "";
      try {
        execFileSync(process.execPath, [script], {
          cwd: directory,
          timeout: 10_000,
          stdio: "pipe",
          env: {
            ...process.env,
            CLOUDFLARE_ACCOUNT_ID: "test-account",
            WORKERS_FREE_VERIFIED_ACCOUNT: "test-account",
            WORKERS_FREE_VERIFIED_DATE: new Date().toISOString().slice(0, 10),
          },
        });
      } catch (error) {
        failure = (error as { stderr: Buffer }).stderr.toString();
      }
      expect(failure).toContain(
        "Configure the free D1 receipt database before deployment.",
      );
      expect(failure).not.toContain("TypeError");
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

async function screenshotPng(title = "Review target") {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 320, height: 240 },
    });
    await page.setContent(`<h1>${title}</h1><p>Surrounding page context</p>`);
    return await page.screenshot({ type: "png" });
  } finally {
    await browser.close();
  }
}
async function upload(service: Service, png: Buffer, digest?: string) {
  const hash =
    digest ??
    (await import("node:crypto"))
      .createHash("sha256")
      .update(png)
      .digest("hex");
  const response = await service.handler(
    new Request(`https://service.test/screenshots/${hash}`, {
      method: "POST",
      headers: {
        Origin: new URL(publicSite).origin,
        "Content-Type": "image/png",
      },
      body: new Uint8Array(png),
    }),
    service.env,
  );
  return { response, hash };
}

test("screenshot evidence is public, durable and reused by issue retries", async ({
  service,
}) => {
  const png = await screenshotPng();
  const { response, hash } = await upload(service, png);
  expect(response.status).toBe(200);
  expect((await upload(service, png)).response.status).toBe(200);
  const publicResponse = await service.handler(
    new Request(`https://service.test/screenshots/${hash}`),
    service.env,
  );
  expect(publicResponse.headers.get("Content-Type")).toBe("image/png");
  expect(Buffer.from(await publicResponse.arrayBuffer())).toEqual(png);
  const feedback = {
    ...item(),
    screenshot: {
      sha256: hash,
      width: 320,
      height: 240,
      source: "file",
      captured: item().created,
    },
  };
  const first = await outcomes(await service.send([feedback]));
  const second = await outcomes(await service.send([feedback]));
  expect(first[0].status).toBe("confirmed");
  expect(second).toEqual(first);
  expect(service.requests.filter((request) => request.body)).toHaveLength(1);
  const body = String(service.requests[0].body!.body);
  expect(body).toContain(`https://service.test/screenshots/${hash}`);
  expect(body).toContain("Screenshot of Heading");
  expect(body).toContain("Executives selected");
});

test("invalid, corrupt, oversized and interrupted screenshot uploads never create issues", async ({
  service,
}) => {
  const png = await screenshotPng();
  const { createHash } = await import("node:crypto");
  for (const [body, status] of [
    [Buffer.from("<svg></svg>"), 422],
    [png.subarray(0, png.length - 5), 422],
    [Buffer.alloc(512 * 1024 + 1), 413],
  ] as const) {
    expect((await upload(service, body)).response.status).toBe(status);
  }
  expect((await upload(service, png, "a".repeat(64))).response.status).toBe(
    422,
  );
  const interrupted = new Request(
    `https://service.test/screenshots/${createHash("sha256").update(png).digest("hex")}`,
    {
      method: "POST",
      headers: {
        Origin: new URL(publicSite).origin,
        "Content-Type": "image/png",
      },
      body: new ReadableStream({
        start(controller) {
          controller.error(new Error("Interrupted"));
        },
      }),
      duplex: "half",
    } as RequestInit,
  );
  expect((await service.handler(interrupted, service.env)).status).toBe(400);
  const feedback = {
    ...item(),
    screenshot: {
      sha256: "b".repeat(64),
      width: 320,
      height: 240,
      source: "file",
      captured: item().created,
    },
  };
  expect((await outcomes(await service.send([feedback])))[0]).toMatchObject({
    status: "retryable",
    reason: "screenshot",
  });
  expect(service.requests).toHaveLength(0);
  expect((await outcomes(await service.send([item()])))[0].status).toBe(
    "confirmed",
  );
});

test("screenshot quota is atomic and known images remain reusable when storage is full", async ({
  service,
}) => {
  const png = await screenshotPng();
  const first = await upload(service, png);
  expect(first.response.status).toBe(200);
  await service.env.DB.prepare(
    "UPDATE screenshot_storage SET bytes=134217728 WHERE id=1",
  ).run();
  expect((await upload(service, png)).response.status).toBe(200);
  const other = Buffer.from(png);
  // A second actual page capture has different content.
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 320, height: 240 },
    });
    await page.setContent("<h1>Different screenshot</h1>");
    const next = await page.screenshot();
    const responses = await Promise.all([
      upload(service, next),
      upload(service, next),
    ]);
    expect(responses.map((result) => result.response.status)).toEqual([
      507, 507,
    ]);
  } finally {
    await browser.close();
  }
  expect((await upload(service, other)).response.status).toBe(200);
  const publicImage = await service.handler(
    new Request(`https://service.test/screenshots/${first.hash}`),
    { ...service.env, ENABLED: "false" },
  );
  expect(publicImage.status).toBe(200);
});

test("screenshot uploads enforce origin and free request limits", async ({
  service,
}) => {
  const png = await screenshotPng();
  const wrongOrigin = new Request(
    `https://service.test/screenshots/${"a".repeat(64)}`,
    {
      method: "POST",
      headers: { Origin: "https://other.test", "Content-Type": "image/png" },
      body: new Uint8Array(png),
    },
  );
  expect((await service.handler(wrongOrigin, service.env)).status).toBe(403);
  const day = Math.floor(Date.now() / 86400000);
  await service.env.DB.prepare("INSERT INTO limits VALUES (?,1000,?)")
    .bind(`requests:${day}`, (day + 1) * 86400000)
    .run();
  expect((await upload(service, png)).response.status).toBe(429);
});

test("screenshot formatting overflow is editable before any durable claim", async ({
  service,
}) => {
  const { feedbackIssue } = await import("../src/review/issue");
  const png = await screenshotPng();
  const { hash } = await upload(service, png);
  const feedback = item();
  feedback.screenshot = {
    sha256: hash,
    width: 320,
    height: 240,
    source: "file",
    captured: feedback.created,
  };
  let low = 0,
    high = 4000;
  const setLength = (n: number) => {
    feedback.target.text = "&".repeat(n);
    feedback.why = "&".repeat(n);
    feedback.change = {
      kind: "wording",
      current: "&".repeat(n),
      proposed: "<".repeat(n),
    };
  };
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    setLength(mid);
    try {
      feedbackIssue(feedback, publicSite, "a".repeat(64));
      low = mid;
    } catch {
      high = mid - 1;
    }
  }
  setLength(low);
  expect(() =>
    feedbackIssue(feedback, publicSite, "a".repeat(64)),
  ).not.toThrow();
  expect(() =>
    feedbackIssue(
      feedback,
      publicSite,
      "a".repeat(64),
      `https://service.test/screenshots/${hash}`,
    ),
  ).toThrow();
  expect((await outcomes(await service.send([feedback])))[0]).toMatchObject({
    status: "invalid",
    message:
      "Formatted feedback is too long. Your draft is saved; shorten it before sending again.",
  });
  expect(
    await Promise.resolve(
      service.env.DB.prepare(
        "SELECT count(*) AS count FROM submissions",
      ).first(),
    ),
  ).toEqual({ count: 0 });
  expect(service.requests).toHaveLength(0);
  setLength(100);
  expect((await outcomes(await service.send([feedback])))[0].status).toBe(
    "confirmed",
  );
});

test("new image byte allowances refuse unique uploads while known digests remain reusable", async ({
  service,
}) => {
  const png = await screenshotPng();
  const { hash } = await upload(service, png);
  await service.env.DB.prepare(
    "UPDATE limits SET count=? WHERE key LIKE 'image-client:%'",
  )
    .bind(2 * 1024 * 1024)
    .run();
  const next = await screenshotPng("Another target");
  expect((await upload(service, next)).response.status).toBe(429);
  expect((await upload(service, png)).response.status).toBe(200);
  await service.env.DB.prepare(
    "UPDATE limits SET count=0 WHERE key LIKE 'image-client:%'",
  ).run();
  await service.env.DB.prepare(
    "UPDATE limits SET count=? WHERE key LIKE 'image-bytes:%'",
  )
    .bind(8 * 1024 * 1024)
    .run();
  expect((await upload(service, next)).response.status).toBe(429);
  expect((await upload(service, png)).response.status).toBe(200);
  expect(
    await service.env.DB.prepare("SELECT sha256 FROM screenshots").all(),
  ).toMatchObject({ results: [{ sha256: hash }] });
});

test("orphan uploads expire while ambiguous issue evidence is retained", async ({
  service,
}) => {
  const png = await screenshotPng();
  const first = await upload(service, png);
  const next = await screenshotPng("Retained target");
  const second = await upload(service, next);
  service.github = async () => new Response("Uncertain", { status: 502 });
  const feedback = item();
  feedback.screenshot = {
    sha256: second.hash,
    width: 320,
    height: 240,
    source: "file",
    captured: feedback.created,
  };
  expect((await outcomes(await service.send([feedback])))[0].status).toBe(
    "pending",
  );
  await service.env.DB.prepare("UPDATE screenshots SET uploaded=?")
    .bind(Date.now() - 86_400_001)
    .run();
  expect((await upload(service, next)).response.status).toBe(200);
  expect(
    (
      await service.handler(
        new Request(`https://service.test/screenshots/${first.hash}`),
        service.env,
      )
    ).status,
  ).toBe(404);
  expect(
    (
      await service.handler(
        new Request(`https://service.test/screenshots/${second.hash}`),
        service.env,
      )
    ).status,
  ).toBe(200);
  expect((await upload(service, png)).response.status).toBe(200);
});

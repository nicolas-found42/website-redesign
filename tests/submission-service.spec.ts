import { test as base, expect } from "@playwright/test";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { readFileSync } from "node:fs";
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
const outcomes = async (response: Response) =>
  ((await response.json()) as { outcomes: Outcome[] }).outcomes;

test("the service returns a durable receipt and creates one safe issue per item", async ({
  service,
}) => {
  const feedback = item();
  feedback.change = {
    kind: "wording",
    current: "Old words",
    proposed:
      "@nicolas-found42 <img src=x> [click](javascript:alert(1))\n```\nNew words",
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
  expect(issue.body).toContain("@\u200bnicolas-found42 &lt;img src=x&gt;");
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

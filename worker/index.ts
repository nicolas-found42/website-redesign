import { readScreenshot, uploadScreenshot } from "./screenshots";
import type { D1Database } from "@cloudflare/workers-types";
import {
  fingerprint,
  maxItemBytes,
  maxRequestBytes,
  publicSite,
  pages,
  repository,
  validEnvelope,
  validIssue,
  validItem,
  type Outcome,
} from "../src/review/submission-contract";
import type { FeedbackItem } from "../src/review/model";
import { feedbackIssue, issueMarker } from "../src/review/issue";

export interface Env {
  DB: D1Database;
  GITHUB_TOKEN: string;
  RATE_SALT: string;
  ENABLED: string;
}
interface Receipt {
  id: string;
  fingerprint: string;
  state: "ready" | "creating" | "confirmed";
  claim: string | null;
  started: string;
  issue_number: number | null;
  issue_url: string | null;
}
const messages = {
  pending:
    "Delivery is still being checked. Your draft is saved. Retry later to check for its issue. If it remains pending, contact the team for recovery; an uncertain delivery will not be sent twice.",
  limited:
    "Sending is temporarily limited. Your drafts are saved. Please retry later.",
  unavailable:
    "The submission service is temporarily unavailable. Your drafts are saved. Please retry later.",
};
const bytes = (s: string) => new TextEncoder().encode(s).byteLength;
const origin = new URL(publicSite).origin;

/** Reads incrementally; Content-Length is not trusted to enforce the limit. */
async function boundedBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxRequestBytes) {
      await reader.cancel();
      throw new Error("size");
    }
    chunks.push(value);
  }
  const all = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    all.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(all);
}

async function allowance(
  env: Env,
  key: string,
  maximum: number,
  expires: number,
) {
  const result = await env.DB.prepare(
    `INSERT INTO limits(key,count,expires) VALUES (?,1,?)
    ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count`,
  )
    .bind(key, expires, maximum)
    .first();
  return !!result;
}
async function clientKey(ip: string, salt: string, bucket: number) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(salt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return Array.from(
    new Uint8Array(
      await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(`${bucket}:${ip}`),
      ),
    ),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}

/** HTTP and GitHub are the external seams; D1 remains the real durable store. */
export function createSubmissionHandler(githubFetch: typeof fetch = fetch) {
  async function github(env: Env, path: string, init: RequestInit = {}) {
    return githubFetch(`https://api.github.com/repos/${repository}/${path}`, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "found42-review-submission",
        "Content-Type": "application/json",
      },
    });
  }
  async function confirm(
    env: Env,
    receipt: Receipt,
    issue: NonNullable<Outcome["issue"]>,
  ) {
    await env.DB.prepare(
      "UPDATE submissions SET state='confirmed', issue_number=?, issue_url=? WHERE id=? AND fingerprint=?",
    )
      .bind(issue.number, issue.url, receipt.id, receipt.fingerprint)
      .run();
    return {
      id: receipt.id,
      fingerprint: receipt.fingerprint,
      status: "confirmed" as const,
      issue,
      message: "Published on GitHub.",
    };
  }
  async function reconcile(env: Env, receipt: Receipt): Promise<Outcome> {
    // List the repository directly, including closed issues, without relying
    // on GitHub's search index. Absence never authorizes another create.
    const since = new Date(Date.parse(receipt.started) - 60_000).toISOString();
    for (let page = 1; page <= 3; page++) {
      const response = await github(
        env,
        `issues?state=all&sort=created&direction=asc&since=${encodeURIComponent(since)}&per_page=100&page=${page}`,
      );
      if (!response.ok) break;
      const issues: unknown = await response.json();
      if (!Array.isArray(issues)) break;
      for (const candidate of issues) {
        const issue = candidate as {
          number?: unknown;
          html_url?: unknown;
          body?: unknown;
          pull_request?: unknown;
        };
        const link = { number: issue.number, url: issue.html_url };
        if (
          !issue.pull_request &&
          typeof issue.body === "string" &&
          issue.body.includes(issueMarker(receipt.id, receipt.fingerprint)) &&
          validIssue(link)
        )
          return confirm(env, receipt, link);
      }
      if (issues.length < 100) break;
    }
    return {
      id: receipt.id,
      fingerprint: receipt.fingerprint,
      status: "pending",
      message: messages.pending,
    };
  }
  async function deliver(
    env: Env,
    item: FeedbackItem,
    hash: string,
    imageOrigin: string,
  ): Promise<Outcome> {
    const result = (status: Outcome["status"], message: string): Outcome => ({
      id: item.id,
      fingerprint: hash,
      status,
      message,
    });
    if (item.screenshot) {
      const image = await env.DB.prepare(
        "SELECT width,height FROM screenshots WHERE sha256=?",
      )
        .bind(item.screenshot.sha256)
        .first<{ width: number; height: number }>();
      if (
        !image ||
        image.width !== item.screenshot.width ||
        image.height !== item.screenshot.height
      )
        return {
          ...result(
            "retryable",
            "Screenshot has not been delivered. Your written draft is saved. Retry or send text without the image.",
          ),
          reason: "screenshot",
        };
    }
    const started = new Date().toISOString();
    await env.DB.prepare(
      "INSERT INTO submissions(id,fingerprint,state,started) VALUES (?,?,'ready',?) ON CONFLICT(id) DO NOTHING",
    )
      .bind(item.id, hash, started)
      .run();
    const receipt = await env.DB.prepare("SELECT * FROM submissions WHERE id=?")
      .bind(item.id)
      .first<Receipt>();
    if (!receipt) return result("retryable", messages.unavailable);
    if (receipt.fingerprint !== hash)
      return {
        ...result(
          "invalid",
          "This feedback ID was already submitted with different content. Keep this draft and save it as new feedback to publish the revision.",
        ),
        reason: "content-conflict",
      };
    if (receipt.state === "confirmed") return resultWithIssue(receipt);
    if (receipt.state === "creating") return reconcile(env, receipt);
    const claim = crypto.randomUUID();
    const locked = await env.DB.prepare(
      "UPDATE submissions SET state='creating', claim=?, started=? WHERE id=? AND fingerprint=? AND state='ready' RETURNING id",
    )
      .bind(claim, started, item.id, hash)
      .first();
    if (!locked) return result("pending", messages.pending);
    // Once locked, any crash is ambiguous and requires reconciliation. Even a
    // failure writing the receipt after GitHub success cannot permit a resend.
    const day = Math.floor(Date.now() / 86_400_000);
    if (!(await allowance(env, `create:${day}`, 100, (day + 1) * 86_400_000))) {
      await env.DB.prepare(
        "UPDATE submissions SET state='ready', claim=NULL WHERE id=? AND claim=?",
      )
        .bind(item.id, claim)
        .run();
      return result("retryable", messages.limited);
    }
    const response = await github(env, "issues", {
      method: "POST",
      body: JSON.stringify(
        feedbackIssue(
          item,
          publicSite,
          hash,
          item.screenshot
            ? `${imageOrigin}/screenshots/${item.screenshot.sha256}`
            : undefined,
        ),
      ),
    });
    if (response.status === 201) {
      const data = (await response.json()) as {
        number?: unknown;
        html_url?: unknown;
      };
      const issue = { number: data.number, url: data.html_url };
      if (validIssue(issue)) return confirm(env, receipt, issue);
    }
    // Only explicit rejections make creation safely retryable. Network errors,
    // 5xx, unexpected successes and malformed success bodies stay uncertain.
    if ([400, 401, 403, 404, 422, 429].includes(response.status)) {
      await env.DB.prepare(
        "UPDATE submissions SET state='ready', claim=NULL WHERE id=? AND claim=?",
      )
        .bind(item.id, claim)
        .run();
      return result(
        "retryable",
        [403, 429].includes(response.status)
          ? messages.limited
          : "GitHub could not accept this feedback. Your draft is saved. Please retry later or contact the team.",
      );
    }
    return result("pending", messages.pending);
  }
  return async (request: Request, env: Env): Promise<Response> => {
    const headers = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store",
      Vary: "Origin",
      "Content-Type": "application/json",
    };
    const reply = (body: unknown, status = 200) =>
      new Response(JSON.stringify(body), { status, headers });
    const url = new URL(request.url);
    const image = /^\/screenshots\/([a-f0-9]{64})$/.exec(url.pathname);
    if (image && request.method === "GET") {
      try {
        return await readScreenshot(env.DB, image[1]);
      } catch {
        return reply(
          { message: "Image service temporarily unavailable." },
          503,
        );
      }
    }
    if (url.pathname !== "/submit" && !image)
      return reply({ message: "Not found." }, 404);
    if (request.headers.get("Origin") !== origin)
      return reply(
        {
          message:
            "This service accepts feedback from the website review tool.",
        },
        403,
      );
    if (request.method === "OPTIONS")
      return new Response(null, { status: 204, headers });
    if (request.method !== "POST")
      return reply(
        { message: "Use the website review tool to send feedback." },
        405,
      );
    if (env.ENABLED !== "true" || !env.GITHUB_TOKEN || !env.RATE_SALT)
      return reply({ message: messages.unavailable }, 503);
    try {
      const now = Date.now();
      const day = Math.floor(now / 86_400_000);
      const hour = Math.floor(now / 3_600_000);
      await env.DB.prepare(
        "DELETE FROM limits WHERE key IN (SELECT key FROM limits WHERE expires < ? LIMIT 100)",
      )
        .bind(now)
        .run();
      if (
        !(await allowance(
          env,
          `client:${await clientKey(request.headers.get("CF-Connecting-IP") ?? "unknown", env.RATE_SALT, hour)}`,
          30,
          (hour + 1) * 3_600_000,
        )) ||
        !(await allowance(env, `requests:${day}`, 1000, (day + 1) * 86_400_000))
      )
        return reply({ message: messages.limited }, 429);
    } catch {
      return reply({ message: messages.unavailable }, 503);
    }
    if (image) {
      try {
        return await uploadScreenshot(env.DB, request, image[1], reply);
      } catch {
        return reply(
          {
            message:
              "Screenshot service temporarily unavailable. Your draft is saved. Retry or send text without it.",
          },
          503,
        );
      }
    }
    if (
      request.headers.get("Content-Type")?.split(";")[0] !== "application/json"
    )
      return reply({ message: "Feedback must be JSON." }, 415);
    let payload: unknown;
    try {
      payload = JSON.parse(await boundedBody(request));
    } catch {
      return reply(
        {
          message:
            "This request is unreadable or too large. Your drafts are saved.",
        },
        400,
      );
    }
    if (!validEnvelope(payload))
      return reply(
        {
          message:
            "This request is not valid website feedback. Your drafts are saved.",
        },
        400,
      );
    const outcomes: Outcome[] = [];
    try {
      for (const [inputIndex, value] of payload.items.entries()) {
        const id =
          value &&
          typeof value === "object" &&
          "id" in value &&
          typeof value.id === "string"
            ? value.id.slice(0, 80)
            : "unknown";
        if (!validItem(value) || bytes(JSON.stringify(value)) > maxItemBytes) {
          const unknownPage =
            value &&
            typeof value === "object" &&
            "target" in value &&
            value.target &&
            typeof value.target === "object" &&
            "page" in value.target &&
            typeof value.target.page === "string" &&
            !pages.includes(value.target.page);
          outcomes.push({
            id,
            inputIndex,
            fingerprint: "",
            status: "invalid",
            ...(unknownPage ? { reason: "unknown-page" as const } : {}),
            message: unknownPage
              ? "This feedback points to a page outside the seven supported website pages. Your draft is saved; download a backup and contact the team to report a missing page."
              : "This feedback is incomplete or too long. Your draft is saved; edit it before sending again.",
          });
          continue;
        }
        const hash = await fingerprint(payload.site, value);
        try {
          feedbackIssue(value, publicSite, hash);
        } catch {
          outcomes.push({
            id,
            inputIndex,
            fingerprint: hash,
            status: "invalid",
            message:
              "Formatted feedback is too long. Your draft is saved; shorten it before sending again.",
          });
          continue;
        }
        try {
          outcomes.push(await deliver(env, value, hash, url.origin));
        } catch {
          outcomes.push({
            id,
            fingerprint: hash,
            status: "pending",
            message: messages.pending,
          });
        }
      }
      return reply({ outcomes });
    } catch {
      return reply({ message: messages.unavailable }, 503);
    }
  };
}
function resultWithIssue(receipt: Receipt): Outcome {
  const issue = { number: receipt.issue_number, url: receipt.issue_url };
  return validIssue(issue)
    ? {
        id: receipt.id,
        fingerprint: receipt.fingerprint,
        status: "confirmed",
        issue,
        message: "Published on GitHub.",
      }
    : {
        id: receipt.id,
        fingerprint: receipt.fingerprint,
        status: "pending",
        message: messages.pending,
      };
}
export default { fetch: createSubmissionHandler() };

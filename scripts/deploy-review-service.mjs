/** Deploy only after a fresh, explicit Workers Free verification. */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { parse } from "jsonc-parser";

const account = process.env.CLOUDFLARE_ACCOUNT_ID;
const today = new Date().toISOString().slice(0, 10);
if (
  !account ||
  process.env.WORKERS_FREE_VERIFIED_ACCOUNT !== account ||
  process.env.WORKERS_FREE_VERIFIED_DATE !== today
) {
  throw new Error(
    "Verify Workers Free in the dashboard today, then set CLOUDFLARE_ACCOUNT_ID, WORKERS_FREE_VERIFIED_ACCOUNT and WORKERS_FREE_VERIFIED_DATE. No deployment was attempted.",
  );
}
const configErrors = [];
const config = parse(
  readFileSync("worker/wrangler.jsonc", "utf8"),
  configErrors,
  {
    allowTrailingComma: true,
  },
);
if (configErrors.length) throw new Error("Invalid Worker configuration.");
if (
  config.d1_databases[0].database_id === "00000000-0000-0000-0000-000000000000"
)
  throw new Error("Configure the free D1 receipt database before deployment.");
const wrangler = (...args) =>
  execFileSync(
    "npx",
    ["wrangler", ...args, "--config", "worker/wrangler.jsonc"],
    { encoding: "utf8", stdio: ["inherit", "pipe", "pipe"] },
  );
// This lists secret names only; it never reads or prints credential values.
const secrets = JSON.parse(wrangler("secret", "list"));
if (
  !["GITHUB_TOKEN", "RATE_SALT"].every((name) =>
    secrets.some((secret) => secret.name === name),
  )
)
  throw new Error(
    "Configure GITHUB_TOKEN and RATE_SALT as Worker secrets first.",
  );
console.log(
  wrangler("d1", "migrations", "apply", "found42-review-receipts", "--remote"),
);
console.log(wrangler("deploy", "--var", "ENABLED:true"));

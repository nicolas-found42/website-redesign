# Hosted review submission

Issue [#108](https://github.com/nicolas-found42/website-redesign/issues/108)
adds public, anonymous submission from the existing review tool. The site
continues to deploy to GitHub Pages; only delivery and durable receipts run on
Cloudflare. The owner's computer is not part of production delivery.

## Hosting and zero-spend setup

Use **Workers Free** and D1 in the same Free account. Verify the account's
**Workers plans → Free → Current plan** before creating the database or
publishing a Worker, and again before each deployment. Never choose Upgrade,
enable a paid plan, purchase a domain, or add paid services. Allowances are
shared with other applications on the account.

On September 30, 2026, official documentation lists 100,000 Worker requests/day,
10 ms CPU/invocation, 5 million D1 rows read/day, 100,000 rows written/day,
5 GB total account storage, and 500 MB per Free database. Free limits stop
requests/queries rather than billing overages. Recheck
[Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/),
[D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), and
[D1 limits](https://developers.cloudflare.com/d1/platform/limits/) at deployment.
A future account upgrade would change billing behavior; this project never
performs an upgrade. Third-party pricing is not a permanent guarantee.

1. Use `npx wrangler login` to renew the owner's existing login, or configure an
   account-restricted Cloudflare API token. Wrangler deployment needs Workers
   Scripts Edit, D1 Edit and Account Settings Read. Billing Read is needed only
   if verifying subscriptions through the API instead of the dashboard.
2. Set `CLOUDFLARE_ACCOUNT_ID` to the account verified as Free. Create
   `found42-review-receipts` using `npx wrangler d1 create
found42-review-receipts --config worker/wrangler.jsonc`. Put its database ID
   in `worker/wrangler.jsonc`. This ID and the account ID are public identifiers.
3. Deploy the disabled service with `npx wrangler deploy --config
worker/wrangler.jsonc`. The checked-in configuration disables delivery.
4. Create a fine-grained GitHub token for **only**
   `nicolas-found42/website-redesign`, with **Issues: Read and write** and the
   automatically required Metadata read permission. No Contents, workflow,
   organization or other repository access is needed. Choose an expiry and
   rotate the secret before expiry.
5. Store the token with `npx wrangler secret put GITHUB_TOKEN --config
worker/wrangler.jsonc` through its private prompt/stdin. Generate an unrelated
   random secret for `RATE_SALT` and store it the same way. Never commit either
   secret, put it in a Vite variable, print it, or copy it into issue records.
6. Provision the labels `needs-triage` and `review-feedback` with `gh label
create` if absent. Runtime requests cannot set labels or assignees. The
   service does not need label-management calls during ordinary submission.
7. Export `WORKERS_FREE_VERIFIED_ACCOUNT` equal to `CLOUDFLARE_ACCOUNT_ID`, and
   `WORKERS_FREE_VERIFIED_DATE` as today's UTC date after the dashboard check.
   Run `npm run worker:deploy`. The guard requires this fresh verification,
   a configured D1 ID and both secret names, then applies migrations and enables
   the service. The verification variables record the human/dashboard check;
   they are not an automatic billing API check.
8. Set GitHub's repository Actions variable `VITE_REVIEW_SUBMISSION_URL` to
   `https://found42-review-submission.<account-subdomain>.workers.dev/submit`.
   This is the only browser configuration. The main-branch Pages build reads
   it; review tools continue to load only on review links. Rebuild/redeploy Pages
   after changing it. Local testing can use `.env.local` with this public URL,
   but the live service accepts only the published website's site context.

The Worker uses the provider's free `workers.dev` address and D1 only. It has
no paid add-ons, background queue, custom domain or local production server.
The browser retains drafts if configuration is absent or any provider rejects
sending. To stop delivery, deploy the checked-in disabled configuration, or
remove/revoke the GitHub secret. Deployments are explicit; CI validates the
service and never deploys it with credentials.

## Contract and protection

`POST /submit` accepts version 1, the exact published site URL, and at most
three feedback records. Bodies are streamed with a 64,000-byte cap; each
record has a 20,000-byte cap and field-specific text limits. The schema allows
only the site's seven page routes, existing element types, kinds, priorities,
and kind-specific fields. Additional repository, label, assignee or command
fields are refused. Invalid records receive separate invalid outcomes.

The service fixes the repository, issue labels and issue operation. An allowed
Origin is checked for browser use, but anyone can forge it: D1 limits also
protect anonymous requests. Limits are 30 requests/client/hour, 1,000 total
requests/day, and 100 issue-creation attempts/day. Limit increments and claims
are conditional SQL writes, so concurrent requests cannot bypass the caps.
Known rejected attempts still consume the conservative creation allowance.
Limit buckets expire; at most 100 expired buckets are removed per request.
Client keys are salted HMACs rotating hourly; raw IP addresses are not stored.
Receipts contain ID, content fingerprint, delivery state, timestamps and issue
links, without feedback text or client identity. Confirmed receipts are not
expired, because deleting them would break safe retries.

These limits reduce abuse without promising that anonymous access cannot be
abused. No normal reviewer login or CAPTCHA is required. Provider quota,
CPU or GitHub rate failures retain drafts and may delay delivery.

## Delivery and recovery

Each feedback ID binds permanently to the SHA-256 fingerprint of its full
submitted content and site. D1 first creates a ready record, then atomically
claims it as creating before any GitHub create request. A confirmed record
returns its stored receipt on retries. Changed content under a claimed ID is
invalid; it cannot overwrite or republish the original issue.

GitHub creation and D1 are separate systems. Network failures, unexpected
responses, and a failure saving GitHub's successful receipt keep the record
creating. Retry lists repository issues directly, including closed issues,
using the attempt timestamp and exact ID/fingerprint marker. It does not use
GitHub search or presume search indexing is immediate. Reconciliation reads
at most three pages of 100 issues per attempt. If the matching marker is not
found, delivery remains pending, with no new creation attempt. Only explicit
GitHub rejections permit the same record to become ready again.

For a persistently pending record, inspect the stored timestamp and marker
with repository issue-list requests and the GitHub UI. If found, restore its
confirmed receipt in D1. If not found, **do not automatically reset it**:
absence cannot prove an earlier GitHub request will never complete. Keep it
pending until a maintainer can establish the request was rejected or never
sent. Document that determination before manually making it ready again.
Never delete the receipt database or rebuild it empty to restore sending.
That destroys duplicate protection. Keep provider backups/Time Travel and
receipts when updating Worker code. A GitHub issue deleted or with its marker
removed may require manual recovery; the service will preserve the draft.

The browser submits an immutable snapshot in bounded chunks. Confirmations
must match its ID, fingerprint and the fixed repository issue URL before any
draft is removed. A revised draft stays saved under a fresh ID once its prior
version is confirmed. Saving an open edit of an already confirmed item also
gets a fresh ID. A conflict receipt offers **Save as new feedback** explicitly.
New drafts made during submission survive. Receipts persist across reloads,
and every unsent snapshot item receives an outcome even if delivery stops.

## Release verification

Routine tests use browser service stubs and a local Miniflare D1 database with
controlled GitHub responses. They never create live issues. Run lint,
typecheck, build, `npm run worker:check`, and Playwright with `--workers=4`.

After hosted secrets and storage are configured, perform one clearly named
**synthetic release check for #108** from the published review site context.
Submit one test item, inspect its public issue for every recorded field,
self-reported attribution, safe literal formatting, both labels and no
assignee. Repeat the same request and confirm the identical issue receipt
with no second issue. Close that test issue. Record its link, Worker address,
Free-plan verification date and the receipt evidence in the implementation PR.
This one live check is owner-approved release verification, not CI.

On September 30, 2026, the owner account's Workers plans page showed
**Free, $0, Current plan**. The receipt database was created and the disabled
Worker was deployed at
`https://found42-review-submission.nicolas-6d9.workers.dev`. Both server secrets
are configured, migrations are applied, delivery is enabled, and the repository
Actions variable points to its `/submit` endpoint. The live API check created
[synthetic issue #110](https://github.com/nicolas-found42/website-redesign/issues/110),
returned the identical receipt on retry, and preserved every feedback field,
literal formatting, attribution, importance, both labels and no assignee.
The test issue is closed. The production Pages UI still requires this PR's
merge and deployment; API verification does not claim that UI is deployed.

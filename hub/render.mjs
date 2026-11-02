/**
 * The hub index: a plain, neutral page that lists every version found in
 * `versions/`. It is static HTML with no scripts, so it works when scripts
 * fail and carries no design of its own that could favour one version.
 */
import { statusMeanings, statusNames } from "../scripts/versions.mjs";

export const repository = "nicolas-found42/website-redesign";
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export const issuesUrl = (slug) =>
  `https://github.com/${repository}/issues?q=${encodeURIComponent(
    `is:issue label:"version:${slug}"`,
  )}`;

function card(version, previews) {
  const { slug, title, summary, status, created, author, changesFacts } =
    version;
  const name = title === slug ? slug : `${title}`;
  const hasPreview = previews.has(slug);
  return `<li class="card" data-version="${escape(slug)}" data-status="${escape(status)}">
  <a class="shot" href="${escape(slug)}/" aria-label="Open ${escape(name)}">${
    hasPreview
      ? `<picture><source media="(max-width: 600px)" srcset="previews/${escape(slug)}-mobile.png"><img src="previews/${escape(slug)}.png" alt="Preview of the ${escape(name)} home page" width="640" height="400" loading="lazy"></picture>`
      : `<span class="no-shot">No preview yet</span>`
  }</a>
  <div class="body">
    <h3>${escape(name)}${version.baseline ? ' <span class="badge baseline" title="The comparison point every other version is measured against">Baseline</span>' : ""}</h3>
    <p class="meta"><code>${escape(slug)}</code> · <span class="badge status-${escape(status)}">${escape(statusNames[status])}</span> · ${escape(created)}${author ? ` · ${escape(author)}` : ""}</p>
    ${summary ? `<p>${escape(summary)}</p>` : ""}
    ${changesFacts ? `<p class="facts"><strong>Changes shared facts:</strong> ${escape(changesFacts)}</p>` : ""}
    <p class="links"><a class="primary" href="${escape(slug)}/">Open site</a> <a href="${escape(slug)}/?review">Review and give feedback</a> <a href="${escape(issuesUrl(slug))}">Feedback on GitHub</a></p>
  </div>
</li>`;
}

const css = `
:root{color-scheme:light dark;--bg:#fff;--fg:#1a1a1a;--muted:#5a5a5a;--line:#d8d8d8;--card:#f6f6f6;--accent:#1d4ed8}
@media (prefers-color-scheme:dark){:root{--bg:#161616;--fg:#eee;--muted:#a8a8a8;--line:#333;--card:#202020;--accent:#8ab4ff}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}
main{max-width:72rem;margin:0 auto;padding:24px 16px 64px}h1{font-size:1.6rem;margin:0 0 4px}h2{font-size:1.2rem;margin:32px 0 12px}
.lede{color:var(--muted);margin:0 0 8px;max-width:48rem}a{color:var(--accent)}
ul.grid{list-style:none;margin:0;padding:0;display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(min(100%,19rem),1fr))}
.card{background:var(--card);border:1px solid var(--line);border-radius:8px;overflow:hidden;display:flex;flex-direction:column}
.shot{display:block;aspect-ratio:8/5;background:var(--line)}.shot img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.no-shot{display:grid;place-items:center;height:100%;color:var(--muted)}
.body{padding:12px 16px 16px}.body h3{margin:0 0 4px;font-size:1.05rem}.body p{margin:6px 0}.meta{color:var(--muted);font-size:.875rem}
.badge{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:0 8px;font-size:.75rem}.baseline{border-color:var(--accent)}
.guide{border:1px solid var(--line);border-radius:8px;background:var(--card);padding:4px 16px 12px;margin:16px 0}.guide summary{font-weight:600;padding:8px 0}.guide h3{font-size:1rem;margin:12px 0 4px}.guide dl{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:4px 16px}.guide dt{font-weight:600}.guide dd{margin:0}.guide ul{margin:0;padding-left:20px}.guide li{margin:4px 0}.public{font-weight:600}
.links{display:flex;flex-wrap:wrap;gap:8px 16px}.links a{min-height:24px}.facts{font-size:.875rem}
details{margin-top:24px}summary{cursor:pointer;min-height:24px}
`;

export function renderHub(versions, { previews = new Set() } = {}) {
  const active = versions.filter((v) => v.status !== "archived");
  const archived = versions.filter((v) => v.status === "archived");
  const list = (items) =>
    `<ul class="grid">${items.map((v) => card(v, previews)).join("\n")}</ul>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Found42 website redesign hub</title>
<meta name="description" content="Every iteration of the Found42 website redesign, with its status, a preview, and links to review it.">
<style>${css}</style>
</head>
<body>
<main>
<h1>Found42 website redesign hub</h1>
<p class="lede">Each card is a complete version of the site. Open one to explore it, or use Review to leave feedback that is filed against that version.</p>
<details class="guide" open>
<summary>How this works</summary>
<ul>
<li><strong>Open site</strong> shows a version the way a visitor would see it. A dark bar at the top names the version and brings you back here.</li>
<li><strong>Review and give feedback</strong> opens the same site with a toolbar: choose the part you would change and say what and why. <span class="public">Your feedback and the name you type are posted publicly on GitHub, where anyone can read them, so leave out anything private.</span></li>
<li><strong>Feedback on GitHub</strong> lists what has been sent about that version. It stays empty until someone sends feedback.</li>
</ul>
<h3>What the labels mean</h3>
<dl>
<dt>Baseline</dt><dd>The site as it is today. Every other version is compared against it.</dd>
${Object.entries(statusNames)
  .map(
    ([key, label]) =>
      `<dt>${escape(label)}</dt><dd>${escape(statusMeanings[key])}</dd>`,
  )
  .join("\n")}
</dl>
</details>
<h2>Versions (${active.length})</h2>
${active.length ? list(active) : "<p>No active versions.</p>"}
${archived.length ? `<details><summary>Archived (${archived.length})</summary>${list(archived)}</details>` : ""}
</main>
</body>
</html>
`;
}

export const hubNotFound = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex, nofollow"><title>Page not found | Found42 redesign hub</title></head>
<body style="font:16px/1.5 system-ui,sans-serif;max-width:40rem;margin:48px auto;padding:0 16px"><h1>Page not found</h1><p>That page isn't part of any version here. The version may have been removed.</p><p><a href="/website-redesign/">Back to the hub</a></p></body></html>
`;

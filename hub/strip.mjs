/**
 * The strip every published version page carries: a way back to the hub and
 * the name of the version being viewed. The build injects it into each built
 * HTML file, so no version has to remember to include it, it works with
 * scripts off, and it disappears with the version's folder. It is deliberately
 * neutral (system font, dark bar) so it does not borrow any version's design.
 */
import { statusNames } from "../scripts/versions.mjs";

const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export const stripMarker = 'id="found42-hub-strip"';
export const hubHref = "/website-redesign/";

const css = `#found42-hub-strip{position:relative;z-index:2147482000;display:flex;flex-wrap:wrap;align-items:center;gap:4px 16px;margin:0;padding:6px 16px;min-height:32px;background:#1a1a1a;color:#f0f0f0;font:13px/1.4 system-ui,sans-serif;text-align:left}
#found42-hub-strip a{color:#9ec1ff;font-weight:600;text-decoration:underline;min-height:24px;display:inline-flex;align-items:center}
#found42-hub-strip a:focus-visible{outline:3px solid #fff;outline-offset:2px}
#found42-hub-strip code{font:12px ui-monospace,monospace;background:#333;border-radius:4px;padding:1px 5px}
@media print{#found42-hub-strip{display:none}}`;

export function hubStrip(version) {
  const { slug, title, status, baseline } = version;
  const name = title && title !== slug ? `${escape(title)} ` : "";
  return `<nav ${stripMarker} aria-label="Redesign hub"><style>${css}</style><a href="${hubHref}">← All versions</a><span>Viewing ${name}<code>${escape(slug)}</code>${baseline ? " · Baseline" : ""} · ${escape(statusNames[status] ?? status)}</span></nav>`;
}

/** Adds the strip right after `<body>`; running it twice changes nothing. */
export function injectStrip(html, version) {
  if (html.includes(stripMarker)) return html;
  return html.replace(/<body[^>]*>/i, (open) => `${open}${hubStrip(version)}`);
}

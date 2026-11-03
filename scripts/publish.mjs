/**
 * The publish contract: the one place that names where a version lives once it
 * is built, and where the hub links to it. The build, the hub and the tests
 * read these names instead of repeating them, so a change to the base path or
 * preview layout cannot drift between them.
 */
import { resolve } from "node:path";

/** The Pages project path every URL on the site sits under. */
export const siteBase = "/website-redesign/";
export const deployOrigin = "https://nicolas-found42.github.io";

/** Absolute URL of a built path, for the submission contract and contract tests. */
export const deployUrl = (path = "") => `${deployOrigin}${siteBase}${path}`;

/** Where `vite build` writes this version, relative to the repository. */
export const versionOutput = (slug) => resolve("dist", slug);

/** Hub links. They are relative so the same hub works under any base. */
export const versionHref = (slug) => `${slug}/`;
export const reviewHref = (slug) => `${slug}/?review`;

/** Preview images captured by the build and shown on the hub card. */
export const previewHref = (slug, variant = "") =>
  `previews/${slug}${variant}.png`;

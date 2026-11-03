/**
 * Version discovery. The folders under `versions/` are the only registry: a
 * version exists while its folder does, so deleting the folder removes the
 * version from the hub, the build and the tests with nothing else to edit.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

export const versionsDir = resolve("versions");
export const baseline = "current";
export const statuses = [
  "draft",
  "in-review",
  "shortlisted",
  "chosen",
  "archived",
];
export const statusNames = {
  draft: "Draft",
  "in-review": "In review",
  shortlisted: "Shortlisted",
  chosen: "Chosen",
  archived: "Archived",
};
export const statusMeanings = {
  draft: "Still being built; may be rough or incomplete.",
  "in-review": "Ready for the team to look at and give feedback on.",
  shortlisted: "A contender for the final choice.",
  chosen:
    "The team picked this one. Making it the live site is a separate step.",
  archived: "Set aside; kept for reference.",
};
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Returns the problems with a parsed `version.json`; empty means valid. */
export function metadataProblems(slug, meta) {
  const problems = [];
  if (!slugPattern.test(slug) || slug.length > 48)
    problems.push(`folder name "${slug}" is not a valid slug`);
  if (!meta || typeof meta !== "object" || Array.isArray(meta))
    return [...problems, "version.json must be an object"];
  const allowed = [
    "title",
    "summary",
    "status",
    "created",
    "author",
    "changesFacts",
    "prerender",
  ];
  for (const key of Object.keys(meta))
    if (!allowed.includes(key)) problems.push(`unknown field "${key}"`);
  if (!statuses.includes(meta.status))
    problems.push(`status must be one of ${statuses.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.created ?? ""))
    problems.push("created must be a YYYY-MM-DD date");
  for (const key of ["title", "summary", "author"])
    if (meta[key] !== undefined && typeof meta[key] !== "string")
      problems.push(`${key} must be text`);
  if (meta.prerender !== undefined && typeof meta.prerender !== "boolean")
    problems.push("prerender must be true or false");
  if (
    meta.changesFacts !== undefined &&
    (typeof meta.changesFacts !== "string" || !meta.changesFacts.trim())
  )
    problems.push(
      "changesFacts, when present, must say which shared facts this version changes",
    );
  return problems;
}

/** Every version folder, baseline first, then newest first. */
export async function discoverVersions(dir = versionsDir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const file = resolve(dir, slug, "version.json");
    let meta;
    try {
      meta = JSON.parse(await readFile(file, "utf8"));
    } catch (error) {
      throw new Error(
        `versions/${slug}/version.json is missing or unreadable: ${error.message}`,
        { cause: error },
      );
    }
    const problems = metadataProblems(slug, meta);
    if (problems.length)
      throw new Error(`versions/${slug}/version.json: ${problems.join("; ")}`);
    const prerenderFile = resolve(dir, slug, "prerender.mjs");
    const hasPrerenderFile = await stat(prerenderFile).then(
      () => true,
      () => false,
    );
    if (meta.prerender === true && !hasPrerenderFile)
      throw new Error(
        `versions/${slug}/version.json: prerender is true but versions/${slug}/prerender.mjs is missing`,
      );
    if (meta.prerender !== true && hasPrerenderFile)
      throw new Error(
        `versions/${slug}/version.json: versions/${slug}/prerender.mjs exists, so version.json must declare "prerender": true`,
      );
    found.push({
      slug,
      ...meta,
      title: meta.title ?? slug,
      baseline: slug === baseline,
      prerender: meta.prerender === true,
    });
  }
  return found.sort(
    (a, b) =>
      Number(b.baseline) - Number(a.baseline) ||
      b.created.localeCompare(a.created) ||
      a.slug.localeCompare(b.slug),
  );
}

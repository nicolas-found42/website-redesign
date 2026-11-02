/** Vite replaces BASE_URL; review links stay inside the version's own prefix. */
const base = import.meta.env?.BASE_URL ?? "/";
export const sitePath = (path = "") => `${base}${path.replace(/^\//, "")}`;
export const routeFromPath = (path: string) => {
  const relative = path.startsWith(base)
    ? path.slice(base.length)
    : path.replace(/^\//, "");
  return relative
    .replace(/(?:\/index\.html|\/$)/, "")
    .replace(/^index\.html$/, "");
};
/** The version this build belongs to; feedback is always scoped to it. */
export const versionSlug: string = import.meta.env?.VITE_VERSION ?? "current";

/** Vite replaces BASE_URL; all first-party links stay under the deployment prefix. */
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

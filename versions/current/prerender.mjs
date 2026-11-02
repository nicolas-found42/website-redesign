/**
 * Prerenders this version's routes into its build output. The hub's build calls
 * this default export for any version that ships a `prerender.mjs`.
 */
import { createServer } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

export default async function prerender({ slug, outDir }) {
  const server = await createServer({
    base: `/website-redesign/${slug}/`,
    server: { middlewareMode: true },
    appType: "custom",
  });
  try {
    const { renderHomepage } = await server.ssrLoadModule("/src/homepage.ts");
    const { renderPage, pageMeta } =
      await server.ssrLoadModule("/src/pages.ts");
    const template = await readFile(resolve(outDir, "index.html"), "utf8");
    for (const route of [...Object.keys(pageMeta), "404"]) {
      const meta = pageMeta[route] ?? {
        title: "Page not found | Found42",
        description: "This destination is not part of the Found42 preview.",
      };
      const markup = route === "" ? renderHomepage() : renderPage(route);
      const html = template
        .replace('<div id="app"></div>', `<div id="app">${markup}</div>`)
        .replace(/<title>.*?<\/title>/s, `<title>${meta.title}</title>`)
        .replace(
          /(<meta\s+name="description"\s+content=")[^"]*/s,
          `$1${meta.description}`,
        );
      const dir = route === "404" ? outDir : resolve(outDir, route);
      await mkdir(dir, { recursive: true });
      await writeFile(
        route === "404" ? resolve(outDir, "404.html") : `${dir}/index.html`,
        html,
      );
    }
  } finally {
    await server.close();
  }
}

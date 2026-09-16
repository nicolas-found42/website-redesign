import { createServer } from "vite";
import { readFile, writeFile, mkdir } from "node:fs/promises";
const base = "/website-redesign/";
const server = await createServer({
  base,
  server: { middlewareMode: true },
  appType: "custom",
});
try {
  const { renderHomepage } = await server.ssrLoadModule("/src/homepage.ts");
  const { renderPage, pageMeta } = await server.ssrLoadModule("/src/pages.ts");
  const template = await readFile("dist/index.html", "utf8");
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
    const dir = route === "404" ? "dist" : `dist/${route}`;
    await mkdir(dir, { recursive: true });
    await writeFile(
      route === "404" ? "dist/404.html" : `${dir}/index.html`,
      html,
    );
  }
} finally {
  await server.close();
}

import { defineConfig, type Plugin } from "vite";
import { resolve } from "node:path";

/**
 * One Vite build per version. `VERSION` names the folder under `versions/`;
 * everything unique to a version lives there, so deleting the folder removes
 * the version. Shared code is reached only through the `@shared` alias.
 */
const slug = process.env.VERSION ?? "current";
const shared = resolve("shared");

/** Dev only: serve `/shared/*` from outside the version's root. */
const sharedInDev: Plugin = {
  name: "shared-in-dev",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url?.startsWith("/shared/"))
        req.url = `/@fs${shared}${req.url.slice("/shared".length)}`;
      next();
    });
  },
};

export default defineConfig(({ command }) => ({
  root: resolve("versions", slug),
  envDir: resolve("."),
  base: command === "build" ? `/website-redesign/${slug}/` : "/",
  define: { "import.meta.env.VITE_VERSION": JSON.stringify(slug) },
  resolve: { alias: { "@shared": shared } },
  plugins: [sharedInDev],
  server: { fs: { allow: [resolve(".")] } },
  build: { outDir: resolve("dist", slug), emptyOutDir: true },
}));

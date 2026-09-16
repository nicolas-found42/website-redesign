/** Directory indexes and real 404s; deliberately no development SPA fallback. */
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
const root = resolve("dist");
const base = "/website-redesign";
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
};
http
  .createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (!path.startsWith(base + "/") && path !== base)
        throw Error("outside base");
      let file = resolve(root, "." + path.slice(base.length));
      if (!file.startsWith(root + "/") && file !== root)
        throw Error("outside root");
      const info = await stat(file);
      if (info.isDirectory()) {
        if (!path.endsWith("/")) {
          res.writeHead(301, { Location: path + "/" });
          res.end();
          return;
        }
        file += "/index.html";
      }
      res.writeHead(200, {
        "Content-Type": types[extname(file)] ?? "application/octet-stream",
      });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(await readFile(root + "/404.html"));
    }
  })
  .listen(4179, "127.0.0.1", () =>
    console.log(
      "Static Pages preview: http://127.0.0.1:4179/website-redesign/",
    ),
  );

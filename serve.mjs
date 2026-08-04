// Production entry for plain Node hosting (droplet/VM/container).
// The Vite/Nitro build emits a Cloudflare Worker-style `fetch(request, env, ctx)`
// handler at dist/server/server.js — this bridges it to a real Node http server
// AND serves the static client assets (Cloudflare's platform does this part
// automatically for Workers; a plain Node process has to do it itself).
import { createServerAdapter } from "@whatwg-node/server";
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import handler from "./dist/server/server.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const clientDir = join(__dirname, "dist", "client");

const MIME = {
  ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2",
  ".txt": "text/plain",
};

function serveStatic(req, res) {
  const url = new URL(req.url, "http://x");
  if (url.pathname.includes("..")) return false;
  const filePath = join(clientDir, url.pathname);
  if (!filePath.startsWith(clientDir) || !existsSync(filePath) || !statSync(filePath).isFile()) return false;
  const ext = extname(filePath);
  res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
  // Vite fingerprints filenames under /assets/ — safe to cache forever.
  if (url.pathname.startsWith("/assets/")) res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  createReadStream(filePath).pipe(res);
  return true;
}

const ssrAdapter = createServerAdapter((request) => handler.fetch(request, {}, {}));

const server = createServer((req, res) => {
  if (serveStatic(req, res)) return;
  ssrAdapter(req, res);
});

const port = Number(process.env.PORT) || 8080;
const host = process.env.HOST || "0.0.0.0";
server.listen(port, host, () => {
  console.log(`boujee-book listening on http://${host}:${port}`);
});

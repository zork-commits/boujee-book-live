// Production entry for plain Node hosting (droplet/VM/container).
// The Vite/Nitro build emits a Cloudflare Worker-style `fetch(request, env, ctx)`
// handler at dist/server/server.js — this bridges it to a real Node http server.
import { createServerAdapter } from "@whatwg-node/server";
import { createServer } from "node:http";
import handler from "./dist/server/server.js";

const adapter = createServerAdapter((request) => handler.fetch(request, {}, {}));
const port = Number(process.env.PORT) || 8080;
const host = process.env.HOST || "0.0.0.0";

createServer(adapter).listen(port, host, () => {
  console.log(`boujee-book listening on http://${host}:${port}`);
});

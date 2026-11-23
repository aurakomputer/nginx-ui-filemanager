// server/main.js
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const DATA_DIR = process.env.NGINX_UI_PLUGIN_DATA_DIR || ".";
const HTTP_SECRET = process.env.NGINX_UI_PLUGIN_HTTP_SECRET;
const SOCKET_PATH = path.join(DATA_DIR, "http.sock");

// ---------- JSON-RPC helpers ----------
function reply(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}
function replyError(id, code, message, data) {
  process.stdout.write(
    JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: { code, message, ...(data ? { data } : {}) },
    }) + "\n",
  );
}

// ---------- HTTP server (for the "http" capability) ----------
function startHttpServer() {
  if (!HTTP_SECRET) {
    console.error("NGINX_UI_PLUGIN_HTTP_SECRET missing");
    process.exit(1);
  }

  // clean old socket
  try {
    fs.unlinkSync(SOCKET_PATH);
  } catch {}

  const server = http.createServer((req, res) => {
    // Security: only accept requests that carry the secret
    if (req.headers["nginx-ui-plugin-secret"] !== HTTP_SECRET) {
      res.writeHead(401);
      return res.end("unauthorized");
    }

    const url = new URL(req.url, "http://localhost");

    if (req.method === "GET" && url.pathname === "/list") {
      const dir = url.searchParams.get("path") || "/";
      // TODO: make this safe (restrict root, reject .. etc.)
      try {
        const entries = fs
          .readdirSync(dir, { withFileTypes: true })
          .map((d) => ({
            name: d.name,
            is_dir: d.isDirectory(),
          }));
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            path: dir,
            data: {
              items: entries,
            },
          }),
        );
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
      return;
    }

    res.writeHead(404);
    res.end("not found");
  });

  server.listen(SOCKET_PATH, () => {
    fs.chmodSync(SOCKET_PATH, 0o600);
    console.error("HTTP listening on", SOCKET_PATH);
  });

  return server;
}

// ---------- Protocol loop ----------
const rl = readline.createInterface({ input: process.stdin });

let httpServer = null;

rl.on("line", (line) => {
  let msg;
  try {
    msg = JSON.parse(line);
  } catch {
    return; // ignore bad lines
  }

  const { id, method, params } = msg;

  switch (method) {
    case "plugin.initialize":
      // Start the HTTP server before answering the handshake
      httpServer = startHttpServer();
      reply(id, {
        api_version: 1,
        capabilities: ["http"],
        transports: ["stdio"],
      });
      break;

    case "plugin.configure":
      reply(id, {});
      break;

    case "plugin.ping":
      reply(id, {});
      break;

    case "plugin.shutdown":
      if (httpServer) httpServer.close();
      reply(id, {});
      break;

    case "plugin.exit":
      process.exit(0);
      break;

    default:
      replyError(id, -32601, `method not found: ${method}`);
  }
});

// Never write anything except JSON-RPC to stdout
process.stdout.setEncoding("utf8");
console.error("File Manager plugin started");

// server/main.ts
import { unlinkSync, chmodSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const DATA_DIR = Bun.env.NGINX_UI_PLUGIN_DATA_DIR || ".";
const HTTP_SECRET = Bun.env.NGINX_UI_PLUGIN_HTTP_SECRET;
const SOCKET_PATH = join(DATA_DIR, "http.sock");

// ---------- JSON-RPC Types & Helpers ----------
interface JsonRpcRequest {
  jsonrpc?: string;
  id?: string | number | null;
  method: string;
  params?: unknown;
}

function reply(id: string | number | null | undefined, result: unknown): void {
  if (id === undefined) return;
  process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`);
}

function replyError(
  id: string | number | null | undefined,
  code: number,
  message: string,
  data?: unknown,
): void {
  if (id === undefined) return;
  process.stdout.write(
    `${JSON.stringify({
      jsonrpc: "2.0",
      id,
      error: { code, message, ...(data !== undefined ? { data } : {}) },
    })}\n`,
  );
}

// ---------- HTTP server (for the "http" capability) ----------
function startHttpServer() {
  if (!HTTP_SECRET) {
    console.error("NGINX_UI_PLUGIN_HTTP_SECRET missing");
    process.exit(1);
  }

  // Bersihkan socket lama jika masih ada
  try {
    unlinkSync(SOCKET_PATH);
  } catch {}

  const server = Bun.serve({
    unix: SOCKET_PATH,
    async fetch(req: Request): Promise<Response> {
      // Security: hanya terima request yang membawa header secret yang valid
      if (req.headers.get("nginx-ui-plugin-secret") !== HTTP_SECRET) {
        return new Response("unauthorized", { status: 401 });
      }

      const url = new URL(req.url);

      if (req.method === "GET" && url.pathname === "/list") {
        const rawDir = url.searchParams.get("path") || "/";
        // TODO: sesuaikan root restriction untuk keamanan path traversal (misal: BASE_DIR)
        const targetDir = resolve(rawDir);

        try {
          const dirents = await readdir(targetDir, { withFileTypes: true });
          const items = dirents.map((d) => ({
            name: d.name,
            is_dir: d.isDirectory(),
          }));

          return Response.json({
            path: targetDir,
            data: { items },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          return Response.json({ error: message }, { status: 400 });
        }
      }

      return new Response("not found", { status: 404 });
    },
  });

  // Set permission unix socket ke 0600 segera setelah socket dibuat
  try {
    chmodSync(SOCKET_PATH, 0o600);
  } catch (err) {
    console.error("Failed to chmod socket:", err);
  }

  console.error("HTTP listening on", SOCKET_PATH);
  return server;
}

// ---------- Protocol loop (Bun Native Stdin Reader) ----------
let httpServer: ReturnType<typeof Bun.serve> | null = null;

async function startProtocolLoop() {
  console.error("File Manager plugin started");

  const decoder = new TextDecoder();
  let buffer = "";

  for await (const chunk of Bun.stdin.stream()) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split("\n");
    // Simpan sisa baris terakhir yang belum lengkap (belum bertemu \n)
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      let msg: JsonRpcRequest;
      try {
        msg = JSON.parse(trimmed);
      } catch {
        continue; // abaikan baris JSON yang tidak valid
      }

      const { id, method } = msg;

      switch (method) {
        case "plugin.initialize":
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
          if (httpServer) {
            httpServer.stop(true);
            httpServer = null;
          }
          reply(id, {});
          break;

        case "plugin.exit":
          process.exit(0);
          break;

        default:
          replyError(id, -32601, `method not found: ${method}`);
      }
    }
  }
}

startProtocolLoop().catch((err) => {
  console.error("Fatal protocol loop error:", err);
  process.exit(1);
});

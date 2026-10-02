// Servidor local para probar la web sin Cloudflare y sin gastar API.
// Sirve ./public igual que Cloudflare Assets (rutas limpias y 404.html)
// y simula /api/chat con respuestas falsas, para probar el widget del asistente.
//
// Uso:  node scripts/dev-server.mjs        -> http://localhost:8787
//       PORT=3000 node scripts/dev-server.mjs
//
// NO es el Worker real. El Worker real es worker.js y solo se prueba desplegado.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(fileURLToPath(new URL(".", import.meta.url)), "..", "public");
const PUERTO = Number(process.env.PORT) || 8787;

const TIPOS = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".avif": "image/avif", ".gif": "image/gif",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff",
  ".txt": "text/plain; charset=utf-8", ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json", ".mp4": "video/mp4", ".webm": "video/webm",
};

async function esArchivo(p) {
  try { return (await stat(p)).isFile(); } catch { return false; }
}

// Misma logica que "auto-trailing-slash" de Cloudflare Assets:
// /x -> x.html o x/index.html ; /x/ -> x/index.html
async function resolver(ruta) {
  const limpia = normalize(decodeURIComponent(ruta)).replace(/^(\.\.[/\\])+/, "");
  const base = join(RAIZ, limpia);
  if (!base.startsWith(RAIZ)) return null;
  const candidatos = limpia.endsWith("/")
    ? [join(base, "index.html")]
    : [base, base + ".html", join(base, "index.html")];
  for (const c of candidatos) if (await esArchivo(c)) return c;
  return null;
}

function respuestaFalsa(texto) {
  const t = (texto || "").toLowerCase();
  const handoff = /presupuesto|precio cerrado|contratar|hablar con daniel|persona/.test(t);
  const reply = handoff
    ? "[Respuesta simulada] Eso mejor lo hablas con Daniel: 628 129 468 o por WhatsApp en https://wa.me/34628129468."
    : "[Respuesta simulada] Una web de una página cuesta desde 500 € y una web completa desde 900 €. Puedes calcular lo tuyo en la calculadora de la web.";
  return { reply, handoff };
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/chat") {
    if (req.method !== "POST") { res.writeHead(405); return res.end(); }
    let cuerpo = "";
    for await (const trozo of req) cuerpo += trozo;
    let ultimo = "";
    try {
      const msgs = JSON.parse(cuerpo).messages || [];
      ultimo = msgs.length ? msgs[msgs.length - 1].content : "";
    } catch {}
    await new Promise((r) => setTimeout(r, 600)); // simula la espera real
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify(respuestaFalsa(ultimo)));
  }

  const archivo = await resolver(url.pathname);
  if (!archivo) {
    const p404 = join(RAIZ, "404.html");
    res.writeHead(404, { "content-type": TIPOS[".html"] });
    return res.end(await esArchivo(p404) ? await readFile(p404) : "No encontrado");
  }
  res.writeHead(200, { "content-type": TIPOS[extname(archivo).toLowerCase()] || "application/octet-stream" });
  res.end(await readFile(archivo));
}).listen(PUERTO, () => {
  console.log(`Web en local: http://localhost:${PUERTO}  (chat simulado en /api/chat)`);
});

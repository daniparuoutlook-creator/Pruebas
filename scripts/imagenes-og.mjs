// Genera las imágenes para compartir (Open Graph, 1200 x 630) de cada página en public/og/<nombre>.png.
// El nombre sale igual que en construir.mjs: "inicio" para "/", y la ruta con guiones para el resto
// (/servicios/webs/ -> servicios-webs). Si una página lleva "ogImagen" en su meta, usa esa y no se genera otra.
//
// Uso: node scripts/imagenes-og.mjs        (después de node scripts/construir.mjs)
// Necesita Playwright y sharp (en tu ordenador: npm i -D playwright sharp && npx playwright install chromium).
// No lleva el dominio dentro de la imagen, así que no hay que regenerarlas al cambiar de dominio.

import { spawn } from "node:child_process";
import { readFile, readdir, mkdir } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO = 8798;
const BASE = `http://127.0.0.1:${PUERTO}`;
const requerir = createRequire(import.meta.url);
const cargar = (m) => { try { return requerir(m); } catch { return requerir(join(process.execPath, "../../lib/node_modules", m)); } };
const { chromium } = cargar("playwright");
const sharp = cargar("sharp");

const negocio = JSON.parse(await readFile(join(RAIZ, "src/datos/negocio.json"), "utf8"));
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

async function paginas(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await paginas(p)));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const fichas = [];
for (const archivo of await paginas(join(RAIZ, "src/paginas"))) {
  const texto = await readFile(archivo, "utf8");
  const meta = JSON.parse(texto.match(/<!--meta\s*([\s\S]*?)-->/)[1]);
  if (meta.ogImagen) continue; // reutiliza otra imagen
  const ruta = meta.ruta;
  const nombre = meta.og || (ruta === "/" ? "inicio" : ruta.replace(/^\/|\/$/g, "").replace(/\//g, "-"));
  const caso = ruta.startsWith("/trabajos/") && ruta !== "/trabajos/" ? ruta.split("/")[2] : null;
  // Texto grande: el titular (h1) si dice algo por sí solo; si es muy corto ("Trabajos"), el título de la página.
  const h1 = (texto.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ""])[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const titulo = caso || h1.split(" ").length >= 4 ? h1 : (meta.ogTitulo || meta.titulo).split(" · ")[0];
  const seccion = meta.migas ? meta.migas[0][0] : "Desarrollo web";
  fichas.push({ nombre, titulo, seccion: caso ? "Trabajo de ejemplo · negocio ficticio" : seccion, caso, archivo: relative(RAIZ, archivo) });
}

const plantilla = (f) => `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
@font-face{font-family:"Bricolage";src:url(${BASE}/assets/fuentes/bricolage.woff2) format("woff2");font-weight:600 800}
@font-face{font-family:"Archivo";src:url(${BASE}/assets/fuentes/archivo.woff2) format("woff2");font-weight:400 700}
*{box-sizing:border-box;margin:0;padding:0}
body{width:1200px;height:630px;background:#E4E8ED;font-family:"Archivo",sans-serif;color:#16191F;padding:36px}
.hoja{position:relative;height:100%;background:#FCFCFD;border:2px solid #16191F;border-radius:10px;padding:52px 56px;display:flex;flex-direction:column;overflow:hidden}
.seccion{font:italic 700 26px "Archivo";color:#1F3BD6}
h1{margin-top:18px;font:800 ${f.caso ? 64 : f.titulo.length > 34 ? 66 : 78}px/1.04 "Bricolage";letter-spacing:-.025em;max-width:${f.caso ? "520px" : "960px"};text-wrap:balance}
.pie{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:24px;padding-top:22px;border-top:2px solid #16191F}
.marca{font:700 32px "Bricolage";letter-spacing:-.02em}
.marca span{background:linear-gradient(transparent 58%,#FFE24A 58%,#FFE24A 92%,transparent 92%);padding:0 4px}
.datos{font:600 24px "Archivo";color:#5B6470;text-align:right}
.captura{position:absolute;right:-40px;top:52px;width:560px;border:2px solid #16191F;border-radius:10px;overflow:hidden;box-shadow:0 0 0 10px #E4E8ED}
.captura img{display:block;width:100%}
</style></head><body><div class="hoja">
<p class="seccion">${esc(f.seccion)}</p>
<h1>${esc(f.titulo)}</h1>
${f.caso ? `<div class="captura"><img src="${BASE}/assets/img/trabajos/${f.caso}-escritorio-1280.webp" alt=""></div>` : ""}
<div class="pie"><p class="marca"><span>Daniel Padilla</span></p><p class="datos">Webs para negocios · Sevilla y en remoto<br>${esc(negocio.contacto.telefono)}</p></div>
</div></body></html>`;

const servidor = spawn(process.execPath, [join(RAIZ, "scripts/dev-server.mjs")], { env: { ...process.env, PORT: String(PUERTO) }, stdio: "ignore" });
process.on("exit", () => { try { servidor.kill(); } catch {} });
for (let i = 0; i < 50; i++) { try { await fetch(BASE + "/"); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }

await mkdir(join(RAIZ, "public/og"), { recursive: true });
const navegador = await chromium.launch({ args: ["--font-render-hinting=none"] });
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await pagina.goto(BASE + "/"); // mismo origen que las fuentes y las capturas
for (const f of fichas) {
  await pagina.setContent(plantilla(f), { waitUntil: "networkidle" });
  await pagina.evaluate(() => document.fonts.ready);
  const png = await pagina.screenshot({ type: "png" });
  const destino = join(RAIZ, "public/og", `${f.nombre}.png`);
  await sharp(png).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(destino);
  console.log(`og/${f.nombre}.png  <- ${f.archivo}`);
}
await navegador.close();
process.exit(0);

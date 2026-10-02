// Comprobaciones de la web (CLAUDE.md §7). Arranca su propio servidor local con /api/chat simulado.
//
// Uso:  node scripts/comprobar.mjs                 -> todo
//       node scripts/comprobar.mjs --rapido        -> sin la pasada de Playwright (solo enlaces y precios)
//       node scripts/comprobar.mjs --capturas      -> además guarda capturas de página completa en .comprobar/
//       node scripts/comprobar.mjs --solo /precios/ -> Playwright solo en esa página
//
// Qué mira:
//  1. Rastreo de enlaces internos y recursos (ninguno roto) y que /no-existe devuelva el 404 propio.
//  2. Precios: src/datos/negocio.json frente a docs/NEGOCIO.md y frente al texto SYSTEM de worker.js.
//  3. Con Playwright, cada página a 360, 390, 768 y 1280 px: scroll horizontal, zonas táctiles < 44 px,
//     texto < 12 px, márgenes laterales reales (>= 16 px en móvil), errores de consola, peticiones fallidas,
//     un solo h1, saltos en los títulos, imágenes sin alt/width/height, id repetidos.
//  4. Con movimiento reducido (360 y 1280) y sin JavaScript (390): contenido visible y sin desbordes.
//
// Necesita Playwright (en este entorno ya está; en tu ordenador: npm i -D playwright && npx playwright install chromium).

import { spawn, execSync } from "node:child_process";
import { readFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO = 8799;
const BASE = `http://127.0.0.1:${PUERTO}`;
const args = process.argv.slice(2);
const RAPIDO = args.includes("--rapido");
const CAPTURAS = args.includes("--capturas");
const SOLO = args.includes("--solo") ? args[args.indexOf("--solo") + 1] : null;
const ANCHOS = [360, 390, 768, 1280];

const errores = [];
const avisos = [];
const error = (m) => { errores.push(m); };
const aviso = (m) => { avisos.push(m); };

// ---------- servidor ----------
const servidor = spawn(process.execPath, [join(RAIZ, "scripts/dev-server.mjs")], { env: { ...process.env, PORT: String(PUERTO) }, stdio: "ignore" });
const parar = () => { try { servidor.kill(); } catch {} };
process.on("exit", parar);
for (let i = 0; i < 50; i++) {
  try { await fetch(BASE + "/"); break; } catch { await new Promise((r) => setTimeout(r, 100)); }
}

// ---------- 1. rastreo ----------
const paginas = new Set();
const recursos = new Set();
const cola = ["/"];
const visto = new Set();
const enlacesDe = (html) => [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1])
  .concat([...html.matchAll(/\ssrcset="([^"]+)"/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+/)[0])));

while (cola.length) {
  const ruta = cola.shift();
  if (visto.has(ruta)) continue;
  visto.add(ruta);
  const r = await fetch(BASE + ruta, { redirect: "manual" });
  if (r.status !== 200) { error(`Enlace roto: ${ruta} -> ${r.status}`); continue; }
  const tipo = r.headers.get("content-type") || "";
  if (!tipo.includes("text/html")) { recursos.add(ruta); continue; }
  if (ruta.startsWith("/demos/")) continue; // las demos no se rastrean por dentro
  paginas.add(ruta);
  const html = (await r.text()).replace(/<!--[\s\S]*?-->/g, "");
  for (const e of enlacesDe(html)) {
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(e)) continue;
    const limpio = e.split("#")[0].split("?")[0];
    if (!limpio) continue;
    if (!limpio.startsWith("/")) { error(`Enlace relativo en ${ruta}: ${e} (usa rutas que empiecen por /)`); continue; }
    if (!visto.has(limpio)) cola.push(limpio);
  }
}
const r404 = await fetch(BASE + "/no-existe-esta-pagina");
const t404 = await r404.text();
if (r404.status !== 404 || !t404.includes("no existe")) error("La ruta inexistente no devuelve el 404 propio");

// ---------- 2. precios ----------
const negocio = JSON.parse(await readFile(join(RAIZ, "src/datos/negocio.json"), "utf8"));
const negocioMd = await readFile(join(RAIZ, "docs/NEGOCIO.md"), "utf8");
const worker = await readFile(join(RAIZ, "worker.js"), "utf8");
const system = (worker.match(/var SYSTEM = `([\s\S]*?)`;/) || [, ""])[1].replace(/\\xE1/g, "á").replace(/\\xE9/g, "é").replace(/\\xED/g, "í").replace(/\\xF3/g, "ó").replace(/\\xFA/g, "ú").replace(/\\xF1/g, "ñ");
// Busca primero en las filas de las tablas (empiezan por "|") y después en el resto del texto
const lineasMd = negocioMd.split("\n");
const lineaMd = (nombre) => {
  const n = nombre.toLowerCase();
  return lineasMd.find((l) => l.startsWith("|") && l.toLowerCase().includes(n)) || lineasMd.find((l) => l.toLowerCase().includes(n)) || "";
};
for (const [clave, s] of Object.entries({ ...negocio.servicios, ...negocio.extras })) {
  const linea = lineaMd(s.nombreEnNegocioMd || s.nombre);
  for (const n of [s.precio, s.cuota].filter((x) => x != null)) {
    if (!linea || !new RegExp(`\\b${n}\\b`).test(linea)) error(`Precio de "${s.nombre}" (${n} €) no coincide con docs/NEGOCIO.md`);
    if (!new RegExp(`${n} €`).test(system)) aviso(`El SYSTEM de worker.js no menciona ${n} € ("${s.nombre}")`);
  }
}
if (/no tienen precio publicado|extras que no tienen precio publicado/i.test(system)) aviso('El SYSTEM de worker.js dice que hay extras sin precio publicado (desajuste conocido)');

// ---------- 3 y 4. Playwright ----------
function cargar(nombre) {
  const req = createRequire(import.meta.url);
  try { return req(nombre); } catch {}
  try { return req(join(execSync("npm root -g").toString().trim(), nombre)); } catch {}
  return null;
}
const medidasPorPagina = {};
if (!RAPIDO) {
  const pw = cargar("playwright");
  if (!pw) { aviso("Playwright no está instalado: se salta la pasada en navegador"); }
  else {
    const navegador = await pw.chromium.launch({ args: ["--font-render-hinting=none"] });
    if (CAPTURAS) await mkdir(join(RAIZ, ".comprobar"), { recursive: true });
    const lista = [...paginas].filter((p) => !SOLO || p === SOLO).concat(SOLO ? [] : ["/no-existe-esta-pagina"]);
    for (const ruta of lista) {
      const pasadas = [];
      for (const w of ANCHOS) pasadas.push({ w, modo: "normal" });
      pasadas.push({ w: 360, modo: "reducido" }, { w: 1280, modo: "reducido" }, { w: 390, modo: "sin-js" });
      for (const { w, modo } of pasadas) {
        const movil = w < 700;
        const ctx = await navegador.newContext({
          viewport: { width: w, height: movil ? 780 : 860 }, isMobile: movil, hasTouch: movil, deviceScaleFactor: 1,
          reducedMotion: modo === "reducido" ? "reduce" : "no-preference",
        });
        // "Sin JavaScript": se quitan los <script> de la página (los JSON-LD se dejan). Así Playwright puede seguir midiendo.
        if (modo === "sin-js") {
          await ctx.route((u) => u.origin === BASE && !/\.(js|css|woff2|avif|webp|png|svg|ico|json|txt|xml)$/.test(u.pathname), async (route) => {
            const r = await route.fetch();
            const cuerpo = (await r.text()).replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/g, "");
            await route.fulfill({ response: r, body: cuerpo });
          });
        }
        // las fotos de las demos vienen de Unsplash; no forman parte de esta web
        await ctx.route(/images\.unsplash\.com|fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
        const p = await ctx.newPage();
        const consola = [], fallos = [];
        p.on("console", (m) => { if (m.type() === "error" && !/404 \(Not Found\)/.test(m.text())) consola.push(m.text()); });
        p.on("pageerror", (e) => consola.push(e.message));
        p.on("response", (r) => { if (r.status() >= 400 && !(ruta.startsWith("/no-existe") && r.url().endsWith(ruta))) fallos.push(`${r.status()} ${r.url().replace(BASE, "")}`); });
        p.on("requestfailed", (r) => { if (!/unsplash|fonts\.g/.test(r.url())) fallos.push(`fallida ${r.url().replace(BASE, "")}`); });
        await p.goto(BASE + ruta, { waitUntil: "networkidle" });
        await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
        await p.waitForTimeout(modo === "normal" ? 2400 : 400);
        const m = await p.evaluate(({ movil }) => {
          const vw = innerWidth, out = { scrollW: document.documentElement.scrollWidth, vw };
          const visible = (el) => {
            const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false;
            const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none") return false;
            if (el.closest("[hidden],[aria-hidden='true'],.sr")) return false;
            const d = el.closest("details"); if (d && !d.open && !el.closest("summary")) return false;
            return true;
          };
          const desc = (el) => `${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/)[0] : ""} «${(el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40)}»`;
          out.tactiles = []; out.enLinea = 0;
          for (const el of document.querySelectorAll("a[href],button,input:not([type=hidden]),select,textarea,summary,[role=slider],[role=button]")) {
            if (!visible(el)) continue;
            if (el.matches("input") && getComputedStyle(el).opacity === "0") continue;
            const r = el.getBoundingClientRect();
            if (r.width < 44 || r.height < 44) {
              const enLinea = el.tagName === "A" && getComputedStyle(el).display === "inline" && el.closest("p,li,dd,td");
              if (enLinea) out.enLinea++; else out.tactiles.push(`${desc(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
            }
          }
          out.pequenos = [];
          const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          while (tw.nextNode()) {
            const n = tw.currentNode; if (!n.textContent.trim()) continue;
            const el = n.parentElement; if (!el || !visible(el)) continue;
            const fs = parseFloat(getComputedStyle(el).fontSize);
            if (fs < 12) out.pequenos.push(`${desc(el)} ${fs}px`);
          }
          let izq = 1e9, der = 1e9, pi = "", pd = "";
          for (const el of document.querySelectorAll("main h1,main h2,main h3,main p,main li,main dt,main dd,main summary,main label,main td,main th,main figcaption,footer p,footer li")) {
            if (!visible(el) || el.closest("[data-no-medir]")) continue;
            const rg = document.createRange(); rg.selectNodeContents(el);
            for (const r of rg.getClientRects()) { if (!r.width) continue; if (r.left < izq) { izq = r.left; pi = desc(el); } if (vw - r.right < der) { der = vw - r.right; pd = desc(el); } }
          }
          out.margenes = { izq: Math.round(izq), der: Math.round(der), pi, pd };
          out.h1 = document.querySelectorAll("h1").length;
          const niveles = [...document.querySelectorAll("main h1,main h2,main h3,main h4")].map((h) => +h.tagName[1]);
          out.saltos = []; for (let i = 1; i < niveles.length; i++) if (niveles[i] - niveles[i - 1] > 1) out.saltos.push(`h${niveles[i - 1]}→h${niveles[i]}`);
          out.imgs = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt") || !i.getAttribute("width") || !i.getAttribute("height")).map((i) => i.getAttribute("src"));
          const ids = [...document.querySelectorAll("[id]")].map((e) => e.id); out.idsRepetidos = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
          out.invisibles = [...document.querySelectorAll("main *")].filter((el) => {
            if (!el.getBoundingClientRect().width || el.closest("[hidden],[aria-hidden='true'],.sr,details:not([open])")) return false;
            const cs = getComputedStyle(el); return parseFloat(cs.opacity) < 0.05 && cs.display !== "none" && el.textContent.trim();
          }).map(desc).slice(0, 5);
          return out;
        }, { movil });
        const clave = `${ruta} @${w}${modo !== "normal" ? " " + modo : ""}`;
        medidasPorPagina[clave] = m;
        if (m.scrollW > m.vw) error(`${clave}: scroll horizontal (${m.scrollW} > ${m.vw})`);
        if (m.tactiles.length) error(`${clave}: zonas táctiles < 44 px: ${m.tactiles.slice(0, 6).join(" | ")}`);
        if (m.pequenos.length) error(`${clave}: texto < 12 px: ${m.pequenos.slice(0, 4).join(" | ")}`);
        if (movil && (m.margenes.izq < 16 || m.margenes.der < 16)) error(`${clave}: margen lateral < 16 px (izq ${m.margenes.izq} ${m.margenes.pi} / der ${m.margenes.der} ${m.margenes.pd})`);
        if (m.h1 !== 1) error(`${clave}: ${m.h1} h1 (debe haber uno)`);
        if (m.saltos.length) aviso(`${clave}: saltos en títulos ${m.saltos.join(", ")}`);
        if (m.imgs.length) error(`${clave}: imágenes sin alt/width/height: ${m.imgs.join(", ")}`);
        if (m.idsRepetidos.length) error(`${clave}: id repetidos: ${m.idsRepetidos.join(", ")}`);
        if (modo !== "normal" && m.invisibles.length) error(`${clave}: contenido invisible: ${m.invisibles.join(" | ")}`);
        if (consola.length) error(`${clave}: errores de consola: ${consola.slice(0, 3).join(" | ")}`);
        if (fallos.length) error(`${clave}: peticiones fallidas: ${[...new Set(fallos)].slice(0, 4).join(" | ")}`);
        if (CAPTURAS && modo === "normal") {
          const nombre = (ruta === "/" ? "inicio" : ruta.replace(/^\/|\/$/g, "").replace(/\//g, "_")) + `-${w}.png`;
          await p.screenshot({ path: join(RAIZ, ".comprobar", nombre), fullPage: true });
        }
        await ctx.close();
      }
      process.stdout.write(".");
    }
    await navegador.close();
    console.log("");
  }
}

parar();
console.log(`\nPáginas rastreadas: ${paginas.size} · recursos: ${recursos.size}`);
if (avisos.length) console.log(`\nAvisos (${avisos.length}):\n  - ` + [...new Set(avisos)].join("\n  - "));
if (errores.length) { console.log(`\nErrores (${errores.length}):\n  - ` + errores.join("\n  - ")); process.exitCode = 1; }
else console.log("\nSin errores.");

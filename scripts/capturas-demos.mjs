// Captura las 5 demos (móvil y escritorio) y las guarda optimizadas en AVIF y WebP
// para las tarjetas de /trabajos/ y el visor de cada caso.
//
// Uso (con el servidor local arrancado: node scripts/dev-server.mjs):
//   node scripts/capturas-demos.mjs              -> con las fotos reales de las demos
//   node scripts/capturas-demos.mjs --sin-fotos  -> sustituye las fotos por un bloque de color
//                                                    (para entornos sin acceso a images.unsplash.com)
//
// Necesita Playwright y sharp. En tu ordenador, una sola vez:
//   npm i -D playwright sharp && npx playwright install chromium
//
// Salida: public/assets/img/trabajos/<caso>-movil-{390,780}.{avif,webp}
//         public/assets/img/trabajos/<caso>-escritorio-{640,1280}.{avif,webp}

import { mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = join(RAIZ, "public/assets/img/trabajos");
const BASE = process.env.BASE || "http://localhost:8787";
const SIN_FOTOS = process.argv.includes("--sin-fotos");

// Busca un paquete en el proyecto o en la instalación global de npm
function cargar(nombre) {
  const req = createRequire(import.meta.url);
  try { return req(nombre); } catch {}
  try { return req(join(execSync("npm root -g").toString().trim(), nombre)); } catch {}
  console.error(`Falta "${nombre}". Instálalo con: npm i -D ${nombre}`);
  process.exit(1);
}
const { chromium } = cargar("playwright");
const sharp = cargar("sharp");

const CASOS = [
  ["bar-almanaque", "hosteleria", "#2E3835"],
  ["estudio-malva", "belleza", "#E7DCE6"],
  ["clinica-arenal", "clinica", "#DCE8E3"],
  ["la-despensa", "tienda", "#DCE2CC"],
  ["academia-compas", "academia", "#E1E3EC"],
];

await mkdir(SALIDA, { recursive: true });
const navegador = await chromium.launch({ args: ["--font-render-hinting=none"] });

async function captura(demo, color, ancho, alto, escala) {
  const ctx = await navegador.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: escala, isMobile: ancho < 700, hasTouch: ancho < 700, reducedMotion: "reduce" });
  if (SIN_FOTOS) {
    const bloque = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="${color}"/></svg>`;
    await ctx.route(/images\.unsplash\.com/, (r) => r.fulfill({ status: 200, contentType: "image/svg+xml", body: bloque }));
  }
  const p = await ctx.newPage();
  await p.goto(`${BASE}/demos/${demo}.html`, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(800);
  const png = await p.screenshot();
  await ctx.close();
  return png;
}

for (const [caso, demo, color] of CASOS) {
  const escritorio = await captura(demo, color, 1280, 800, 1);
  const movil = await captura(demo, color, 390, 844, 2);
  const tareas = [];
  for (const w of [640, 1280]) {
    const img = sharp(escritorio).resize({ width: w });
    tareas.push(img.clone().avif({ quality: 52, effort: 6 }).toFile(join(SALIDA, `${caso}-escritorio-${w}.avif`)));
    tareas.push(img.clone().webp({ quality: 74 }).toFile(join(SALIDA, `${caso}-escritorio-${w}.webp`)));
  }
  for (const w of [390, 780]) {
    const img = sharp(movil).resize({ width: w });
    tareas.push(img.clone().avif({ quality: 52, effort: 6 }).toFile(join(SALIDA, `${caso}-movil-${w}.avif`)));
    tareas.push(img.clone().webp({ quality: 74 }).toFile(join(SALIDA, `${caso}-movil-${w}.webp`)));
  }
  await Promise.all(tareas);
  console.log(`  ${caso}: listo${SIN_FOTOS ? " (sin fotos)" : ""}`);
}
await navegador.close();

// Prueba de verdad los momentos interactivos de la web, en un móvil táctil (390 px) y en escritorio:
// antes/después, calculadora, filtros, visor de capturas, simulaciones, menú y asistente (con /api/chat simulado).
// También con movimiento reducido. Cada comprobación imprime "ok" o "FALLA" y el script sale con error si falla alguna.
//
// Uso: node scripts/probar-momentos.mjs
// Necesita Playwright (en tu ordenador: npm i -D playwright && npx playwright install chromium).

import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUERTO = 8797;
const BASE = `http://127.0.0.1:${PUERTO}`;
const requerir = createRequire(import.meta.url);
const cargar = (m) => { try { return requerir(m); } catch { return requerir(join(process.execPath, "../../lib/node_modules", m)); } };
const { chromium } = cargar("playwright");

const servidor = spawn(process.execPath, [join(RAIZ, "scripts/dev-server.mjs")], { env: { ...process.env, PORT: String(PUERTO) }, stdio: "ignore" });
process.on("exit", () => { try { servidor.kill(); } catch {} });
for (let i = 0; i < 50; i++) { try { await fetch(BASE + "/"); break; } catch { await new Promise((r) => setTimeout(r, 100)); } }

let fallos = 0;
const ver = (cond, texto) => { console.log(`${cond ? "ok   " : "FALLA"} ${texto}`); if (!cond) fallos++; };
const navegador = await chromium.launch();
const movil = { viewport: { width: 390, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

async function pagina(opciones, ruta) {
  const ctx = await navegador.newContext(opciones);
  const p = await ctx.newPage();
  const errores = [];
  p.on("pageerror", (e) => errores.push(e.message));
  p.on("console", (m) => m.type() === "error" && errores.push(m.text()));
  await p.goto(BASE + ruta, { waitUntil: "networkidle" });
  return { p, ctx, errores };
}
const sinScrollLateral = (p) => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

// ---------- 1. Antes / después (inicio, móvil táctil) ----------
{
  console.log("\nAntes / después · móvil táctil");
  const { p, ctx, errores } = await pagina(movil, "/");
  const tirador = p.locator(".ad-tirador");
  await tirador.scrollIntoViewIfNeeded();
  const cdp = await ctx.newCDPSession(p);
  const valor = () => tirador.getAttribute("aria-valuenow").then(Number);
  const deslizar = async (x, y0, x1, y1) => {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] });
    for (let i = 1; i <= 12; i++) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + ((x1 - x) * i) / 12, y: y0 + ((y1 - y0) * i) / 12 }] });
      await p.waitForTimeout(16);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await p.waitForTimeout(400);
  };
  // un toque en el marco lleva la línea a ese punto
  let marco = await p.locator("[data-ad]").boundingBox();
  await p.touchscreen.tap(marco.x + marco.width * 0.85, marco.y + marco.height * 0.3);
  const v0 = await valor();
  ver(v0 > 75 && v0 < 95, `un toque en el marco lleva la línea allí (${v0})`);
  // arrastre con el dedo desde el tirador hacia la izquierda
  const caja = await tirador.boundingBox();
  await deslizar(caja.x + caja.width / 2, caja.y + caja.height / 2, caja.x + caja.width / 2 - 180, caja.y + caja.height / 2);
  const v1 = await valor();
  ver(v1 < v0 - 30, `arrastrar el tirador con el dedo mueve la línea (${v0} -> ${v1})`);
  // deslizar en vertical sobre la imagen hace scroll de la página (el dedo no se queda atrapado)
  marco = await p.locator("[data-ad]").boundingBox();
  const antes = await p.evaluate(() => scrollY);
  const xs = marco.x + marco.width * 0.3;
  await deslizar(xs, marco.y + marco.height * 0.7, xs, marco.y + marco.height * 0.7 - 260);
  const despues = await p.evaluate(() => scrollY);
  ver(despues > antes + 150, `deslizar en vertical sobre el comparador hace scroll (${Math.round(antes)} -> ${Math.round(despues)})`);
  // teclado
  await tirador.focus();
  const v3 = await valor();
  await p.keyboard.press("ArrowRight");
  ver((await valor()) === Math.min(100, v3 + 5), "flecha derecha suma 5");
  await p.keyboard.press("Home");
  ver((await valor()) === 0, "Inicio lleva a 0");
  ver(await sinScrollLateral(p), "sin scroll horizontal");
  ver(errores.length === 0, `consola sin errores ${errores.join(" | ")}`);
  await ctx.close();
}

// ---------- 2. Calculadora (precios, móvil) ----------
{
  console.log("\nCalculadora · móvil");
  const { p, ctx, errores } = await pagina(movil, "/precios/");
  const total = () => p.locator("[data-total]").innerText();
  ver((await total()).replace(/\s/g, " ").includes("500"), `estado inicial: web de una página, desde 500 € (${await total()})`);
  await p.locator(".presu-op", { hasText: "Web completa" }).click();
  await p.locator(".presu-op", { hasText: "Vender online" }).click();
  await p.locator(".presu-op", { hasText: "Asistente en tu web" }).click();
  await p.waitForTimeout(500);
  const t = (await total()).replace(/\s/g, " ");
  ver(/1\.?650/.test(t), `web completa + vender online + asistente = 1.650 € (${t})`);
  const mes = await p.locator("[data-mes]").innerText();
  ver(/45/.test(mes), `cuota mensual del asistente a la vista (${mes})`);
  const lineas = await p.locator("[data-lineas] li").count();
  ver(lineas === 3, `tres líneas en la hoja (${lineas})`);
  const href = decodeURIComponent(await p.locator("[data-enviar]").getAttribute("href"));
  ver(href.startsWith("https://wa.me/34628129468") && href.includes("Web completa") && href.includes("Vender online") && /1\.?650/.test(href), "el WhatsApp lleva el desglose y el total");
  await p.locator(".presu-op", { hasText: "Ya tengo web" }).click();
  await p.locator(".presu-op", { hasText: "Vender online" }).click();
  await p.locator(".presu-op", { hasText: "Asistente en tu web" }).click();
  await p.waitForTimeout(400);
  ver(/marca lo que necesitas/i.test(await p.locator("[data-lineas]").innerText()) && /elige algo/i.test(await total()), "sin nada marcado pide que elijas algo");
  ver(await sinScrollLateral(p), "sin scroll horizontal");
  ver(errores.length === 0, `consola sin errores ${errores.join(" | ")}`);
  await ctx.close();
}

// ---------- 3. Filtros de trabajos ----------
{
  console.log("\nFiltros de trabajos · móvil");
  const { p, ctx, errores } = await pagina(movil, "/trabajos/");
  await p.click('[data-filtro="herramientas"]');
  await p.waitForTimeout(400);
  const visibles = await p.$$eval(".grupo-trabajos", (g) => g.filter((x) => x.offsetParent !== null).map((x) => x.dataset.grupo));
  ver(visibles.join() === "herramientas", `solo se ve el grupo elegido (${visibles.join()})`);
  ver((await p.getAttribute('[data-filtro="herramientas"]', "aria-pressed")) === "true", "el botón elegido queda marcado (aria-pressed)");
  await p.click('[data-filtro="todos"]');
  await p.waitForTimeout(400);
  const todos = await p.$$eval(".grupo-trabajos", (g) => g.filter((x) => x.offsetParent !== null).length);
  ver(todos === 4, `"Todos" vuelve a enseñar los cuatro grupos (${todos})`);
  ver(errores.length === 0, `consola sin errores ${errores.join(" | ")}`);
  await ctx.close();
}

// ---------- 4. Visor de capturas (caso) ----------
{
  console.log("\nVisor de un caso · móvil");
  const { p, ctx, errores } = await pagina(movil, "/trabajos/bar-almanaque/");
  const visible = (cual) => p.locator(`[data-pantalla="${cual}"]`).isVisible();
  ver((await visible("movil")) && !(await visible("escritorio")), "en móvil empieza enseñando la captura de móvil");
  await p.click('[data-ver="escritorio"]');
  await p.waitForTimeout(400);
  ver((await visible("escritorio")) && !(await visible("movil")), "el botón Ordenador cambia la captura");
  ver(await sinScrollLateral(p), "sin scroll horizontal con la captura de ordenador");
  ver(errores.length === 0, `consola sin errores ${errores.join(" | ")}`);
  await ctx.close();
}

// ---------- 5. Simulaciones (automatizaciones) ----------
{
  console.log("\nSimulaciones · móvil");
  const { p, ctx, errores } = await pagina(movil, "/servicios/automatizaciones-ia/");
  const sim = p.locator("[data-sim]").first();
  const pasos = await sim.locator("[data-paso]").count();
  ver((await sim.locator("[data-paso]").evaluateAll((l) => l.every((x) => getComputedStyle(x).opacity === "1"))), "antes de tocar nada se ve el estado final completo");
  await sim.locator("[data-sim-play]").click();
  await p.waitForTimeout(300);
  const ocultos = await sim.locator("[data-paso]").evaluateAll((l) => l.filter((x) => getComputedStyle(x).opacity !== "1").length);
  ver(ocultos > 0, `al pulsar, la simulación empieza de cero (${ocultos} de ${pasos} pasos por salir)`);
  await p.waitForTimeout(pasos * 900 + 800);
  const vistos = await sim.locator("[data-paso].visto").count();
  ver(vistos === pasos, `al final se ven todos los pasos (${vistos}/${pasos})`);
  ver(/otra vez/i.test(await sim.locator("[data-sim-play]").innerText()), "el botón pasa a «Ver otra vez»");
  ver(errores.length === 0, `consola sin errores ${errores.join(" | ")}`);
  await ctx.close();
}

// ---------- 6. Menú ----------
{
  console.log("\nMenú · móvil");
  const { p, ctx, errores } = await pagina(movil, "/servicios/");
  const boton = p.locator("#menu-boton");
  ver((await boton.evaluate((b) => b.tagName)) === "BUTTON", "el enlace del menú se convierte en botón con JavaScript");
  await boton.click();
  await p.waitForTimeout(350);
  ver(await p.locator("#menu").isVisible(), "se abre");
  ver((await boton.getAttribute("aria-expanded")) === "true", "aria-expanded = true");
  for (let i = 0; i < 15; i++) await p.keyboard.press("Tab");
  ver(await p.evaluate(() => document.getElementById("menu").contains(document.activeElement)), "el foco no se escapa del menú con Tab");
  ver(await sinScrollLateral(p), "sin scroll horizontal con el menú abierto");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(350);
  ver(!(await p.locator("#menu").isVisible()), "Escape lo cierra");
  ver(await p.evaluate(() => document.activeElement && document.activeElement.id === "menu-boton"), "el foco vuelve al botón");
  ver(errores.length === 0, `consola sin errores ${errores.join(" | ")}`);
  await ctx.close();
}

// ---------- 7. Asistente (chat simulado) ----------
for (const [nombre, opciones, disparador] of [["móvil", movil, ".barra-ia"], ["escritorio", { viewport: { width: 1280, height: 800 } }, ".ia-flotante"]]) {
  console.log(`\nAsistente · ${nombre}`);
  const { p, ctx, errores } = await pagina(opciones, "/contacto/");
  if (nombre === "escritorio") await p.evaluate(() => scrollTo(0, 400));
  await p.waitForTimeout(300);
  await p.click(disparador);
  await p.waitForSelector("#ia-panel:not([hidden])", { timeout: 4000 });
  ver(/inteligencia artificial/i.test(await p.locator("#ia-panel").innerText()), "avisa de que es una IA");
  ver(await p.evaluate(() => document.getElementById("ia-panel").contains(document.activeElement)), "el foco entra en el chat");
  const entrada = p.locator("#ia-input");
  ver((await entrada.getAttribute("maxlength")) === "1000", "máximo 1000 caracteres");
  ver((await entrada.evaluate((x) => getComputedStyle(x).fontSize)) === "16px", "el campo a 16 px (sin zoom en iOS)");
  await entrada.fill("¿Cuánto cuesta una web?");
  await p.click("#ia-send");
  await p.waitForFunction(() => document.querySelectorAll(".ia-m.ia-bot").length >= 2 && !document.querySelector(".ia-wait"), null, { timeout: 5000 });
  ver(/Respuesta simulada/.test(await p.locator(".ia-m.ia-bot").last().innerText()), "contesta (con la respuesta simulada del servidor local)");
  ver((await p.locator(".ia-hand").count()) === 0, "sin bloque de pasar con Daniel cuando no hace falta");
  await entrada.fill("Quiero un presupuesto cerrado");
  await p.click("#ia-send");
  await p.waitForSelector(".ia-hand", { timeout: 5000 });
  const enlaces = await p.locator(".ia-hand a").evaluateAll((l) => l.map((a) => a.getAttribute("href")));
  ver(enlaces.some((h) => h.startsWith("tel:")) && enlaces.some((h) => h.startsWith("https://wa.me/")), "con handoff aparece llamar y WhatsApp");
  const enlazado = await p.locator(".ia-m.ia-bot a").evaluateAll((l) => l.map((a) => a.getAttribute("href")));
  ver(enlazado.every((h) => /^(tel:|https:\/\/wa\.me\/)/.test(h)), `enlaces de la respuesta seguros (${enlazado.join(" ")})`);
  ver(await sinScrollLateral(p), "sin scroll horizontal con el chat abierto");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  ver(await p.locator("#ia-panel").isHidden(), "Escape lo cierra");
  ver(await p.evaluate(() => document.activeElement && document.activeElement.hasAttribute("data-ia-open")), "el foco vuelve al botón que lo abrió");
  ver(errores.length === 0, `consola sin errores ${errores.join(" | ")}`);
  await ctx.close();
}

// ---------- 8. Movimiento reducido ----------
{
  console.log("\nMovimiento reducido · móvil");
  const { p, ctx, errores } = await pagina({ ...movil, reducedMotion: "reduce" }, "/");
  ver((await p.locator("[data-ad].pista").count()) === 0, "el comparador no hace la animación de pista");
  const animadas = await p.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
  ver(animadas === 0, `ninguna animación en marcha al cargar (${animadas})`);
  await ctx.close();
  const s = await pagina({ ...movil, reducedMotion: "reduce" }, "/servicios/automatizaciones-ia/");
  await s.p.locator("[data-sim-play]").first().click();
  await s.p.waitForTimeout(200);
  const pasos = s.p.locator("[data-sim]").first().locator("[data-paso]");
  ver((await pasos.evaluateAll((l) => l.every((x) => getComputedStyle(x).opacity === "1"))), "la simulación enseña el resultado sin animar");
  ver(errores.length + s.errores.length === 0, "consola sin errores");
  await s.ctx.close();
}

await navegador.close();
console.log(fallos ? `\n${fallos} comprobaciones fallan.` : "\nTodo bien.");
process.exit(fallos ? 1 : 0);

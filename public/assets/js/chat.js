/* Asistente de IA de la web de Daniel Padilla.
   Se descarga al primer toque en cualquier [data-ia-open] (lo hace /assets/js/sitio.js).

   NO CAMBIAR SU FUNCIONAMIENTO (CLAUDE.md §6):
   - Contrato con el Worker: POST /api/chat con {messages:[{role,content}]} -> {reply, handoff}.
     Máximo 16 mensajes y 1000 caracteres por mensaje.
   - Aviso visible de que es una IA y no Daniel (Reglamento europeo de IA).
   - Bloque "pasar con Daniel" (llamar / WhatsApp) cuando handoff es true o hay error.
   - Enlazado seguro: solo se convierten en enlace las URL de dominios permitidos y los teléfonos.
   - Ajuste al teclado del móvil con visualViewport, cierre con Escape y foco accesible. */

const TEL = "628 129 468";
const TEL_HREF = "tel:+34628129468";
const WA = "https://wa.me/34628129468";
const FALL = "Ahora mismo no puedo responder. Habla directamente con Daniel en el 628 129 468 o por WhatsApp.";
const HOSTS = ["wa.me", location.hostname, "web.daniparuoutlook.workers.dev", "webpadilla.com", "www.webpadilla.com"];
const RX = /https?:\/\/[^\s]+|(?:\+34 ?)?[6-9]\d{2} ?\d{3} ?\d{3}/g;
const MAX_MENSAJES = 16;
const MAX_CARACTERES = 1000;

const plantilla = `
<section class="ia-panel" id="ia-panel" role="dialog" aria-modal="true" aria-labelledby="ia-title" tabindex="-1" hidden>
  <header class="ia-head">
    <div><b id="ia-title">Asistente de IA</b><small>Soy una inteligencia artificial, no Daniel</small></div>
    <button class="ia-x" id="ia-close" type="button" aria-label="Cerrar el chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
  </header>
  <div class="ia-contact"><span>¿Prefieres hablar con Daniel?</span><div class="ia-contact-vias"><a href="${TEL_HREF}">Llamar</a><a href="${WA}" target="_blank" rel="noopener">WhatsApp</a></div></div>
  <div class="ia-log" id="ia-log" role="log" aria-live="polite" tabindex="-1">
    <div class="ia-m ia-bot">Hola. Soy el asistente de la web de Daniel Padilla y soy una inteligencia artificial, no una persona, así que puedo equivocarme. Te resuelvo dudas sobre servicios, precios y cómo trabaja Daniel. Para un presupuesto cerrado o algo concreto de tu negocio, mejor hablarlo con él.</div>
  </div>
  <div class="ia-chips" id="ia-chips">
    <button type="button">¿Cuánto cuesta una web?</button>
    <button type="button">Quiero arreglar mi web</button>
    <button type="button">¿Trabajas fuera de Sevilla?</button>
  </div>
  <form class="ia-form" id="ia-form">
    <label for="ia-input" class="sr">Escribe tu pregunta</label>
    <textarea id="ia-input" rows="1" maxlength="${MAX_CARACTERES}" placeholder="Escribe tu pregunta" enterkeyhint="send"></textarea>
    <button class="ia-send" id="ia-send" type="submit" aria-label="Enviar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
  </form>
  <p class="ia-note">Es una IA y puede equivocarse. No escribas datos personales. <a href="/privacidad">Privacidad</a></p>
</section>`;

document.body.insertAdjacentHTML("beforeend", plantilla);

const $ = (id) => document.getElementById(id);
const panel = $("ia-panel"), log = $("ia-log"), form = $("ia-form"), input = $("ia-input"), send = $("ia-send"), chips = $("ia-chips");
const vv = window.visualViewport;
const hist = [];
let ocupado = false;
let origen = null;

const movil = () => matchMedia("(max-width: 639px)").matches;
const abajo = () => { log.scrollTop = log.scrollHeight; };

function rellenar(el, t) {
  let i = 0;
  for (const m of t.matchAll(RX)) {
    const u = m[0].replace(/[.,;:)]+$/, "");
    el.append(t.slice(i, m.index));
    let a = null;
    if (u[0] === "h") {
      try { if (HOSTS.includes(new URL(u).hostname)) { a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener"; } } catch (e) { /* URL rota: se deja como texto */ }
    } else {
      a = document.createElement("a");
      a.href = "tel:+34" + u.replace(/\D/g, "").slice(-9);
    }
    if (a) { a.textContent = u; el.append(a); } else el.append(u);
    i = m.index + u.length;
  }
  el.append(t.slice(i));
}

function mensaje(rol, t) {
  const d = document.createElement("div");
  d.className = "ia-m ia-" + rol;
  rellenar(d, t);
  log.append(d);
  abajo();
  return d;
}

function pasoConDaniel() {
  const d = document.createElement("div");
  d.className = "ia-hand";
  d.innerHTML = `<p>Esto mejor lo hablas con Daniel:</p><a href="${TEL_HREF}">Llamar al ${TEL}</a><a href="${WA}" target="_blank" rel="noopener">Escribir por WhatsApp</a>`;
  log.append(d);
  abajo();
}

function ajustar() {
  if (!vv || panel.hidden || !movil()) { panel.style.height = panel.style.top = ""; return; }
  panel.style.height = vv.height + "px";
  panel.style.top = vv.offsetTop + "px";
  abajo();
}

function crecer() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 120) + "px";
}

function alTeclado(e) {
  if (panel.hidden) return;
  if (e.key === "Escape") { e.preventDefault(); cerrar(); return; }
  if (e.key !== "Tab") return;
  // Diálogo modal: el foco no sale del panel
  const lista = [...panel.querySelectorAll("a[href],button,textarea")].filter((x) => x.offsetParent !== null);
  const primero = lista[0], ultimo = lista[lista.length - 1];
  if (!panel.contains(document.activeElement)) { e.preventDefault(); primero.focus(); }
  else if (e.shiftKey && (document.activeElement === primero || document.activeElement === panel)) { e.preventDefault(); ultimo.focus(); }
  else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
}

export function abrir(desde) {
  origen = desde || document.activeElement;
  panel.hidden = false;
  document.body.classList.add("ia-abierto");
  document.querySelectorAll("[data-ia-open]").forEach((b) => b.setAttribute("aria-expanded", "true"));
  if (movil()) document.documentElement.style.overflow = "hidden";
  document.addEventListener("keydown", alTeclado);
  ajustar();
  abajo();
  (movil() ? panel : input).focus();
}

export function cerrar() {
  panel.hidden = true;
  document.body.classList.remove("ia-abierto");
  document.querySelectorAll("[data-ia-open]").forEach((b) => b.setAttribute("aria-expanded", "false"));
  document.documentElement.style.overflow = "";
  document.removeEventListener("keydown", alTeclado);
  if (origen && document.contains(origen) && origen.offsetParent !== null) origen.focus();
  else { const b = [...document.querySelectorAll("[data-ia-open]")].find((x) => x.offsetParent !== null); if (b) b.focus(); }
}

async function preguntar(t) {
  t = t.trim().slice(0, MAX_CARACTERES);
  if (!t || ocupado) return;
  ocupado = true;
  send.setAttribute("aria-disabled", "true");
  chips.hidden = true;
  mensaje("user", t);
  hist.push({ role: "user", content: t });
  input.value = "";
  crecer();
  const espera = mensaje("bot", "Escribiendo…");
  espera.classList.add("ia-wait");
  let respuesta = "", pasar = false;
  try {
    const r = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: hist.slice(-MAX_MENSAJES) }),
    });
    const d = await r.json();
    respuesta = d.reply || "";
    pasar = !!d.handoff;
  } catch (e) { /* sin conexión o error: se ofrece hablar con Daniel */ }
  if (!respuesta) { respuesta = FALL; pasar = true; }
  espera.remove();
  mensaje("bot", respuesta);
  hist.push({ role: "assistant", content: respuesta });
  if (pasar) pasoConDaniel();
  ocupado = false;
  send.removeAttribute("aria-disabled");
  // En móvil no se vuelve a abrir el teclado: el foco va al registro para que se lea la respuesta
  (movil() ? log : input).focus();
}

$("ia-close").addEventListener("click", cerrar);
chips.addEventListener("click", (e) => { if (e.target.tagName === "BUTTON") preguntar(e.target.textContent); });
form.addEventListener("submit", (e) => { e.preventDefault(); preguntar(input.value); });
input.addEventListener("input", crecer);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !matchMedia("(pointer: coarse)").matches) { e.preventDefault(); preguntar(input.value); }
});
if (vv) { vv.addEventListener("resize", ajustar); vv.addEventListener("scroll", ajustar); }
addEventListener("resize", ajustar);

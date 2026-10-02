// Genera la web en public/ a partir de src/ (sin dependencias, solo Node).
//
// Uso:  node scripts/construir.mjs
//
// - src/paginas/**.html  -> una página por archivo. Empieza con un bloque <!--meta { ...JSON... } -->
// - src/plantilla/*.html -> base.html (esqueleto) y parciales que se insertan con {{> nombre}}
// - src/datos/negocio.json -> precios y contacto (fuente única)
// - src/datos/sitio.json   -> URL base del dominio (fuente única)
//
// Marcas que se pueden usar en páginas y parciales:
//   {{precio:clave}}  -> "500 €" (servicios o extras de negocio.json)
//   {{cuota:clave}}   -> "45 €"  (cuota mensual)
//   {{plazo:clave}}   -> "1 a 2 semanas"
//   {{c:campo}}       -> dato de contacto (telefono, correo, horario...)
//   {{tel}}           -> tel:+34...
//   {{wa}}            -> https://wa.me/34...
//   {{wa:Texto del mensaje}} -> enlace de WhatsApp con el mensaje ya escrito
//   {{url}}           -> URL base (https://...)
//   {{dominio}}       -> solo el dominio (web.ejemplo.com)
//   {{> parcial}}     -> contenido de src/plantilla/parcial.html
//
// Lo que genera: public/**/index.html (y aviso-legal.html, privacidad.html, 404.html),
// public/sitemap.xml, public/robots.txt y public/llms.txt.

import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(RAIZ, "src");
const PUB = join(RAIZ, "public");

const negocio = JSON.parse(await readFile(join(SRC, "datos/negocio.json"), "utf8"));
const sitio = JSON.parse(await readFile(join(SRC, "datos/sitio.json"), "utf8"));
const URL_BASE = sitio.url.replace(/\/$/, "");
const C = negocio.contacto;

// ---------- utilidades ----------
const euros = (n) => `${n.toLocaleString("es-ES")}&nbsp;€`;
const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const quitarHtml = (s) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const jsonSeguro = (o) => JSON.stringify(o).replace(/</g, "\\u003c");
const wa = (texto) => `https://wa.me/${C.whatsapp}` + (texto ? `?text=${encodeURIComponent(texto)}` : "");

function dato(clave) {
  const s = negocio.servicios[clave] || negocio.extras[clave];
  if (!s) throw new Error(`Precio desconocido: ${clave}`);
  return s;
}

const parciales = {};
async function parcial(nombre) {
  if (!(nombre in parciales)) parciales[nombre] = await readFile(join(SRC, "plantilla", `${nombre}.html`), "utf8");
  return parciales[nombre];
}

async function sustituir(texto, ctx = {}) {
  // parciales (pueden contener otras marcas)
  for (let i = 0; i < 5 && /\{\{>\s*[\w-]+\s*\}\}/.test(texto); i++) {
    const nombres = [...texto.matchAll(/\{\{>\s*([\w-]+)\s*\}\}/g)].map((m) => m[1]);
    for (const n of new Set(nombres)) texto = texto.split(new RegExp(`\\{\\{>\\s*${n}\\s*\\}\\}`)).join(await parcial(n));
  }
  return texto
    .replace(/\{\{precio:([\w]+)\}\}/g, (_, k) => euros(dato(k).precio))
    .replace(/\{\{cuota:([\w]+)\}\}/g, (_, k) => euros(dato(k).cuota))
    .replace(/\{\{plazo:([\w]+)\}\}/g, (_, k) => dato(k).plazo)
    .replace(/\{\{c:([\w]+)\}\}/g, (_, k) => { if (!(k in C)) throw new Error(`Dato de contacto desconocido: ${k}`); return C[k]; })
    .replace(/\{\{tel\}\}/g, `tel:${C.telefonoIntl}`)
    .replace(/\{\{wa:([^}]+)\}\}/g, (_, t) => escAttr(wa(t)))
    .replace(/\{\{wa\}\}/g, wa())
    .replace(/\{\{url\}\}/g, URL_BASE)
    .replace(/\{\{dominio\}\}/g, new URL(URL_BASE).host)
    .replace(/\{\{dominioAnual\}\}/g, negocio.dominioAnual.replace(/ €/g, "&nbsp;€"))
    .replace(/\{\{datos-precios\}\}/g, () => `<script type="application/json" id="datos-precios">${jsonSeguro({ servicios: negocio.servicios, extras: negocio.extras, whatsapp: C.whatsapp })}</script>`)
    .replace(/\{\{(\w+)\}\}/g, (m, k) => (k in ctx ? ctx[k] : m));
}

async function listar(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listar(p)));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out.sort();
}

function salidaDe(ruta) {
  if (ruta === "/") return "index.html";
  if (ruta.endsWith("/")) return ruta.slice(1) + "index.html";
  return ruta.slice(1) + ".html";
}

// Versión de cada recurso (para que el navegador no use una copia vieja tras publicar)
const versiones = {};
async function version(ruta) {
  if (!versiones[ruta]) versiones[ruta] = createHash("md5").update(await readFile(join(PUB, ruta))).digest("hex").slice(0, 8);
  return `${ruta}?v=${versiones[ruta]}`;
}

// ---------- datos estructurados ----------
const ID_NEGOCIO = `${URL_BASE}/#negocio`;

function ofertaDe(clave) {
  const s = dato(clave);
  const oferta = { "@type": "Offer", priceCurrency: "EUR", availability: "https://schema.org/InStock", url: URL_BASE + (s.ruta || "/precios/") };
  if (s.precio != null && s.cuota != null) {
    oferta.price = String(s.precio);
    oferta.priceSpecification = [
      { "@type": "UnitPriceSpecification", price: String(s.precio), priceCurrency: "EUR", description: "Alta (precio de partida)" },
      { "@type": "UnitPriceSpecification", price: String(s.cuota), priceCurrency: "EUR", unitCode: "MON", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" }, description: s.consumo ? "Cuota mensual más consumo" : "Cuota mensual" },
    ];
  } else if (s.cuota != null) {
    oferta.price = String(s.cuota);
    oferta.priceSpecification = { "@type": "UnitPriceSpecification", price: String(s.cuota), priceCurrency: "EUR", unitCode: "MON", referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" }, description: "Cuota mensual (precio de partida)" };
  } else {
    oferta.price = String(s.precio);
    oferta.priceSpecification = { "@type": "PriceSpecification", minPrice: String(s.precio), priceCurrency: "EUR", description: "Precio de partida; el precio final se da cerrado y por escrito" };
  }
  return oferta;
}

function servicioLD(clave) {
  const s = dato(clave);
  return { "@type": "Service", name: s.nombre, provider: { "@id": ID_NEGOCIO }, areaServed: [{ "@type": "City", name: "Sevilla" }, { "@type": "Country", name: "España" }], offers: ofertaDe(clave) };
}

function profesionalLD() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": ID_NEGOCIO,
    name: sitio.nombre,
    description: "Diseño, arreglo y mantenimiento de páginas web para negocios, herramientas de gestión a medida y automatizaciones con inteligencia artificial. Base en Sevilla y trabajo en remoto para cualquier país.",
    url: URL_BASE + "/",
    telephone: C.telefonoIntl,
    email: C.correo,
    image: `${URL_BASE}/og/inicio.png`,
    priceRange: "€€",
    address: { "@type": "PostalAddress", addressLocality: "Sevilla", addressRegion: "Andalucía", addressCountry: "ES" },
    areaServed: [{ "@type": "City", name: "Sevilla" }, { "@type": "Country", name: "España" }, { "@type": "Place", name: "Cualquier país, en remoto" }],
    availableLanguage: [{ "@type": "Language", name: "Español" }],
    knowsAbout: ["Diseño web", "Desarrollo web", "HTML", "CSS", "JavaScript", "WordPress", "Shopify", "Diseño responsive", "Mantenimiento web", "Automatización con inteligencia artificial", "Herramientas de gestión a medida"],
    founder: { "@type": "Person", name: C.nombre, jobTitle: "Desarrollador web" },
    openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "19:00" }],
    makesOffer: Object.keys(negocio.servicios).map((k) => ({ ...ofertaDe(k), itemOffered: { "@type": "Service", name: negocio.servicios[k].nombre } })),
  };
}

function faqLD(html) {
  const preguntas = [...html.matchAll(/<details class="pregunta"[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<div class="respuesta"[^>]*>([\s\S]*?)<\/div>\s*<\/details>/g)];
  if (!preguntas.length) return null;
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: preguntas.map((m) => ({ "@type": "Question", name: quitarHtml(m[1]), acceptedAnswer: { "@type": "Answer", text: quitarHtml(m[2]) } })) };
}

function migasLD(migas) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [["Inicio", "/"], ...migas].map(([n, r], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: URL_BASE + r })) };
}

// ---------- construcción ----------
const base = await readFile(join(SRC, "plantilla/base.html"), "utf8");
const paginas = [];

for (const archivo of await listar(join(SRC, "paginas"))) {
  const bruto = await readFile(archivo, "utf8");
  const m = bruto.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) throw new Error(`Falta el bloque <!--meta --> en ${archivo}`);
  const meta = JSON.parse(m[1]);
  const cuerpo = await sustituir(bruto.slice(m[0].length));
  const ruta = meta.ruta;
  const indexable = meta.indexable !== false;
  const url = URL_BASE + ruta;

  // Datos estructurados
  const ld = [];
  if (ruta === "/") ld.push(profesionalLD());
  if (meta.servicios) ld.push({ "@context": "https://schema.org", "@graph": meta.servicios.map(servicioLD) });
  const faq = faqLD(cuerpo);
  if (faq) ld.push(faq);
  if (meta.migas) ld.push(migasLD(meta.migas));
  const jsonld = ld.map((o) => `<script type="application/ld+json">${jsonSeguro(o)}</script>`).join("\n");

  // Migas visibles
  const migasHtml = meta.migas
    ? `<nav class="migas env" aria-label="Estás en"><ol><li><a href="/">Inicio</a></li>${meta.migas.map(([n, r], i) => (i === meta.migas.length - 1 ? `<li><span aria-current="page">${n}</span></li>` : `<li><a href="${r}">${n}</a></li>`)).join("")}</ol></nav>`
    : "";

  const scripts = [];
  for (const js of meta.js || []) scripts.push(`<script type="module" src="${await version(`/assets/js/${js}.js`)}"></script>`);

  const og = meta.og || (ruta === "/" ? "inicio" : ruta.replace(/^\/|\/$/g, "").replace(/\//g, "-"));
  let html = await sustituir(base, {
    titulo: meta.titulo,
    descripcion: escAttr(meta.descripcion),
    canonical: url,
    robots: indexable ? '<meta name="robots" content="index,follow,max-image-preview:large">' : '<meta name="robots" content="noindex,follow">',
    ogTitulo: escAttr(meta.ogTitulo || meta.titulo),
    ogDescripcion: escAttr(meta.ogDescripcion || meta.descripcion),
    ogImagen: `${URL_BASE}/og/${meta.ogImagen || og}.png`,
    ogAlt: escAttr(meta.ogAlt || meta.ogTitulo || meta.titulo),
    jsonld,
    scripts: scripts.join("\n"),
    clase: meta.clase || "",
    migas: migasHtml,
    contenido: cuerpo,
    origen: relative(RAIZ, archivo),
    cssSitio: await version("/assets/css/sitio.css"),
    jsSitio: await version("/assets/js/sitio.js"),
  });

  // Enlace activo en la navegación: página exacta = "page"; sección = "true"
  html = html.replace(/<a ([^>]*?)href="(\/[^"#?]*)"([^>]*?) data-nav([^>]*)>/g, (todo, a, href, b, c) => {
    let actual = "";
    if (href === ruta) actual = ' aria-current="page"';
    else if (href !== "/" && ruta.startsWith(href)) actual = ' aria-current="true"';
    return `<a ${a}href="${href}"${b}${actual}${c}>`;
  });

  const restos = html.match(/\{\{[^}]*\}\}/g);
  if (restos) throw new Error(`Marcas sin sustituir en ${archivo}: ${[...new Set(restos)].join(", ")}`);

  const destino = join(PUB, salidaDe(ruta));
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, html);
  paginas.push({ ruta, indexable, titulo: meta.titulo, descripcion: meta.descripcion, llms: meta.llms });
  console.log(`  ${ruta.padEnd(38)} -> public/${salidaDe(ruta)}`);
}

// ---------- sitemap, robots, llms.txt ----------
const fecha = sitio.fechaActualizacion;
const indexables = paginas.filter((p) => p.indexable && p.ruta !== "/404");
await writeFile(join(PUB, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  indexables.map((p) => `  <url>\n    <loc>${URL_BASE}${p.ruta}</loc>\n    <lastmod>${fecha}</lastmod>\n  </url>`).join("\n") +
  `\n</urlset>\n`);

await writeFile(join(PUB, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${URL_BASE}/sitemap.xml\n`);

const S = negocio.servicios, E = negocio.extras;
const txt = (n) => `${n.toLocaleString("es-ES")} €`;
const lineaServicio = (k) => {
  const s = S[k];
  if (s.precio != null && s.cuota != null) return `- ${s.nombre}: desde ${txt(s.precio)} de alta + ${txt(s.cuota)} al mes${s.consumo ? " y consumo" : ""}.`;
  if (s.cuota != null) return `- ${s.nombre}: desde ${txt(s.cuota)} al mes (opcional).`;
  return `- ${s.nombre}: desde ${txt(s.precio)}.`;
};
const llms = `# ${sitio.nombre}

> ${C.nombre} es desarrollador web freelance con base en Sevilla (España) que trabaja también en remoto para cualquier país. Hace webs para negocios pequeños, arregla y revisa webs que ya existen, crea herramientas de gestión a medida y monta automatizaciones con inteligencia artificial. Precio cerrado y por escrito antes de empezar; el dominio y el alojamiento van siempre a nombre del cliente; sin cuota obligatoria por la web.

## Contacto

- Teléfono y WhatsApp: ${C.telefonoVisibleIntl} (${wa()})
- Correo: ${C.correo}
- Horario: ${C.horario}. Suele contestar el mismo día.
- Zona: base en Sevilla (presencial si el cliente está cerca) y en remoto para cualquier país.

## Servicios y precios (precios de partida; el precio final se da cerrado y por escrito)

${["arreglo", "revision", "web_una", "web_completa", "herramienta", "mantenimiento"].map(lineaServicio).join("\n")}
- Extras sobre una web: ${Object.values(E).map((e) => `${e.nombre.toLowerCase()} +${txt(e.precio)}`).join(", ")}.
- Dominio y alojamiento: no incluidos; ${negocio.dominioAnual}, a nombre del cliente y con su tarjeta.

### Automatizaciones con IA (alta + cuota mensual)

${["asistente", "correo", "llamadas"].map(lineaServicio).join("\n")}
- Todo lo que monta avisa de que es una inteligencia artificial desde el principio (Reglamento europeo de IA), no imita a una persona y pasa con el dueño si se lo piden.

## Cómo trabaja

- 1) Hablan y, si ya hay web, la revisa antes. 2) Presupuesto cerrado por escrito con lo que incluye, lo que no y el plazo. 3) La construye y la enseña a medias. 4) Se publica en el alojamiento del cliente, a su nombre.
- Dos rondas de cambios tras la entrega. Pago 50 % al empezar y 50 % al entregar.
- Plazos: web de una página, ${S.web_una.plazo}; web completa, ${S.web_completa.plazo}; desde que recibe textos y fotos.
- Ofrece mirar una web gratis y sin compromiso: basta con mandarle la dirección por WhatsApp.

## Páginas

${indexables.map((p) => `- [${quitarHtml(p.titulo)}](${URL_BASE}${p.ruta}): ${p.descripcion}`).join("\n")}

## Trabajos de ejemplo

Son demostraciones con negocios ficticios (no clientes reales): Bar Almanaque (bar de tapas), Estudio Malva (peluquería), Clínica Arenal (clínica dental), La Despensa de Triana (tienda de alimentación) y Academia Compás (herramienta de gestión de alumnos).
`;
await writeFile(join(PUB, "llms.txt"), llms);

console.log(`\n${paginas.length} páginas generadas · sitemap.xml (${indexables.length} URL) · robots.txt · llms.txt`);

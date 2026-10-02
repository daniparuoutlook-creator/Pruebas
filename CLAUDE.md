# Web de Daniel Padilla · Desarrollo Web

Web profesional de Daniel Padilla Ruiz (Dani), desarrollador web freelance en Sevilla que trabaja también en remoto. La web es su escaparate: tiene que vender webs, arreglos de webs, herramientas a medida y automatizaciones con IA a negocios pequeños (bares, peluquerías, clínicas, tiendas, academias).

Antes de tocar nada, lee en este orden:
1. Este archivo (reglas que no se negocian)
2. `docs/BRIEF-REDISENO.md` (el encargo actual)
3. `docs/NEGOCIO.md` (servicios, precios y tono: es la fuente de verdad)
4. `docs/ESTADO-ACTUAL.md` (qué hay hoy y cómo funciona)
5. `docs/FUTURO.md` (lo que viene después, para no cerrarle puertas)

Idioma de trabajo, de la web y de los commits: **español de España**, tuteando al visitante.

---

## 1. Cómo quiere Dani que trabajes

- Directo y concreto. Resultados, no narración del proceso.
- Sé sincero aunque no sea lo que quiere oír. Si algo del brief es mala idea, dilo con motivos y propone alternativa.
- No inventes datos: precios, plazos y servicios salen de `docs/NEGOCIO.md`. Si algo no está ahí, pregunta o déjalo marcado como `[PENDIENTE: ...]`.
- **No afirmes nunca que algo funciona sin haberlo comprobado** (Playwright, capturas, medidas). Si algo no se puede comprobar aquí (por ejemplo, el chat real con la API), dilo claramente.
- Trabaja por fases y haz commit al final de cada fase con un mensaje claro en español.

## 2. El móvil va primero. Siempre.

El 99 % de quien entra lo hace desde el móvil. Se diseña y se construye primero a 360 px y luego se amplía. Nada se da por bueno sin verificarlo así.

Reglas de oro (todas han fallado alguna vez; no repetirlas):

1. **Nunca `padding: X 0`** (ni `padding-inline: 0`) en una clase que comparta elemento con el contenedor de márgenes laterales (ej. `class="bloque env"`). El `0` borra el margen lateral y el texto queda pegado al borde. Usa `padding-top` / `padding-bottom` por separado.
2. **`clientWidth` incluye el padding.** Para calcular el espacio disponible hay que restar `paddingLeft` y `paddingRight` del estilo calculado, o el contenido desborda.
3. **Un iframe interactivo dentro de una vista previa atrapa el dedo en móvil.** Las vistas previas de demos llevan `pointer-events:none` (o una capa encima) y el scroll de la página nunca debe quedarse atrapado dentro.
4. **Contraste medido, no a ojo**: 4,5:1 texto normal, 3:1 texto grande y componentes. Ya falló con un naranja (2,79:1). Mide cada pareja de color nueva.
5. Zonas táctiles de **44 × 44 px mínimo**, incluidos logos, enlaces del pie y botones de icono.
6. **Prohibido el scroll horizontal** en cualquier ancho (320-1920 px), también con menús, paneles o el chat abiertos.
7. Nada de texto por debajo de 12 px. Inputs a 16 px (evita el zoom de iOS).
8. Respetar `env(safe-area-inset-*)` en todo lo fijo (cabecera, barras inferiores, botón del chat).
9. Nada de `100vh` a secas en móvil: `100dvh` / `100svh` con `100vh` como respaldo.

## 3. Movimiento y efectos: con intención, no por decoración

Dani quiere una web visual, interactiva y con movimiento. Sí, pero cada animación tiene que tener un motivo (orientar, dar respuesta a una acción, contar algo). Reglas:

- **`prefers-reduced-motion: reduce`** desactiva el movimiento (no el color ni el contenido). Todo debe funcionar y verse completo sin animaciones y sin JavaScript (mejora progresiva).
- Anima solo `transform` y `opacity` (y `clip-path` con cuidado). Nunca `width/height/top/left` en bucle.
- Curva de salida de la casa: `cubic-bezier(.23,1,.32,1)`. Duraciones de interfaz 150-300 ms; entradas de sección 400-700 ms como mucho.
- **Prohibido el "aparece al hacer scroll" en todas las secciones** (delata web genérica). Elige pocos momentos fuertes y bien hechos.
- **Prohibido secuestrar el scroll** (nada de Lenis/smooth-scroll que cambie el desplazamiento nativo del móvil, ni secciones fijadas eternas en móvil). Un `pin` de ScrollTrigger solo en escritorio y solo si cuenta algo.
- Nada de cursores personalizados (el público es móvil y no aportan).
- Herramientas, en este orden de preferencia: CSS nativo (transiciones, `@starting-style`, animaciones ligadas al scroll con `@supports`), **View Transitions API** entre páginas (mejora progresiva), y **GSAP** (gratis para uso comercial, con todos sus plugins) solo donde CSS no llega. GSAP **autoalojado** en `public/assets/vendor/`, nunca desde CDN.
- Presupuesto: JavaScript total de la página ≤ 90 KB comprimido (sin contar el chat). Si un efecto no cabe, se quita el efecto.

## 4. Lo que delata un diseño genérico de IA (evitarlo)

Borde fino + sombra ancha a la vez · fondos de rayas diagonales · texto con degradado · cristal esmerilado (glassmorphism) · degradados morados/azules de SaaS · tarjetas idénticas en rejilla de 3 para todo · iconos de librería genérica en cada título · Instrument Serif o Fraunces · emojis como iconos · frases de relleno tipo "Soluciones innovadoras para tu negocio" · contadores de "+100 clientes felices" inventados.

La web vende a negocios de barrio y de Sevilla: tiene que sonar a persona real, concreta y honesta. Nada de testimonios, cifras ni clientes inventados. Las demos son negocios ficticios y se dice claramente.

## 5. Skills disponibles en `.claude/skills/` (úsalas)

- **frontend-design** (Anthropic): dirección estética, evitar lo genérico. Para decidir la dirección visual.
- **design-taste-frontend**: anti-plantilla y comprobación previa estricta. Complementa a la anterior.
- **redesign-existing-projects**: auditar la web actual antes de rehacerla, sin romper lo que funciona.
- **impeccable**: crítica, auditoría, pulido, accesibilidad, responsive. Tiene un **detector automático**:
  `.claude/skills/impeccable/scripts/impeccable detect --json <archivo.html>` (si da "Permission denied": `chmod +x` al script). Pásalo a **cada página** antes de dar una fase por terminada.
- **emil-design-eng** y **animate**: criterio de animación (cuándo sí, cuánto, qué curva) y construcción paso a paso.
- **gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-plugins, gsap-performance, gsap-utils** (oficiales de GreenSock): uso correcto de GSAP en JavaScript sin framework.

Si dos skills se contradicen en estética, manda este archivo y después `docs/BRIEF-REDISENO.md`. Una sola dirección visual para toda la web; no mezcles estilos.

## 6. Arquitectura técnica (no cambiar sin motivo)

- **Cloudflare Worker con Static Assets.** `worker.js` sirve `/api/chat` y todo lo demás lo sirve `env.ASSETS` desde `public/`.
- `wrangler.jsonc`: `assets.directory = ./public`, binding `ASSETS`, limitador `CHAT_LIMITER` (10 mensajes/60 s por IP), variable `ALLOWED_ORIGINS`. **No quites ni renombres nada de ahí.**
- El secreto `ANTHROPIC_API_KEY` vive solo en Cloudflare. **Nunca** lo pongas en ningún archivo, ni de ejemplo con un valor que parezca real.
- **No despliegues.** No ejecutes `wrangler deploy`, `wrangler login` ni nada contra Cloudflare. Dani despliega desde su ordenador con `npx wrangler deploy`.
- Sin frameworks ni bundlers: HTML + CSS + JavaScript sin dependencias de ejecución salvo GSAP autoalojado. Con varias páginas, el CSS y el JS comunes van en archivos compartidos (`public/assets/css/…`, `public/assets/js/…`) para que el navegador los cachee.
- Rutas limpias: Cloudflare sirve `public/servicios/index.html` en `/servicios/` y `public/aviso-legal.html` en `/aviso-legal`. Usa carpetas con `index.html` para las páginas nuevas.
- Tipografías y fotos **autoalojadas** (la política de privacidad dice que la web no conecta con terceros salvo lo que se declare; si se quita Google Fonts, se actualiza ese párrafo).

### El asistente de IA (widget de chat): intocable en su funcionamiento

Está al final de `public/index.html` (bloque `<!-- Asistente IA -->` … `<!-- /Asistente IA -->`). Puedes rediseñarlo visualmente y sacarlo a archivos compartidos para que esté en **todas las páginas**, pero conserva exactamente:
- El contrato con el Worker: `POST /api/chat` con `{messages:[{role,content}]}` → `{reply, handoff}`. Máx. 16 mensajes y 1000 caracteres.
- El aviso visible de que es una IA y no Daniel (lo exige el Reglamento europeo de IA).
- El bloque de "pasar con Daniel" (llamar / WhatsApp) cuando `handoff` es `true` o hay error.
- El enlazado seguro de URLs y teléfonos (solo dominios permitidos), el ajuste al teclado móvil con `visualViewport`, cerrar con Escape, foco accesible.
- Los disparadores `[data-ia-open]` (cualquier botón con ese atributo abre el chat).

Si cambian páginas, demos o precios, actualiza también el texto `SYSTEM` de `worker.js` para que el asistente no diga cosas que la web ya no dice.

## 7. Cómo se prueba (obligatorio antes de dar algo por bueno)

1. `node scripts/dev-server.mjs` → http://localhost:8787 (sirve `public/` como Cloudflare y **simula** `/api/chat`; el chat real no se puede probar aquí).
2. Playwright (ya instalado con Chromium; no ejecutes `playwright install`). Para **cada página**, a **360, 390, 768 y 1280 px**:
   - captura de página completa y revísala como imagen, trozo a trozo;
   - mide: `scrollWidth` ≤ ancho de ventana, zonas táctiles < 44 px, texto < 12 px, márgenes laterales reales del contenido (≥ 16 px en móvil);
   - comprueba consola sin errores y sin peticiones 404;
   - repite con `reducedMotion: 'reduce'` y comprueba que todo el contenido se ve.
3. Contraste de cada pareja de colores nueva (calcúlalo, no lo supongas).
4. `impeccable detect --json` en cada página. Los avisos `clipped-overflow-container` de `html`/`body` ya existían (vienen de `overflow-x:hidden`); el resto se arregla o se justifica.
5. Rendimiento: imágenes en AVIF/WebP con `width`/`height`, `loading="lazy"` fuera de la primera pantalla, fuentes en `woff2` con `font-display:swap` y precarga solo de la principal. Si puedes, pasa Lighthouse móvil (`npx lighthouse`) y apunta las cifras.
6. Enlaces internos: ninguno roto (rastrea todas las páginas con un script).

## 8. SEO y GEO (que Google y los asistentes de IA entiendan la web)

- Cada página: `<title>` y `meta description` propios, `canonical`, Open Graph, un solo `h1`, jerarquía de títulos limpia.
- Datos estructurados JSON-LD: `ProfessionalService` en inicio, `Service` + `Offer` en cada servicio (las cuotas mensuales con `UnitPriceSpecification` y `unitCode: "MON"`), `FAQPage` donde haya preguntas, `BreadcrumbList` en páginas internas.
- `sitemap.xml` con todas las páginas indexables y `lastmod` real. `robots.txt` **sin** `Disallow: /demos/` (las demos ya llevan `noindex,nofollow` y Google necesita poder leerlo).
- Añade `public/llms.txt` con un resumen factual del negocio, servicios, precios y enlaces.
- Todas las URL absolutas (canonical, OG, sitemap, JSON-LD, páginas legales) salen del mismo dominio. Hoy es `https://web.daniparuoutlook.workers.dev`; Dani cambiará pronto a `webpadilla.com`. Deja una lista en `docs/CAMBIO-DE-DOMINIO.md` de cada archivo y línea a cambiar.

## 9. Lo que no se toca sin permiso de Dani

- Precios y servicios (fuente: `docs/NEGOCIO.md`).
- Datos legales de `aviso-legal.html` y `privacidad.html` (sí puedes rediseñarlas visualmente y actualizar el párrafo de terceros si cambian las conexiones externas).
- Las 5 demos de `public/demos/` funcionan y son el portafolio: no las rehagas. Sí puedes mejorar cómo se presentan (tarjetas, páginas de caso, capturas).
- `worker.js` (salvo el texto `SYSTEM`) y `wrangler.jsonc`.

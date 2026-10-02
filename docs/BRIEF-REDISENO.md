# Encargo: rediseño completo de la web de Daniel Padilla

## Qué queremos

Pasar de una sola página larga a **una web de varias páginas, muy profesional, visual e interactiva, con movimiento y efectos**, que haga que el dueño de un bar o de una peluquería piense en los primeros cinco segundos: *"este chaval sabe lo que hace, y me lo explica claro"*.

La web es a la vez **el escaparate y la prueba**: Dani vende webs que cargan rápido en el móvil y están bien hechas. Si la suya es lenta, se rompe en un móvil o parece una plantilla, el argumento de venta se cae. Por eso:

> **Ambición visual máxima, pero dentro de las reglas de `CLAUDE.md`**: móvil primero, rápida, accesible, sin trucos genéricos. Imaginación sí; ruido no.

Objetivos medibles:
- Lighthouse móvil: Rendimiento ≥ 90, Accesibilidad 100, Buenas prácticas ≥ 95, SEO 100 (en cada página principal).
- LCP < 2,5 s en 4G simulado, CLS < 0,05, sin scroll horizontal en 320-1920 px.
- Cada página entendible con JavaScript desactivado y con movimiento reducido.
- Cada página termina en una acción clara: llamar, WhatsApp, calcular presupuesto o "mira mi web gratis".

---

## Dirección creativa

**Concepto central: "el marcador".** Dani es el que revisa las webs y señala lo que falla. La identidad actual (papel, tinta, azul y un **marcador amarillo `#FFE24A`**) ya cuenta eso. Evoluciónala, no la tires:

- El **subrayado/trazo de marcador** como gesto de marca: se dibuja sobre las palabras clave (una o dos por página, no en todas partes), rodea fallos en las capturas, tacha lo que se arregla.
- Mezcla de **"papel de trabajo"** (anotaciones, presupuesto impreso, notas al margen, flechas a mano) con **precisión técnica** (medidas en px, rejillas, números tabulares). Taller de un profesional, no agencia de diseño.
- Tipografía con carácter para titulares (Bricolage Grotesque funciona; puedes proponer otra si la justificas, evitando Instrument Serif y Fraunces) y una de texto muy legible. **Autoalojadas** en `woff2` (paquetes `@fontsource` de npm).
- Fotografía y capturas: reales y propias. Genera con Playwright **capturas de las demos** (390 px y 1280 px), optimízalas a AVIF/WebP y úsalas en tarjetas y páginas de caso. Nada de fotos de stock de "equipo sonriendo con portátil".
- Foto de Dani en "Sobre mí": déjala como `[PENDIENTE: foto de Dani]` con un hueco bien diseñado que funcione también sin foto.

Antes de construir, carga las skills `frontend-design`, `design-taste-frontend` y `redesign-existing-projects`, y propón la dirección (ver Fase 1).

---

## Mapa de la web

| Ruta | Página | Qué tiene que conseguir |
|---|---|---|
| `/` | Inicio | Enganchar en 5 s, explicar qué hace Dani, enseñar que sabe (hallazgos reales, antes/después), llevar a servicios, trabajos o contacto. |
| `/servicios/` | Servicios | Vista general de los 4 bloques con precio "desde" y a quién le sirve cada uno. |
| `/servicios/webs/` | Webs para negocios | Web de una página y web completa, mantenimiento, qué incluye y qué no, plazos, ejemplos. |
| `/servicios/arreglos/` | Arreglos y revisión | Arreglo puntual y revisión y puesta al día. Aquí brillan los **hallazgos reales** y la oferta de "te miro la web gratis". |
| `/servicios/automatizaciones-ia/` | Automatizaciones con IA | Asistente web, respuestas de correo, atención de llamadas. Alta + cuota y por qué. Aviso legal de IA. Simulaciones interactivas. |
| `/servicios/herramientas-a-medida/` | Herramientas a medida | "Lo que hoy llevas en una libreta". Academia Compás como caso. |
| `/precios/` | Precios | **La calculadora** a pantalla completa, tabla de precios, qué entra en cada uno, preguntas sobre dinero (50/50, dominio a tu nombre, cuotas). |
| `/trabajos/` | Trabajos | Portafolio por grupos (ver abajo), filtros, visor de pantallas rehecho. |
| `/trabajos/bar-almanaque/` · `/trabajos/estudio-malva/` · `/trabajos/clinica-arenal/` · `/trabajos/la-despensa/` · `/trabajos/academia-compas/` | Páginas de caso | El negocio (ficticio), el problema típico de ese sector, qué hace la web y por qué, decisiones de diseño, capturas móvil/escritorio, botón "Abrir la demo". |
| `/como-trabajo/` | Cómo trabajo | Los 4 pasos, garantías (precio cerrado, dos rondas, 50/50, todo a tu nombre), plazos, qué necesito para empezar, preguntas frecuentes. |
| `/sobre-mi/` | Sobre mí | Quién es Dani, formación, cómo trabaja, por qué solo cambia lo que le piden. Cercano y sin inflar. |
| `/contacto/` | Contacto | Llamar, WhatsApp, correo, horario. Mensaje de WhatsApp pre-escrito según lo que busque. |
| `/revision-gratis/` | Te miro la web gratis | Página de captación: qué revisa, qué recibe, en cuánto tiempo, sin compromiso. Botón de WhatsApp con mensaje "Hola Daniel, ¿me miras la web? Es: …". |
| `/aviso-legal`, `/privacidad`, `404` | Legales y error | Mismo diseño que el resto. Contenido legal intacto. |
| `/demos/*.html` | Demos | **No se rehacen.** Siguen `noindex`. Solo se enlazan desde los casos. |

Navegación: cabecera con Servicios · Trabajos · Precios · Cómo trabajo · Contacto, y botón destacado de contacto. En móvil, menú a pantalla completa accesible (foco atrapado, Escape, enlaces de 48 px) y una **barra inferior fija** con *Llamar · WhatsApp · Pregunta a la IA* (este último con `data-ia-open`; en móvil oculta el botón flotante del chat para que no se pisen). Pie completo con todas las páginas, contacto y legales.

### Grupos de Trabajos (respetar exactamente)

1. **Webs para negocios** (sin asistente de IA): Bar Almanaque, Clínica Arenal, Estudio Malva, La Despensa.
2. **Webs con asistente de IA**: 2 huecos **"En mantenimiento"** (demos todavía por hacer).
3. **Reservas y pedidos**: 4 huecos **"En mantenimiento"** — 2 peluquerías y 2 restaurantes (Dani las hará con Lovable).
4. **Herramientas a medida**: Academia Compás.

Los huecos tienen que verse **intencionados y bonitos** (no rotos): por ejemplo, una ficha "en obras" con el marcador, sector y "Próximamente". Diseña la tarjeta para que sustituir un hueco por una demo real sea copiar un bloque, y documenta cómo en un comentario.

---

## Momentos estrella (ideas; adáptalas, mejóralas o propón otras mejores)

Elige los que mejor funcionen y hazlos **muy bien**. Cada uno con versión móvil táctil, versión sin JavaScript y versión con movimiento reducido.

1. **Antes / después arrastrable en la portada.** Una web de negocio de barrio "rota" (texto pegado al borde, botón que no se ve, horario desactualizado, "Your Content Goes Here") frente a la misma arreglada, construida en HTML/CSS (no imágenes). El visitante arrastra el separador con el dedo; el marcador va señalando cada fallo. Una pista animada una sola vez invita a arrastrar.
2. **Hallazgos reales como expedientes.** Las 4 historias reales de la portada actual convertidas en fichas que se abren: qué pasaba, qué le costaba al negocio, cuánto se tardó en arreglar. Una recreación visual del fallo con el marcador rodeándolo.
3. **El presupuesto que se escribe solo.** La calculadora como una hoja de presupuesto en papel: cada opción que marcas se escribe como línea, el total sube con un contador animado, la cuota mensual va en línea aparte. Botón final **"Enviarle esto a Daniel por WhatsApp"** con el desglose ya escrito. En móvil, barra fija inferior con el total mientras haya algo elegido. Valores exactos en `docs/ESTADO-ACTUAL.md` y `docs/NEGOCIO.md`.
4. **Visor de pantallas que se transforma.** Un marco de dispositivo que pasa de móvil a tablet a escritorio con una transición fluida (GSAP Flip o CSS). En móvil usa **capturas**, no iframes vivos (evita el dedo atrapado y pesa menos); en escritorio puede usar iframe con `pointer-events:none` y botón "Abrir la demo".
5. **Simulaciones de las automatizaciones** (rotuladas claramente como *simulación*): una bandeja de correo donde los mensajes se clasifican y responden solos; una transcripción de llamada que empieza diciendo "Soy un asistente de inteligencia artificial…" y termina con el recado enviado al dueño; y el asistente real: "Pruébalo tú, este chat es uno de ellos" (`data-ia-open`).
6. **Transiciones entre páginas** con la View Transitions API entre documentos (`@view-transition { navigation: auto; }`): la captura de una tarjeta de trabajo se convierte en la cabecera de su página de caso. Mejora progresiva: sin soporte, navegación normal.
7. **El proceso como un trazo**: los 4 pasos unidos por una línea de marcador que se dibuja ligada al scroll (animación de CSS ligada al scroll con `@supports`, o ScrollTrigger con `scrub` en escritorio). En móvil, vertical y sencillo.
8. **Filtros de trabajos con reordenación animada** (Flip).
9. **404 con gracia**: el marcador tacha la URL rota. "Es justo el tipo de fallo que reviso".
10. **Microinteracciones**: botones que responden al toque (escala .97), copiar el teléfono con aviso, enlaces con subrayado de marcador, contadores tabulares.

Prohibido: partículas, fondos 3D/WebGL pesados, cursor personalizado, scroll secuestrado, apariciones en cada sección, carruseles automáticos, vídeo de fondo.

---

## Contenido y textos

- Reutiliza y mejora los textos actuales de `public/index.html`: ya están escritos con el tono correcto. Las páginas nuevas necesitan texto nuevo: escríbelo con el tono de `docs/NEGOCIO.md` (concreto, cercano, comprobable).
- Nada inventado: ni clientes, ni testimonios, ni cifras de "proyectos entregados". Si una sección pediría testimonios, diséñala para el futuro y déjala comentada y oculta.
- Los precios salen siempre de `docs/NEGOCIO.md`. Centralízalos en un solo sitio de JavaScript o en atributos `data-` para que la calculadora y las páginas no se desincronicen.
- Cada página de servicio incluye: a quién le sirve, qué incluye, qué **no** incluye, precio "desde", plazo, ejemplo (enlace a un caso), preguntas frecuentes de ese servicio y llamada a la acción.

---

## Fases de trabajo (commit al final de cada una)

**Fase 0 · Auditoría** (skill `redesign-existing-projects` + `impeccable`). Lee todo, prueba la web actual a 360/390/1280 px, y escribe `docs/AUDITORIA.md`: qué funciona y se conserva, qué falla, riesgos.

**Fase 1 · Dirección y arquitectura → PARA Y ESPERA A DANI.** Escribe `docs/DIRECCION.md` con:
- 2 direcciones visuales distintas (ambas evolución de "el marcador"), cada una con paleta (contrastes medidos), tipografías, ejemplo de titular, gesto de movimiento principal, y una **maqueta real de la portada (primera pantalla) a 390 px y a 1280 px** con capturas en `docs/capturas/`.
- Estructura de archivos y plantilla común (cómo se comparten cabecera, pie, chat y estilos sin bundler; si hace falta un script de generación muy simple en Node para no repetir cabecera/pie en 20 páginas, propónlo).
- Qué momentos estrella vas a hacer y cuáles descartas y por qué.
Termina con un resumen y **no sigas hasta que Dani elija**.

**Fase 2 · Sistema base.** Tokens (color, tipo, espaciado, radios, curvas), fuentes autoalojadas, cabecera/menú/barra móvil/pie, chat extraído a archivos compartidos y presente en todas las páginas, View Transitions, GSAP autoalojado si se usa, script de comprobaciones (`scripts/comprobar.mjs`: rastreo de enlaces, medidas de Playwright y capturas por página y ancho).

**Fase 3 · Páginas.** Todas las del mapa, con su contenido completo. Primero móvil.

**Fase 4 · Momentos estrella.** Los elegidos en la Fase 1, uno a uno, cada uno verificado en móvil táctil, sin JS y con movimiento reducido.

**Fase 5 · SEO, GEO y asistente.** Metadatos por página, JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`, imágenes OG por página (generadas con Playwright desde una plantilla HTML), `docs/CAMBIO-DE-DOMINIO.md`. Actualiza el texto `SYSTEM` de `worker.js` con páginas, demos y precios nuevos (y quita el desajuste de los extras sin precio). Revisa la privacidad si cambian las conexiones externas (p. ej. sin Google Fonts).

**Fase 6 · Control de calidad y entrega.**
- Pasa todo lo de `CLAUDE.md` §7 en todas las páginas. Arregla lo que salga.
- Lanza un **subagente revisor independiente** (que no haya construido nada) para revisar con ojos nuevos: móvil, accesibilidad, coherencia de precios, enlaces, textos, rendimiento. Corrige lo que encuentre.
- Escribe `docs/INFORME-FINAL.md`: qué se ha hecho, capturas clave, cifras de Lighthouse, lo que queda pendiente y **los pasos exactos para que Dani despliegue**.
- Genera `entrega/web-deploy.zip` con `worker.js`, `wrangler.jsonc` y `public/` (Dani despliega descomprimiéndolo y ejecutando `npx wrangler deploy`).
- Abre un pull request con un resumen claro en español.

Si te quedas sin contexto, compacta y sigue: el plan vive en estos documentos, no en tu memoria.

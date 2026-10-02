# Auditoría de la web actual (Fase 0)

Fecha: 2 de octubre de 2026. Objeto: lo que hay hoy en `public/` (idéntico a lo publicado en `web.daniparuoutlook.workers.dev`).

## Resumen en diez líneas

1. **La base es buena.** Sin scroll horizontal en ningún ancho, márgenes laterales reales de 16 px en móvil, ningún texto por debajo de 12 px, todos los textos pasan contraste AA, CLS 0 y JavaScript que no bloquea (TBT 0 ms). Lighthouse móvil en la portada: **85 · 100 · 96 · 100**.
2. **Lo más valioso es el contenido**, no la forma: los cuatro hallazgos reales, los precios cerrados y el tono. Todo eso se conserva.
3. **La forma es genérica.** Quitando el nombre, la portada podría ser la de cualquier freelance: portada partida con tarjeta oscura, lista de precios con filetes, rejilla de tarjetas con etiquetas, acordeón de preguntas, "Paso 1-4" y bloque de contacto oscuro.
4. **Fallo visible nº 1:** en móvil, el botón flotante "Pregunta a la IA" tapa el primer hallazgo en la primera pantalla, y luego una esquina del texto durante todo el scroll.
5. **Fallo visible nº 2:** el visor de pantallas miente. Dice "1280 px · Escritorio" pero pinta la demo a 1022 px y deja una franja blanca de unos 200 px. Pasa en todos los anchos.
6. **Riesgo legal:** la política de privacidad dice que la única conexión externa es Google Fonts y que la web no recoge datos, pero el chat envía lo que escribe el visitante a Anthropic (vía el Worker) y la portada y las demos cargan fotos de `images.unsplash.com`. Hay que actualizarla (necesita tu permiso).
7. **Rendimiento:** Google Fonts bloquea el primer pintado (LCP 3,1 s en móvil simulado; ahorro estimado 1,6 s). Autoalojar las fuentes lo resuelve.
8. **Móvil:** no hay menú. Por debajo de 940 px la navegación desaparece y solo queda el botón de teléfono. En una sola página se aguanta; con 20 páginas no.
9. **La página mide 12.615 px a 390 px de ancho** (unas 16 pantallas de móvil). Todo compite: servicios aparecen dos veces, el visor y las tarjetas cuentan lo mismo, y los hallazgos quedan arriba sin continuidad.
10. **El chat funciona** en lo que importa (aviso de IA, pasar con Daniel, enlaces seguros, teclado móvil), con dos fallos menores de foco y tamaño de botones.

---

## Cómo se ha probado

- `node scripts/dev-server.mjs` y Playwright con Chromium, a **360, 390, 768 y 1280 px**, en las 4 páginas propias (inicio, aviso legal, privacidad, 404) y en las 5 demos. 54 mediciones: 36 con movimiento normal y 18 con `reducedMotion: 'reduce'` (360 y 1280).
- Medido en cada una: `scrollWidth` frente al ancho de ventana, elementos que salen por los lados, zonas táctiles < 44 × 44, texto < 12 px, margen lateral real del texto, número de `h1` y saltos de jerarquía, imágenes sin `alt` o sin `width`/`height`, errores de consola y peticiones fallidas.
- Pruebas de interacción: chat (abrir, enviar, respuesta simulada con paso a Daniel, Escape, foco) a 360 y 1280; visor de pantallas (ancho real pintado, gesto táctil vertical encima con eventos táctiles reales por CDP); portada con JavaScript desactivado.
- Contraste de todas las parejas de color calculado con la fórmula WCAG (script en el anexo).
- Detector de impeccable (`impeccable detect --json`) sobre las 9 páginas.
- Lighthouse 12 móvil sobre inicio y aviso legal.
- Lectura completa del código: `index.html`, legales, 404, `worker.js`, `wrangler.jsonc`, `robots.txt`, `sitemap.xml`, `og.png` y la cabecera de cada demo.

**Límites del entorno (no son fallos de la web):**
- La política de red de este entorno **bloquea `images.unsplash.com` y `web.daniparuoutlook.workers.dev`**. Las fotos de las tarjetas y de las demos no cargan aquí, y Lighthouse se ha pasado contra el servidor local (mismos archivos, pero sin la compresión Brotli de Cloudflare: por eso aparece "Enable text compression", que en producción no aplica).
- El chat real con la API no se puede probar aquí: se ha usado la respuesta simulada del servidor local.

---

## Lo que funciona y se conserva

| Qué | Por qué se conserva |
|---|---|
| **Los 4 hallazgos reales** (carpintería, escuela de idiomas, taller, tienda online) | Es lo más persuasivo de la web: historias verdaderas, concretas y con coste. En el rediseño ganan protagonismo. |
| **Textos y tono** | Cercanos, concretos, comprobables. Se reutilizan casi tal cual. |
| **Precios y lógica del estimador** | Coinciden con `docs/NEGOCIO.md` (comprobado línea a línea). El cálculo es correcto, incluido "Ya tengo web" sin nada marcado. |
| **Las 8 preguntas frecuentes** y su JSON-LD `FAQPage` | Responden a las dudas reales (dinero, dominio, cuotas, plazos). |
| **El chat**: contrato con el Worker, aviso de IA visible, bloque "pasar con Daniel", enlazado seguro (solo `wa.me` y el propio dominio), `visualViewport`, `100dvh`, `safe-area` | Verificado funcionando a 360 y 1280. |
| **Identidad**: tinta `#16191F`, papel `#EDEFF2`, azul `#1F3BD6`, marcador `#FFE24A`, Bricolage Grotesque, curva `cubic-bezier(.23,1,.32,1)` | Es reconocible y ya cuenta "el que revisa y marca". Se evoluciona, no se tira. |
| **Base de accesibilidad**: enlace "Saltar al contenido", foco visible, un solo `h1` por página, textos AA, inputs a 16 px | Lighthouse Accesibilidad 100 en las dos páginas medidas. |
| **Peso**: 181 KB en total sin comprimir, CLS 0, TBT 0 | Hay que mantener este listón con 20 páginas. |
| **Las 5 demos** | Buen nivel, cada una con identidad propia y algo que hace de verdad (horario en vivo, cita por WhatsApp, simulador de cuotas, cesta, gestión de alumnos). No se tocan. |
| **El 404** con "Es justo el tipo de fallo que reviso" | La idea es buena; el brief la lleva más lejos (el marcador tacha la URL). |

---

## Lo que falla

Severidad: **P1** = afecta a la venta, a la ley o a los objetivos medibles; **P2** = molesta o incumple una regla de `CLAUDE.md`; **P3** = pulido.

### P1

**1. El botón flotante del chat tapa contenido en móvil.**
A 390 × 780, al cargar, el botón (200 × 52 px, abajo a la derecha) queda encima del primer hallazgo: tapa "dos direcciones distintas", justo el texto marcado. Luego tapa una esquina del texto durante todo el scroll. Medido con `elementsFromPoint`: debajo del botón está `.hallazgos-sub` a 360 × 740.
Evidencia: `docs/capturas/auditoria/actual-movil-390.png`.
*Solución en el rediseño:* la barra inferior fija del brief (Llamar · WhatsApp · Pregunta a la IA) sustituye al botón en móvil, y el contenido reserva su altura con `padding-bottom`.

**2. El visor de pantallas pinta la demo a un ancho que no es el que dice.**
La regla global `img,svg,iframe,video{max-width:100%}` limita el iframe al ancho del marco **antes** de escalarlo. A 1280 px de ventana: el iframe pide 1280 px, se queda en 1022 px, se escala ×0,80 y ocupa 816 px de un marco de 1022: franja blanca de ~200 px a la derecha y una demo que no está a 1280 px. A 390 px pasa lo mismo (pide 360, pinta 328). Es el escaparate de "webs que se adaptan" y se ve roto.
Evidencia: `docs/capturas/auditoria/actual-visor-1280.png`.
*Solución:* el brief ya pide rehacer el visor con capturas en móvil. Si se mantiene un iframe en escritorio, `max-width:none` en ese iframe.

**3. La política de privacidad no cuenta todo lo que hace la web.** *(Contenido legal: necesita tu permiso para cambiarlo.)*
- Dice que "esta web no dispone de formularios" y que "no se recoge ningún dato", pero **el chat envía lo que escribe el visitante a la API de Anthropic** (a través del Worker de Cloudflare). Eso es un tratamiento de datos con un proveedor de EE. UU. y debe declararse (qué se envía, a quién, para qué, cuánto se guarda).
- Dice que "la única conexión externa es Google Fonts", pero **la portada carga 4 fotos de `images.unsplash.com`** (tarjetas de trabajos) y las demos cargan Unsplash y Google Fonts.
- Al autoalojar fuentes y fotos en el rediseño, el párrafo de terceros quedará: "ninguna, salvo el asistente de IA, que envía tus mensajes a Anthropic". Propondré el texto exacto en la Fase 5 para que lo apruebes.

**4. Google Fonts bloquea el primer pintado.**
Lighthouse móvil (4G simulado): FCP y LCP 3,1 s, Speed Index 4,4 s. El elemento LCP es el `h1`, que espera a la hoja de Google Fonts (ahorro estimado 1.630 ms). El objetivo del brief es LCP < 2,5 s. Autoalojar en `woff2` con `font-display:swap` y precargar solo la principal lo resuelve, y además elimina un tercero de la política de privacidad.

### P2

5. **No hay navegación en móvil ni en tableta.** Por debajo de 940 px el menú se oculta (`display:none`) y no hay alternativa. Con varias páginas hace falta el menú a pantalla completa del brief.
6. **Escape no cierra el chat en móvil después de enviar.** Tras enviar, el botón se desactiva y el foco cae al `body`; el `keydown` de Escape está en el panel y ya no llega. En escritorio funciona porque el foco vuelve al campo. Afecta a tabletas con teclado y a lectores de pantalla (el foco se pierde). Arreglo: escuchar Escape en `document` mientras el panel está abierto y devolver el foco al campo o al registro.
7. **Zonas táctiles por debajo de 44 px:**
   - dentro del chat: sugerencias (38 px de alto), "Llamar" y "WhatsApp" (38 px), enlace "Privacidad" (14 px de alto);
   - menú de escritorio: 32 px de alto;
   - aviso legal y privacidad: enlace "Inicio" del pie (38 px de ancho);
   - demos: el aviso "Web de demostración…" (42 px). *Las demos no se tocan; lo anoto por completitud.*
8. **Foco de teclado casi invisible en el panel oscuro de hallazgos:** el contorno azul sobre tinta da 2,23:1 (mínimo 3:1). En el bloque de contacto ya se cambió a amarillo; en los hallazgos no.
9. **Precios partidos en dos líneas:** "500" al final de una línea y "€" al principio de la siguiente (respuesta de la primera pregunta frecuente a 390 px). Faltan espacios duros entre cifra y símbolo.
10. **Sin JavaScript, el visor enseña controles muertos** (pestañas y deslizador que no hacen nada, "1280 px · Escritorio" con un iframe de 300 × 150) y el botón del chat no hace nada. Incumple la mejora progresiva de `CLAUDE.md`.
11. **Desajuste del asistente** (ya conocido): el `SYSTEM` de `worker.js` dice que vender online, reservas e inglés "no tienen precio publicado", y la calculadora los publica (400, 200 y 150 €). Se corrige en la Fase 5.
12. **Imágenes de las tarjetas** como `background-image` de Unsplash: sin texto alternativo, sin tamaño reservado, sin AVIF/WebP propios y dependientes de un tercero. Además no enseñan el trabajo: son fotos genéricas del sector, no la web hecha.
13. **La imagen para compartir (`og.png`)** usa la tipografía del sistema, no la de la marca, y dice "Sin cuotas", que no es exacto (el mantenimiento y las automatizaciones llevan cuota; lo verdadero es "sin cuota obligatoria por la web").
14. **Una sola página muy larga** (12.615 px a 390 px). Los servicios aparecen dos veces (lista de precios y automatizaciones con el mismo formato), el visor y las tarjetas enseñan las mismas demos, y quien busca "cuánto cuesta" tiene que atravesar los hallazgos, la lista y el estimador. Es el motivo del rediseño.

### P3

15. Bordes de componentes con poco contraste: chips del estimador (`#D5DAE1` sobre blanco, 1,41:1) y botón de WhatsApp del contacto (2,01:1). El texto identifica el control, así que no es un incumplimiento claro, pero el estado "sin marcar" se lee flojo.
16. Rasgos de plantilla: tira de tres datos bajo los botones de la portada, etiquetas "Paso 1-4", separadores "·" encadenados, cabecera translúcida con desenfoque (cristal), etiquetas "JavaScript" en las tarjetas (no le dicen nada al dueño de un bar).
17. El chat tiene su propio sistema visual: fuente del sistema, azul de foco `#3B82F6` ajeno a la paleta, `z-index` 9998/9999 y varios `!important`. Parece otro producto pegado.
18. Las páginas legales enlazan a `index.html` en vez de a `/`, y el chat enlaza a `/privacidad.html` (Cloudflare lo redirige; es un salto innecesario).
19. Los tokens de color están copiados en 4 archivos distintos (portada, 404, aviso, privacidad) y el chat tiene los suyos. Con 20 páginas, una sola hoja compartida.
20. Demo Academia Compás: salto de `h1` a `h3`. *(No se toca; anotado.)*

---

## Puntuación (impeccable · audit)

| # | Dimensión | Nota | Hallazgo clave |
|---|---|---|---|
| 1 | Accesibilidad | 3/4 | Textos AA y foco visible; falla el foco en el panel oscuro, el foco perdido en el chat y varias zonas táctiles. |
| 2 | Rendimiento | 3/4 | Ligera y sin bloqueos de JS; Google Fonts retrasa el primer pintado y el visor fuerza recálculos de diseño. |
| 3 | Responsive | 3/4 | Sin desbordes a ningún ancho; botón del chat encima del contenido, visor con ancho falso, sin menú en móvil. |
| 4 | Sistema visual (tokens) | 2/4 | Tokens definidos pero duplicados en cada archivo; el chat va por libre. Sin modo oscuro (decisión, no fallo). |
| 5 | Integridad de la implementación | 3/4 | Contenido muy propio; forma de plantilla. |
| | **Total** | **14/20** | **Buena base; el trabajo es de forma, estructura y legal, no de rescate.** |

**Detector de impeccable:** en las páginas propias solo aparece `clipped-overflow-container` en `html` y `body` de la portada (viene de `overflow-x:hidden`, ya conocido). En las demos, además, `cramped-padding` en tres bloques. Nada más.

**Veredicto de especificidad del diseño:** el contenido es específico (nadie más puede contar esos cuatro hallazgos ni ofrecer "te miro la web gratis" con ese tono). La composición no lo es: es el kit estándar de web de servicios. El rediseño tiene que hacer que la forma cuente lo mismo que el texto: que se vea a alguien que revisa, señala y arregla.

**Cómo lo vive cada visitante tipo:**
- *El dueño de un bar, desde el móvil y con prisa:* entiende la oferta en la primera pantalla (bien), pero el botón del chat le tapa el primer ejemplo, y para llegar a los precios tiene que bajar casi dos pantallas y luego atravesar una lista de seis bloques casi iguales antes de la calculadora.
- *Quien llega desde Google buscando "arreglar web":* aterriza en la misma página larga; no hay una página de "arreglos" que posicione ni que le hable a él.
- *Quien navega con teclado o lector de pantalla:* bien en general; pierde el foco en el chat tras enviar y el foco no se ve en el panel oscuro.

---

## Cifras de partida (para comparar al final)

| Medida | Inicio | Aviso legal |
|---|---|---|
| Lighthouse Rendimiento | 85 | 87 |
| Lighthouse Accesibilidad | 100 | 100 |
| Lighthouse Buenas prácticas | 96 *(errores de consola por Unsplash bloqueado en este entorno)* | 100 |
| Lighthouse SEO | 100 | 63 *(lleva `noindex` a propósito)* |
| FCP / LCP (móvil simulado) | 3,1 s / 3,1 s | 3,0 s / 3,0 s |
| CLS / TBT | 0 / 0 ms | 0 / 0 ms |
| Peso total (sin comprimir) | 181 KB | 120 KB |
| Altura de página a 390 px | 12.615 px | 3.550 px |

Contrastes medidos de la paleta actual:

| Pareja | Contraste | Resultado |
|---|---|---|
| Tinta `#16191F` / papel `#EDEFF2` | 15,28:1 | AAA |
| Gris `#5B6470` / papel | 5,21:1 | AA |
| Gris / blanco | 6,00:1 | AA |
| Azul `#1F3BD6` / papel (enlaces) | 6,87:1 | AA |
| Blanco / azul (botón) | 7,91:1 | AAA |
| Tinta / marcador `#FFE24A` | 13,60:1 | AAA |
| `#9AA6B8` / tinta (texto secundario oscuro) | 7,14:1 | AAA |
| `#7F8CA0` / tinta (texto terciario oscuro) | 5,16:1 | AA |
| Línea `#D5DAE1` / blanco (borde de chips) | 1,41:1 | no llega a 3:1 |
| `#454B57` / tinta (borde botón WhatsApp) | 2,01:1 | no llega a 3:1 |
| Azul / tinta (foco en panel oscuro) | 2,23:1 | no llega a 3:1 |
| `#3B82F6` / blanco (foco del chat) | 3,68:1 | vale para componentes |

---

## Riesgos del rediseño

1. **Enlaces viejos con ancla.** Quien tenga guardado `/#contacto`, `/#servicios` o `/#trabajos` seguirá llegando a la portada (las anclas no viajan al servidor, así que no se pueden redirigir desde Cloudflare). Propuesta: la portada mantiene esos `id` en las secciones resumen equivalentes, y un script de 10 líneas lleva `/#contacto` a `/contacto/` cuando hay JavaScript.
2. **SEO al pasar de 1 a ~20 páginas.** Bien hecho es una ganancia (una página por servicio que posicione); mal hecho, contenido duplicado. Cada página con su título, descripción y canonical propios, y el texto repartido, no copiado.
3. **Repetir cabecera, pie y chat en 20 archivos a mano** garantiza que se desincronicen. Hace falta una plantilla común (propuesta en la Fase 1).
4. **Precios en muchas páginas.** Una sola fuente de verdad que alimente páginas, calculadora, JSON-LD, `llms.txt` y el `SYSTEM` del asistente; y una comprobación automática que avise si algo no coincide con `docs/NEGOCIO.md`.
5. **Presupuesto de rendimiento** con más movimiento: el listón actual es bueno (TBT 0, CLS 0) y es fácil perderlo con GSAP y fuentes. Límite de 90 KB de JS por página y GSAP solo donde CSS no llega.
6. **El chat en todas las páginas:** cargarlo bajo demanda (al tocar el botón) para que no pese en cada página.
7. **Capturas de las demos:** en este entorno no cargan las fotos de Unsplash, así que las capturas saldrían con huecos vacíos. Opciones: permitir `images.unsplash.com` en la configuración de red del entorno, o que me pases las fotos, o autoalojarlas (lo que el propio `ESTADO-ACTUAL` recomienda).
8. **Privacidad:** cualquier cambio en conexiones externas (quitar Google Fonts y Unsplash, mantener Anthropic) obliga a actualizar el texto legal, que no toco sin tu visto bueno.
9. **View Transitions entre páginas** solo funcionan en Chrome, Edge y Safari reciente; en Firefox la navegación es normal. Es mejora progresiva, no un riesgo de rotura.
10. **Foto de Dani** pendiente: el hueco de "Sobre mí" tiene que verse bien sin ella.

---

## Anexo: cómo repetir las medidas

Las medidas de esta auditoría se han hecho con scripts provisionales; en la Fase 2 se convierten en `scripts/comprobar.mjs` (rastreo de enlaces, medidas de Playwright y capturas por página y ancho) para que cualquiera pueda repetirlas con un comando.

# Estado actual de la web (2 de octubre de 2026)

Publicada en `https://web.daniparuoutlook.workers.dev` (Worker de Cloudflare llamado `web`). Funciona y está desplegada tal cual está en este repositorio.

## Archivos

```
worker.js            Worker: /api/chat (asistente con la API de Claude) + sirve public/
wrangler.jsonc       Configuración del Worker (no tocar)
public/
  index.html         TODA la web en una sola página (≈70 KB, CSS y JS dentro)
  404.html
  aviso-legal.html   Datos legales (LSSI) — contenido legal no se toca
  privacidad.html    Política de privacidad (RGPD) — idem
  robots.txt         Allow: / + sitemap
  sitemap.xml        Solo la portada
  og.png             Imagen para compartir (1200×630)
  demos/             5 demos de negocios ficticios, autocontenidas, noindex
    hosteleria.html  Bar Almanaque
    belleza.html     Estudio Malva
    clinica.html     Clínica Arenal
    tienda.html      La Despensa de Triana
    academia.html    Academia Compás
scripts/dev-server.mjs   Servidor local con /api/chat simulado
```

## Identidad visual actual (punto de partida, se puede evolucionar)

Concepto: **el marcador amarillo** de quien revisa y corrige. Papel, tinta y un subrayado amarillo que señala lo importante.

```
--papel:#EDEFF2   --carta:#FFFFFF   --tinta:#16191F   --azul:#1F3BD6   --azul-hondo:#152BA0
--marcador:#FFE24A   --gris:#5B6470   --linea:#D5DAE1
--ease-out:cubic-bezier(.23,1,.32,1)
Títulos: Bricolage Grotesque 500/700 · Texto: Archivo 400/500/600 (hoy desde Google Fonts)
Radio 8 px · ancho máximo 1120 px · espaciado vertical clamp(56px,7vw,92px)
```

## Secciones de `index.html` hoy (de arriba abajo)

1. **Cabecera** con menú de anclas (resalta la sección activa con IntersectionObserver).
2. **Portada**: "Hago webs para negocios, y arreglo las que ya existen". Desde Sevilla y en remoto; precio cerrado, dominio y alojamiento a tu nombre, sin cuota que te ate. Botones "Pedir presupuesto" y "Ver trabajos".
   - Panel **"Lo que suelo encontrar"**: 4 hallazgos **reales** en webs de negocios de Sevilla, desplegables (carpintería con la web en dos direcciones; escuela de idiomas con "Your Content Goes Here" en portada; taller mecánico con la longitud sin signo menos y fuera de Sevilla en Google; tienda online vendiendo tallas agotadas). Es el contenido más persuasivo de la web: cuenta historias verdaderas y concretas. Conservar los textos y darles mucho más protagonismo.
3. **Servicios y precios** (`#servicios`): lista de servicios + **estimador** "Calcula lo que costaría lo tuyo":
   - Tipo (radio): Arreglo 150 · Revisar mi web 250 · Web de una página 500 (marcado) · Web completa 900 · Ya tengo web 0
   - Extras (checkbox): Vender online 400 · Reservas de cita o de mesa 200 · Versión en inglés 150 · Mantenimiento 0 + 80/mes
   - Automatizaciones con IA (checkbox): Asistente 350 + 45/mes · Respuestas de correo 300 + 40/mes · Atención de llamadas 600 + 90/mes y consumo
   - Muestra "desde X €", "+ Y € al mes" y el desglose. Si no hay nada elegido: "Elige algo".
4. **Automatizaciones con IA** (`#automatizaciones`): los tres servicios explicados.
5. **Trabajos** (`#trabajos`):
   - **Visor de pantallas**: un iframe de la demo elegida escalado con `transform`, con un deslizador de 320 a 1280 px y botones para cambiar de demo. (Aquí ocurrieron los errores de `clientWidth` y del iframe que atrapa el dedo.)
   - Grupos de tarjetas:
     - **Webs para negocios**: Bar Almanaque, Clínica Arenal, Estudio Malva, La Despensa.
     - **Webs con asistente de IA**: 2 huecos "En mantenimiento" (demos por hacer).
     - **Reservas y pedidos**: 4 huecos "En mantenimiento" (2 peluquerías, 2 restaurantes; se harán con Lovable).
     - **Herramientas a medida**: Academia Compás.
   - Aviso: "Son proyectos de demostración con negocios ficticios…".
6. **Preguntas frecuentes** (`#preguntas`): 8 preguntas, también en JSON-LD `FAQPage`.
7. **Cómo trabajo** (`#proceso`): 4 pasos.
8. **Quién soy**.
9. **Contacto** (`#contacto`): llamar, WhatsApp, correo.
10. **Pie** con enlaces legales.
11. **JSON-LD** `ProfessionalService` (con ofertas y cuotas mensuales) y `FAQPage`.
12. **Widget del asistente de IA** (botón flotante "Pregunta a la IA" → panel a pantalla completa en móvil, 380×620 en escritorio).

## Las demos (qué hace cada una)

- **Bar Almanaque** (hostelería): pizarra + amarillo tiza. Calcula si está abierto ahora con tramos reales y lo muestra en la cabecera. Pizarra del día, carta con tapa/ración por pestañas.
- **Estudio Malva** (peluquería): la clienta marca servicios, ve precio y tiempo total, y un botón genera el WhatsApp de la cita ya escrito. Barra fija abajo en móvil con el total.
- **Clínica Arenal** (dental): verde esmeralda. Simulador de financiación (3-24 meses, interés real desde el mes 13, TIN 7,9 %). Precios publicados.
- **La Despensa de Triana** (ultramarinos): paleta oliva, Alfa Slab One. Cada producto es una etiqueta de conserva; cesta con filtros y panel lateral; pedido final por WhatsApp.
- **Academia Compás** (herramienta interna): alumnos, asistencias, clases por recuperar, bonos y mensualidades pendientes, con filtros. Respalda "Herramientas a medida".

Las fotos de las demos se cargan desde `images.unsplash.com` (licencia libre). Mejor autoalojarlas en `public/demos/img/` optimizadas (rendimiento y privacidad).

## Asistente de IA

- `worker.js` llama a la API de Anthropic (modelo `claude-haiku-4-5-20251001`) con un `SYSTEM` largo en español que describe a Dani, servicios, precios y demos. Marca `[DANIEL]` para pasar con Dani.
- **Desajuste conocido**: el `SYSTEM` dice que vender online, reserva de cita y versión en inglés "no tienen precio publicado", pero la calculadora sí los publica (400/200/150 €). Hay que sincronizarlo.
- Ahora mismo la cuenta de Anthropic de Dani está sin crédito, así que en producción el chat responde con el mensaje de "habla con Daniel". No es un fallo de código.

## SEO ya hecho

Título y descripción revisados, Open Graph completo, `ProfessionalService` + `FAQPage`, `robots.txt` sin bloquear `/demos/` (las demos llevan `noindex,nofollow`), sitemap con la portada. Falta todo lo propio de una web de varias páginas.

## Errores de diseño ya cometidos (ver CLAUDE.md §2)

`padding: X 0` que borra márgenes · `clientWidth` con padding · iframe que atrapa el dedo · contraste naranja insuficiente · rasgos de diseño genérico.

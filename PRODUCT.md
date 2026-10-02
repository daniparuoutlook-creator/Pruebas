# Product

<!-- impeccable:product-schema 1 -->

> Compilado a partir de `CLAUDE.md`, `docs/NEGOCIO.md`, `docs/BRIEF-REDISENO.md`, `docs/ESTADO-ACTUAL.md` y `docs/FUTURO.md` (2 de octubre de 2026). Pendiente de confirmación de Dani en la parada de la Fase 1. Si algo de aquí choca con esos documentos, mandan ellos. Los precios no se copian aquí: viven en `docs/NEGOCIO.md`.

## Platform

web

## Stack

HTML, CSS y JavaScript sin frameworks ni bundlers, servidos por un Cloudflare Worker con Static Assets (`worker.js` + `public/`). GSAP autoalojado solo donde CSS no llega. Decidido por Dani en `CLAUDE.md` §6.

## Users

Dueños de negocios pequeños (bares, restaurantes, peluquerías, clínicas, tiendas, academias), de 30 a 65 años, casi siempre desde el móvil, con poco tiempo y desconfianza hacia "los de las webs". Llegan con una de tres necesidades: no tienen web, su web falla o está desactualizada, o pierden tiempo en tareas repetitivas (teléfono, correos, libretas).

## Product Purpose

La web de Daniel Padilla, desarrollador web freelance en Sevilla que trabaja también en remoto. Vende webs para negocios, arreglos y revisiones de webs existentes, herramientas a medida y automatizaciones con IA. Es a la vez el escaparate y la prueba: si la web es lenta, se rompe en un móvil o parece una plantilla, el argumento de venta se cae. Éxito: que el visitante llame, escriba por WhatsApp, calcule su presupuesto o pida que le miren la web gratis.

## Positioning

Dani es el que revisa las webs y señala lo que falla, con hallazgos reales y concretos de negocios de Sevilla. Arregla sin rehacer cuando basta, aunque cobre menos. Precio cerrado por escrito, dominio y alojamiento a nombre del cliente, sin cuota obligatoria por la web. Habla como un profesional de confianza del barrio, no como una agencia.

## Operating Context

El visitante entra desde el móvil, en la calle o en el negocio, a menudo con mala cobertura y entre cliente y cliente. Decide en segundos si sigue leyendo. El contacto es siempre humano y directo: teléfono, WhatsApp o correo. No hay formularios que envíen datos, ni cookies, ni analítica. Un asistente de IA en la web responde dudas y deriva a Daniel.

## Capabilities and Constraints

- Servicios, precios, plazos y forma de trabajo: `docs/NEGOCIO.md` (fuente de verdad).
- Asistente de IA en `/api/chat` (Worker + API de Anthropic): su contrato, el aviso de que es una IA, el paso a Daniel y el enlazado seguro son intocables.
- 5 demos de negocios ficticios en `public/demos/` (no se rehacen; siguen `noindex`).
- Huecos "En mantenimiento" para demos futuras: 2 webs con asistente de IA, 4 de reservas y pedidos (hechas con Lovable, posiblemente en otro dominio).
- Dominio actual `web.daniparuoutlook.workers.dev`; pronto `webpadilla.com`.
- Reglas de móvil, movimiento, rendimiento y lo que no se toca: `CLAUDE.md`.

## Brand Commitments

- Nombre en la web: "Daniel Padilla". Idioma: español de España, tuteando.
- Identidad de partida: "el marcador". Papel, tinta, azul y un marcador amarillo `#FFE24A` que señala lo importante. Evolucionarla, no tirarla.
- Tono: cercano, claro, concreto, frases cortas, cada afirmación comprobable. Nada de anglicismos innecesarios ni promesas vagas.
- Bricolage Grotesque como tipografía de titulares de partida (se puede proponer otra con motivos). Prohibidas Instrument Serif y Fraunces.

## Evidence on Hand

- Los 4 hallazgos reales en webs de negocios de Sevilla (carpintería, escuela de idiomas, taller mecánico, tienda online), en `public/index.html`.
- Las 5 demos funcionando en `public/demos/`.
- Formación real: Grado Medio SMR terminado; cursando Grado Superior DAW. Prácticas en una empresa de diseño y mantenimiento web con la que sigue colaborando (sin nombrarla).
- **No existen** y no se inventan: testimonios, clientes publicables, cifras de proyectos, logos de clientes, foto de Dani (`[PENDIENTE: foto de Dani]`).

## Product Principles

1. Demostrar en vez de afirmar: enseñar el fallo y el arreglo, no adjetivos.
2. El móvil manda: todo se diseña y se comprueba primero a 360 px.
3. Honestidad comprobable: precios "desde" con precio final cerrado por escrito; demos rotuladas como ficticias; la IA se presenta como IA.
4. Rápida por principio: la velocidad de la web es parte del argumento de venta.
5. Siempre una salida clara: llamar, WhatsApp, calcular presupuesto o "te miro la web gratis".

## Accessibility & Inclusion

WCAG 2.2 AA como mínimo: contraste medido (4,5:1 texto, 3:1 texto grande y componentes), zonas táctiles de 44 × 44 px, nada por debajo de 12 px, inputs a 16 px, `prefers-reduced-motion` respetado, todo usable sin JavaScript. Público de 30 a 65 años: tamaños de texto generosos.

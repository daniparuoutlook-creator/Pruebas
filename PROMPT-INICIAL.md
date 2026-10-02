Copia todo lo que hay debajo de la línea y pégalo como primer mensaje en Claude Code.

---

Hola. Soy Dani (Daniel Padilla), desarrollador web freelance en Sevilla. Este repositorio es mi web profesional, que ahora mismo está publicada y funciona: un Cloudflare Worker (`worker.js`) que sirve la carpeta `public/` y un asistente de IA en `/api/chat`.

Quiero un **rediseño completo**: pasar de una sola página a una web de varias páginas, muy profesional, visual, interactiva, con movimiento y efectos, y con cada página trabajada a fondo. Dale mucha imaginación, pero sin perder lo que me define: el móvil va primero, la web tiene que cargar rápido y no puede parecer una plantilla, porque es justo lo que vendo.

Todo el contexto está en el repositorio. Léelo entero antes de empezar, en este orden:
1. `CLAUDE.md` — reglas que no se negocian (móvil, errores ya cometidos, movimiento, arquitectura, lo que no se toca, cómo se prueba).
2. `docs/BRIEF-REDISENO.md` — el encargo: mapa de páginas, dirección creativa, momentos estrella y las fases.
3. `docs/NEGOCIO.md` — servicios, precios y tono. Es la fuente de verdad.
4. `docs/ESTADO-ACTUAL.md` — qué hay hoy y cómo funciona.
5. `docs/FUTURO.md` — lo que viene después.

Tienes skills en `.claude/skills/` (frontend-design, design-taste-frontend, redesign-existing-projects, impeccable, emil-design-eng, animate y las oficiales de GSAP). Úsalas en cada fase en la que encajen; el detector de impeccable y Playwright a 360/390/768/1280 px son obligatorios antes de dar nada por terminado.

Cómo quiero que trabajes:
- Sigue las fases del brief y haz commit al final de cada una.
- **Al terminar la Fase 1 (dirección visual y arquitectura), para y espera a que yo elija.** No construyas las páginas antes.
- Sé sincero: si algo de lo que pido es mala idea o choca con el rendimiento en móvil, dímelo con motivos y propón algo mejor.
- No inventes precios, clientes ni testimonios. Lo que falte, márcalo como `[PENDIENTE: ...]`.
- No despliegues ni toques nada de Cloudflare, y no pongas ninguna clave en ningún archivo. Yo despliego desde mi ordenador.
- No afirmes que algo funciona sin haberlo comprobado. El chat real no se puede probar aquí: usa `node scripts/dev-server.mjs`, que lo simula.
- Respuestas directas y en español. Cuando entregues, detallado; cuando respondas una duda, breve.

Empieza por la Fase 0 (auditoría) y sigue con la Fase 1.

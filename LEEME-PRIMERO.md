# Dani: pasos para arrancar el rediseño en Claude Code en la nube

Claude Code en la nube trabaja sobre un **repositorio de GitHub**: no se le puede subir un zip directamente. Por eso el primer paso es meter esta carpeta en un repositorio privado. Son 10 minutos y solo se hace una vez.

## 1. Subir la carpeta a GitHub

1. Descomprime este zip. Tendrás una carpeta `padilla-web` con `CLAUDE.md`, `docs`, `public`, `.claude`, etc.
2. Entra en github.com (crea cuenta si no tienes) → botón **New** (nuevo repositorio).
   - Nombre: `padilla-web`
   - Marca **Private**
   - No marques "Add a README" ni nada más → **Create repository**.
3. En la página que aparece, pulsa el enlace **"uploading an existing file"**.
4. Abre la carpeta `padilla-web` en el Explorador, selecciona **todo lo que hay dentro** (Ctrl+A, incluidas `.claude` y `.gitignore`) y arrástralo a la página de GitHub. Son menos de 100 archivos, así que entra de una vez.
5. Abajo, pulsa **Commit changes**.
6. Comprueba que en el repositorio se ven las carpetas `.claude`, `docs`, `public` y `scripts`. Si falta `.claude`, ábrela y arrastra su contenido otra vez (las skills están ahí).

## 2. Abrir la sesión de Claude Code

1. Ve a **claude.ai/code**.
2. Si es la primera vez, te pedirá conectar GitHub e instalar la app de Claude: dale acceso al repositorio `padilla-web`.
3. Elige el repositorio `padilla-web` y el entorno **Default**.
4. Elige el modelo más potente que tengas disponible (si no aparece selector, escribe `/model opus` como primer mensaje).
5. Abre `PROMPT-INICIAL.md`, copia todo lo que hay **debajo de la línea** y pégalo como primer mensaje.

## 3. Mientras trabaja

- **Fase 1: se parará y te enseñará dos direcciones visuales** con capturas de cómo quedaría la portada en móvil y en ordenador. Las verás en `docs/DIRECCION.md` y `docs/capturas/`. Contéstale cuál quieres (o qué mezclarías). Este parón es a propósito: así no gastas crédito construyendo 20 páginas en una dirección que no te gusta.
- Puedes cerrar el navegador: sigue trabajando solo. Puedes mirar cómo va desde el móvil (app de Claude → pestaña Code).
- Si la sesión se "duerme" por inactividad, ábrela otra vez desde claude.ai/code y sigue donde estaba.
- Si algo no te convence en cualquier momento, díselo con capturas: es más barato corregir pronto.

## 4. Cuando termine: publicar

1. Te abrirá un **pull request** en GitHub. Revísalo y pulsa **Merge**.
2. En el repositorio, entra en `entrega/` → `web-deploy.zip` → botón de descarga.
3. Descomprímelo en una **carpeta nueva** (no encima de la vieja).
4. Abre PowerShell en esa carpeta y ejecuta, igual que la otra vez:
   ```
   npx wrangler deploy
   ```
   Tu sesión de Cloudflare ya está iniciada en tu ordenador; si te pide login, `npx wrangler login`.
5. En la salida tienen que aparecer `env.CHAT_LIMITER`, `env.ASSETS` y `env.ALLOWED_ORIGINS`. Si no salen, no sigas y avísame.
6. Entra en la web desde el **móvil** y revisa: menú, páginas, calculadora, trabajos y el botón del chat.

## Recordatorios

- El chat solo responde de verdad cuando la cuenta de Anthropic tenga crédito (console.anthropic.com → Facturación). Sin crédito, contesta "habla con Daniel", que no es un fallo.
- La clave de la API está guardada solo en Cloudflare. No la pegues nunca en el chat ni en ningún archivo del repositorio.
- Cuando compres `webpadilla.com`, el documento `docs/CAMBIO-DE-DOMINIO.md` (lo creará Claude Code) tendrá la lista de lo que hay que cambiar.

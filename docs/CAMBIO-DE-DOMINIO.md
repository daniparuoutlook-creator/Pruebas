# Cambio de dominio: de `web.daniparuoutlook.workers.dev` a `webpadilla.com`

Todas las direcciones absolutas de la web (canonical, Open Graph, sitemap, datos estructurados, `llms.txt`, `robots.txt` y el "Sitio web" del aviso legal) salen de **un solo sitio**: `src/datos/sitio.json`. Por eso el cambio son cuatro pasos, no una búsqueda por cuarenta archivos.

## 1. Lo único que hay que editar a mano

| Archivo | Línea | Qué poner |
|---|---|---|
| `src/datos/sitio.json` | 3 | `"url": "https://webpadilla.com",` (sin barra final) |
| `src/datos/negocio.json` | 10 | `"correo": "hola@webpadilla.com",` **solo cuando ese correo ya funcione** (cambia el correo en toda la web y en el pie) |
| `worker.js` | texto `SYSTEM`, párrafo "Contacto de Daniel" | cambia `Correo: daniparu@outlook.es` por el nuevo correo, si lo cambias en el paso anterior |

Nada más. No toques `wrangler.jsonc`: el chat ya acepta peticiones del mismo dominio en el que está la web (el Worker compara el origen con su propia dirección), así que con un dominio propio conectado al mismo Worker funciona sin añadir nada a `ALLOWED_ORIGINS`.

## 2. Regenerar la web

En la carpeta del proyecto (CMD de Windows):

```
node scripts/construir.mjs
```

Eso reescribe con el dominio nuevo, de una vez:

- `public/**/index.html`, `public/404.html`, `public/aviso-legal.html`, `public/privacidad.html` (canonical, `og:url`, `og:image`, JSON-LD y el dominio del aviso legal);
- `public/sitemap.xml`, `public/robots.txt` y `public/llms.txt`.

Las imágenes de `public/og/` **no llevan el dominio dentro**: no hay que regenerarlas.

Comprueba que no queda ninguna dirección vieja (debe salir vacío salvo esta documentación y el propio `chat.js`, que acepta los dos dominios a propósito):

```
findstr /s /i /m "daniparuoutlook.workers.dev" public\*.html public\*.xml public\*.txt
```

## 3. Lo que ya está preparado y no hay que tocar

- `public/assets/js/chat.js`, línea 16: la lista de dominios cuyos enlaces el chat convierte en clicables ya incluye `webpadilla.com`, `www.webpadilla.com`, el dominio viejo y el dominio en el que se esté viendo la web.
- Las demos de `public/demos/` no tienen direcciones absolutas de la web.

## 4. En Cloudflare (lo haces tú, desde el panel)

1. Añade `webpadilla.com` a tu cuenta de Cloudflare y apunta los servidores DNS del registrador a los que te diga Cloudflare.
2. En **Workers y Pages → web → Configuración → Dominios y rutas**, añade `webpadilla.com` y `www.webpadilla.com` como dominios personalizados.
3. Decide cuál es el principal (recomendado: `webpadilla.com`, sin www) y crea una **regla de redirección 301** de `www.webpadilla.com/*` a `https://webpadilla.com/$1`, para que Google no vea dos webs iguales.
4. Despliega la versión regenerada (`npx wrangler deploy`).
5. Deja vivo `web.daniparuoutlook.workers.dev` unas semanas. Lo ideal es redirigirlo también con 301 al dominio nuevo; si no puedes, no pasa nada grave: todas las páginas llevan `canonical` al dominio nuevo y Google acabará quedándose con ese.
6. En Google Search Console, da de alta `webpadilla.com`, envía `https://webpadilla.com/sitemap.xml` y, si tenías dado de alta el dominio viejo, usa la herramienta "Cambio de dirección".

## 5. Fuera de la web

- Ficha de Google Business Profile, WhatsApp Business, redes sociales y firma del correo: cambia el enlace a la web.
- La política de privacidad y el aviso legal no nombran el dominio a mano (el aviso lo saca de `sitio.json`), así que se actualizan solos en el paso 2.

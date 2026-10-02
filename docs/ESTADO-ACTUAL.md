# Estado actual de la web (tras el rediseño, 2 de octubre de 2026)

Dominio: `https://web.daniparuoutlook.workers.dev` (Worker de Cloudflare llamado `web`). Para pasar a `webpadilla.com`, ver `docs/CAMBIO-DE-DOMINIO.md`.
La versión anterior (una sola página) está en el primer commit del repositorio y descrita en `docs/AUDITORIA.md`.

## Cómo está hecha

HTML, CSS y JavaScript sin frameworks ni dependencias de ejecución. Las páginas **no se editan en `public/`**: se escriben en `src/` y un generador sin dependencias las monta.

```
src/
  datos/negocio.json     Precios, plazos, extras y contacto (copia de docs/NEGOCIO.md: si cambia uno, cambia el otro)
  datos/sitio.json       Dominio de la web y fecha de actualización
  plantilla/base.html    Esqueleto común (head, cabecera, migas, pie, barra móvil)
  plantilla/*.html       Piezas reutilizables: cabecera, pie, barra, cta-final, antes-despues,
                         expedientes, tablon, pasos y una tarjeta por trabajo (tarjeta-<caso>.html)
  paginas/**.html        Una por página. Empiezan con <!--meta {JSON} --> (título, descripción, ruta,
                         migas, servicios para el JSON-LD, módulos JS) y luego el contenido
scripts/
  construir.mjs          src/ -> public/ + sitemap.xml + robots.txt + llms.txt  (node scripts/construir.mjs)
  comprobar.mjs          Enlaces, precios, y Playwright a 360/390/768/1280, reducido y sin JS
  probar-momentos.mjs    Pruebas de las interacciones (antes/después, calculadora, chat...)
  imagenes-og.mjs        Imágenes para compartir de cada página en public/og/
  capturas-demos.mjs     Capturas de las demos para las tarjetas y los casos
  dev-server.mjs         Servidor local en http://localhost:8787 con /api/chat simulado
public/                  Lo que se despliega (HTML generado + assets)
  assets/css/sitio.css   Todo el CSS (compartido)
  assets/js/sitio.js     Menú, carga del chat, copiar teléfono, 404, botón flotante
  assets/js/chat.js      El asistente (se descarga al abrirlo)
  assets/js/<módulo>.js  Solo en la página que lo usa: antes-despues, calculadora, filtros, visor, simulaciones
  assets/fuentes/        Bricolage Grotesque y Archivo en woff2, recortadas (licencia OFL al lado)
  assets/img/trabajos/   Capturas de las demos en AVIF y WebP
  og/                    Imagen para compartir de cada página
  demos/                 Las 5 demos (no se tocan)
worker.js, wrangler.jsonc   Sin cambios salvo el texto SYSTEM del asistente
```

Marcas que entiende el generador dentro de las páginas: `{{precio:clave}}`, `{{cuota:clave}}`, `{{plazo:clave}}`, `{{c:campo}}` (contacto), `{{tel}}`, `{{wa}}`, `{{wa:texto}}`, `{{url}}`, `{{dominio}}`, `{{dominioAnual}}`, `{{datos-precios}}` y `{{> pieza}}`. Si queda alguna sin sustituir, el generador se para con un error. Por eso no se escriben dobles llaves dentro de comentarios HTML.

## Mapa

| Ruta | Qué es |
|---|---|
| `/` | Portada: antes/después arrastrable, hallazgos reales, tablón de precios, tres trabajos, cómo trabajo |
| `/servicios/` y `/servicios/{webs,arreglos,automatizaciones-ia,herramientas-a-medida}/` | Un servicio por página, con precio, qué incluye, ejemplos y preguntas |
| `/trabajos/` | Trabajos por grupos con filtros; huecos «En obras» para las demos que faltan |
| `/trabajos/{bar-almanaque,clinica-arenal,estudio-malva,la-despensa,academia-compas}/` | Una página por caso: problema, qué hace, por qué está hecha así, visor móvil/ordenador |
| `/precios/` | Calculadora que escribe el presupuesto y lo manda por WhatsApp, tablas y preguntas de dinero |
| `/como-trabajo/` | Pasos, condiciones, plazos y las preguntas frecuentes |
| `/sobre-mi/`, `/contacto/`, `/revision-gratis/` | Quién es Dani, formas de contacto, la revisión gratis |
| `/aviso-legal`, `/privacidad`, `404` | Legales (noindex) y página de error |

Las direcciones viejas con ancla (`/#servicios`, `/#trabajos`, `/#preguntas`...) se redirigen a su página nueva desde `sitio.js`.

## Sistema visual (dirección «Hoja de revisión»)

```
--hoja:#FCFCFD  --mesa:#E4E8ED  --tinta:#16191F  --gris:#5B6470  --gris-mesa:#535C68
--boli:#1F3BD6  --boli-hondo:#152BA0  --marcador:#FFE24A  --verde:#1E6B3A  --rojo:#B42318
--linea:#CDD3DB  --borde:#6B7381
Títulos: Bricolage Grotesque 600-800 (precargada) · Texto: Archivo, con respaldo ajustado a sus medidas
Curva: cubic-bezier(.23,1,.32,1) · Márgenes laterales 16/24/48 px · Ancho máximo 1180 px
```

Todas las parejas de color usadas están medidas (AA o mejor). El amarillo nunca es color de texto: solo marcador detrás de texto en tinta.

## El asistente

Igual que antes en su funcionamiento (contrato con el Worker, aviso de IA, pasar con Daniel, enlaces seguros, teclado móvil, Escape, foco). Ahora vive en `public/assets/js/chat.js`, está en todas las páginas y se abre con cualquier botón `[data-ia-open]`: en móvil desde la barra inferior, en escritorio desde el botón flotante (que aparece al bajar un poco).

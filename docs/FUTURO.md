# Lo que viene después (no construirlo ahora, pero no cerrarle la puerta)

1. **Dominio propio `webpadilla.com`** (comprado en Cloudflare, este mes). Cambiarán canonical, Open Graph, sitemap, robots, JSON-LD, páginas legales y `ALLOWED_ORIGINS` del Worker. Por eso: una sola fuente para la URL base y `docs/CAMBIO-DE-DOMINIO.md` con la lista exacta.
2. **Correo `hola@webpadilla.com`** con el reenvío gratuito de Cloudflare. Sustituirá a daniparu@outlook.es en la web.
3. **2 demos de "Webs con asistente de IA"**: webs de negocio con su propio asistente. Las tarjetas "En mantenimiento" se sustituirán por demos reales; el diseño debe permitir añadir también su página de caso.
4. **4 demos de "Reservas y pedidos"** (2 peluquerías, 2 restaurantes), hechas con Lovable. Probablemente vivirán en otro dominio o subdominio: la tarjeta y la página de caso deben aceptar un enlace externo (`target="_blank"`, `rel="noopener"`).
5. **Testimonios y trabajos de clientes reales**, cuando los haya y con permiso. Dejar diseñado (y oculto) un bloque de testimonio y una variante de página de caso "cliente real".
6. **Auditor automático de webs** (n8n) que acelere el servicio de revisión. A futuro podría alimentar la página `/revision-gratis/`; de momento el contacto es manual por WhatsApp.
7. **Agente de llamadas**: solo cuando se venda ese servicio.

Decisiones ya cerradas que la web debe respetar:
- Dani **no aloja** webs de clientes: dominio y alojamiento siempre a nombre del cliente.
- **No hay envío automático de correos** ni formularios que manden datos a ningún sitio: el contacto es por teléfono, WhatsApp o correo. (Por eso la política de privacidad dice que la web no recoge datos.) Si se añade un formulario, hay que actualizar la privacidad: consultarlo antes con Dani.
- **Sin cookies ni analítica.** Si algún día se mide tráfico, que sea sin cookies (por ejemplo Cloudflare Web Analytics) y actualizando la privacidad.

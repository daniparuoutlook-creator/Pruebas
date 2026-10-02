/* Daniel Padilla · JavaScript común (todas las páginas). Sin dependencias.
   1. Menú móvil a pantalla completa (foco atrapado, Escape, vuelve el foco al botón)
   2. Enlaces antiguos con ancla (/#contacto...) llevan a las páginas nuevas
   3. Asistente de IA: se descarga al primer toque en cualquier [data-ia-open]
   4. Copiar el teléfono con aviso
   5. 404: enseña la dirección que ha fallado */
(function () {
  "use strict";
  var doc = document;

  /* ---------- 2. Anclas antiguas de la web de una sola página ---------- */
  var ANCLAS = {
    "#servicios": "/servicios/", "#automatizaciones": "/servicios/automatizaciones-ia/", "#trabajos": "/trabajos/",
    "#preguntas": "/como-trabajo/#preguntas", "#proceso": "/como-trabajo/", "#contacto": "/contacto/"
  };
  if ((location.pathname === "/" || location.pathname === "/index.html") && ANCLAS[location.hash]) {
    location.replace(ANCLAS[location.hash]);
    return;
  }

  /* ---------- 1. Menú ---------- */
  var enlaceMenu = doc.getElementById("menu-boton");
  var menu = doc.getElementById("menu");
  if (enlaceMenu && menu) {
    var boton = doc.createElement("button");
    boton.type = "button";
    boton.className = enlaceMenu.className;
    boton.id = enlaceMenu.id;
    boton.setAttribute("aria-controls", "menu");
    boton.setAttribute("aria-expanded", "false");
    boton.innerHTML = enlaceMenu.innerHTML;
    enlaceMenu.replaceWith(boton);
    var cerrar = doc.getElementById("menu-cerrar");

    var enfocables = function () {
      return Array.prototype.filter.call(menu.querySelectorAll("a[href],button"), function (e) { return e.offsetParent !== null; });
    };
    var abrir = function () {
      menu.hidden = false;
      boton.setAttribute("aria-expanded", "true");
      doc.documentElement.style.overflow = "hidden";
      (menu.querySelector('[aria-current="page"]') || cerrar).focus();
    };
    var cerrarMenu = function (devolverFoco) {
      if (menu.hidden) return;
      menu.hidden = true;
      boton.setAttribute("aria-expanded", "false");
      doc.documentElement.style.overflow = "";
      if (devolverFoco !== false) boton.focus();
    };
    boton.addEventListener("click", abrir);
    cerrar.addEventListener("click", function () { cerrarMenu(); });
    menu.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { e.preventDefault(); cerrarMenu(); return; }
      if (e.key !== "Tab") return;
      var lista = enfocables(), primero = lista[0], ultimo = lista[lista.length - 1];
      if (e.shiftKey && doc.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
      else if (!e.shiftKey && doc.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
    });
    menu.addEventListener("click", function (e) {
      var a = e.target.closest("a");
      if (a) cerrarMenu(false);
    });
    // Si se pasa a escritorio con el menú abierto, se cierra
    var mq = window.matchMedia("(min-width: 960px)");
    var alCambiar = function () { if (mq.matches) cerrarMenu(false); };
    if (mq.addEventListener) mq.addEventListener("change", alCambiar);
  }

  /* ---------- 3. Asistente de IA bajo demanda ---------- */
  var cargandoIA = null;
  function cargarIA() {
    if (!cargandoIA) cargandoIA = import("/assets/js/chat.js");
    return cargandoIA;
  }
  doc.addEventListener("click", function (e) {
    var disparador = e.target.closest("[data-ia-open]");
    if (!disparador) return;
    e.preventDefault();
    cargarIA().then(function (m) { m.abrir(disparador); }).catch(function () {
      // Si no se puede cargar el asistente, el teléfono y WhatsApp siguen ahí
      location.href = "/contacto/";
    });
  });
  // Precarga discreta cuando el dedo o el ratón se acercan al botón
  doc.addEventListener("pointerover", function (e) { if (e.target.closest && e.target.closest("[data-ia-open]")) cargarIA(); }, { passive: true });

  /* ---------- 4. Copiar el teléfono ---------- */
  function aviso(texto) {
    var a = doc.createElement("p");
    a.className = "aviso-copiado";
    a.setAttribute("role", "status");
    a.textContent = texto;
    doc.body.appendChild(a);
    setTimeout(function () { a.remove(); }, 2200);
  }
  Array.prototype.forEach.call(doc.querySelectorAll("[data-copiar]"), function (b) {
    b.hidden = false;
    b.addEventListener("click", function () {
      var valor = b.getAttribute("data-copiar");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(valor).then(function () { aviso("Copiado: " + valor); }, function () { aviso("No se ha podido copiar. Es el " + valor); });
      } else {
        aviso("Es el " + valor);
      }
    });
  });

  /* ---------- 5. 404 ---------- */
  var url = doc.querySelector("[data-url-rota]");
  if (url) {
    var ruta = location.pathname + location.search;
    try { ruta = decodeURI(ruta); } catch (e) { /* dirección mal codificada: se enseña tal cual */ }
    url.textContent = ruta;
    url.parentElement.hidden = false;
  }
})();

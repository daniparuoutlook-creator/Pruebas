/* Antes / después arrastrable.
   - Se arrastra solo desde la línea (el tirador): el resto del marco deja pasar el scroll del dedo.
   - Un toque en cualquier punto del marco lleva la línea allí.
   - Teclado: flechas (Mayús = pasos largos), Inicio, Fin, Re Pág / Av Pág.
   - Sin JavaScript se ven las dos versiones, una debajo de otra (CSS). */
const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

for (const marco of document.querySelectorAll("[data-ad]")) {
  const tirador = marco.querySelector(".ad-tirador");
  let pos = parseFloat(marco.style.getPropertyValue("--pos")) || 64;
  let arrastrando = false;
  if (reducido) marco.classList.remove("pista");

  const poner = (valor) => {
    pos = Math.max(0, Math.min(100, Math.round(valor)));
    marco.classList.remove("pista");
    marco.style.setProperty("--pos", pos + "%");
    tirador.setAttribute("aria-valuenow", String(pos));
    tirador.setAttribute("aria-valuetext", `${pos} % de la web rota a la vista`);
  };
  const desdeX = (x) => {
    const r = marco.getBoundingClientRect();
    const borde = parseFloat(getComputedStyle(marco).borderLeftWidth) || 0;
    const ancho = r.width - borde * 2;
    return ((x - r.left - borde) / ancho) * 100;
  };

  tirador.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    arrastrando = true;
    tirador.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  tirador.addEventListener("pointermove", (e) => { if (arrastrando) poner(desdeX(e.clientX)); });
  const soltar = (e) => {
    if (!arrastrando) return;
    arrastrando = false;
    if (tirador.hasPointerCapture(e.pointerId)) tirador.releasePointerCapture(e.pointerId);
  };
  tirador.addEventListener("pointerup", soltar);
  tirador.addEventListener("pointercancel", soltar);
  tirador.addEventListener("lostpointercapture", () => { arrastrando = false; });

  marco.addEventListener("click", (e) => {
    if (e.target.closest(".ad-tirador")) return;
    poner(desdeX(e.clientX));
  });

  tirador.addEventListener("keydown", (e) => {
    const paso = e.shiftKey ? 10 : 5;
    const teclas = { ArrowLeft: pos - paso, ArrowDown: pos - paso, ArrowRight: pos + paso, ArrowUp: pos + paso, Home: 0, End: 100, PageDown: pos - 10, PageUp: pos + 10 };
    if (e.key in teclas) { e.preventDefault(); poner(teclas[e.key]); }
  });
}

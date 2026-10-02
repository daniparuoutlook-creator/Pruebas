/* Visor de capturas de cada caso: móvil u ordenador.
   Sin JavaScript se ven las dos capturas. Con View Transitions el cambio se anima; sin ellas, cambia directamente. */
const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

for (const visor of document.querySelectorAll("[data-visor]")) {
  const botones = [...visor.querySelectorAll("[data-ver]")];
  const marcar = (ver) => botones.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.ver === ver)));
  // estado inicial según el ancho (igual que el CSS)
  marcar(matchMedia("(min-width: 760px)").matches ? "escritorio" : "movil");
  for (const b of botones) {
    b.addEventListener("click", () => {
      const cambiar = () => { visor.dataset.elegido = b.dataset.ver; marcar(b.dataset.ver); };
      if (document.startViewTransition && !reducido) document.startViewTransition(cambiar);
      else cambiar();
    });
  }
}

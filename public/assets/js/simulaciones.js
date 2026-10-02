/* Simulaciones de las automatizaciones (rotuladas como "Simulación").
   Se reproducen al pulsar "Ver la simulación", nunca solas al hacer scroll.
   Sin JavaScript se ve el estado final completo; con movimiento reducido, también (sin animar). */
const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

for (const sim of document.querySelectorAll("[data-sim]")) {
  const pasos = [...sim.querySelectorAll("[data-paso]")];
  const boton = sim.querySelector("[data-sim-play]");
  let temporizadores = [];

  const reiniciar = () => { temporizadores.forEach(clearTimeout); temporizadores = []; pasos.forEach((p) => p.classList.remove("visto")); };
  // Estado inicial con JS: todo a la vista hasta que se pulse (así nadie ve una caja vacía)
  sim.dataset.estado = "fin";

  boton.addEventListener("click", () => {
    reiniciar();
    if (reducido) { sim.dataset.estado = "fin"; return; }
    sim.dataset.estado = "espera";
    boton.disabled = true;
    pasos.forEach((p, i) => {
      temporizadores.push(setTimeout(() => {
        p.classList.add("visto");
        if (i === pasos.length - 1) {
          sim.dataset.estado = "fin";
          boton.disabled = false;
          boton.textContent = "Ver otra vez";
        }
      }, 350 + i * 900));
    });
  });
}

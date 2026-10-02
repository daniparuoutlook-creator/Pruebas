/* Filtros de /trabajos/ con reordenación animada (View Transitions del navegador, sin librerías).
   Sin JavaScript no hay filtros y se ven todos los grupos. Sin soporte de View Transitions, filtra sin animar. */
const caja = document.querySelector("[data-filtros]");
const grupos = [...document.querySelectorAll(".grupo-trabajos[data-grupo]")];
const estado = document.querySelector("[data-filtro-estado]");
const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
const nombres = { todos: "todos los trabajos", webs: "webs para negocios", ia: "webs con asistente de IA", reservas: "reservas y pedidos", herramientas: "herramientas a medida" };

function aplicar(filtro) {
  for (const b of caja.querySelectorAll("[data-filtro]")) b.setAttribute("aria-pressed", String(b.dataset.filtro === filtro));
  for (const g of grupos) g.hidden = filtro !== "todos" && g.dataset.grupo !== filtro;
  estado.textContent = `Mostrando ${nombres[filtro]}`;
}

caja.addEventListener("click", (e) => {
  const b = e.target.closest("[data-filtro]");
  if (!b || b.getAttribute("aria-pressed") === "true") return;
  if (document.startViewTransition && !reducido) document.startViewTransition(() => aplicar(b.dataset.filtro));
  else aplicar(b.dataset.filtro);
});

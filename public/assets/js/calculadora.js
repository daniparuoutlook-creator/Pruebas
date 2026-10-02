/* El presupuesto que se escribe solo (/precios/).
   Los precios salen de <script id="datos-precios">, que genera scripts/construir.mjs desde src/datos/negocio.json:
   la calculadora no puede desincronizarse de las páginas. Sin JavaScript se ve la tabla de precios completa. */
const datos = JSON.parse(document.getElementById("datos-precios").textContent);
const caja = document.querySelector("[data-presupuesto]");
const form = caja.querySelector("form");
const lineas = caja.querySelector("[data-lineas]");
const total = caja.querySelector("[data-total]");
const mes = caja.querySelector("[data-mes]");
const enviar = caja.querySelector("[data-enviar]");
const flotante = caja.querySelector("[data-flotante]");
const totalCorto = caja.querySelector("[data-total-corto]");
const mesCorto = caja.querySelector("[data-mes-corto]");
const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

const euros = (n) => `${n.toLocaleString("es-ES")} €`;
const info = (clave) => datos.servicios[clave] || datos.extras[clave];

const fecha = caja.querySelector("[data-fecha]");
fecha.textContent = new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

let mostrado = 0;
let animacion = 0;
function contar(hasta) {
  cancelAnimationFrame(animacion);
  if (reducido) { mostrado = hasta; total.textContent = euros(hasta); return; }
  const desde = mostrado, inicio = performance.now(), dur = 300;
  const paso = (t) => {
    const k = Math.min(1, (t - inicio) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    mostrado = Math.round(desde + (hasta - desde) * e);
    total.textContent = euros(mostrado);
    if (k < 1) animacion = requestAnimationFrame(paso);
  };
  animacion = requestAnimationFrame(paso);
}

function calcular() {
  const elegidas = [];
  const tipo = form.querySelector('input[name="tipo"]:checked');
  if (tipo && tipo.value) elegidas.push(tipo.value);
  form.querySelectorAll('input[name="extra"]:checked').forEach((c) => elegidas.push(c.value));

  let suma = 0, cuota = 0, consumo = false;
  const filas = elegidas.map((clave) => {
    const s = info(clave);
    if (s.precio != null) suma += s.precio;
    if (s.cuota != null) cuota += s.cuota;
    if (s.consumo) consumo = true;
    const precio = s.precio != null ? euros(s.precio) : `${euros(s.cuota)}/mes`;
    const extra = s.precio != null && s.cuota != null ? ` + ${euros(s.cuota)}/mes` : "";
    return { nombre: s.nombre, precio: precio + extra, alta: precio, cuota: extra.trim(), clave };
  });

  // Líneas de la hoja: las nuevas aparecen escritas, las que sobran se quitan
  const antes = new Set([...lineas.children].map((li) => li.dataset.clave));
  lineas.innerHTML = "";
  if (!filas.length) {
    const li = document.createElement("li");
    li.className = "vacia";
    li.textContent = "Marca lo que necesitas y aparecerá aquí.";
    lineas.append(li);
  }
  for (const f of filas) {
    const li = document.createElement("li");
    li.dataset.clave = f.clave;
    li.innerHTML = "<span></span><i></i><b></b>";
    li.children[0].textContent = f.nombre;
    // Alta y cuota en dos líneas: así la cifra nunca se corta en un móvil estrecho
    li.children[2].textContent = f.alta;
    if (f.cuota) { const c = document.createElement("small"); c.textContent = f.cuota; li.children[2].append(c); }
    if (!antes.has(f.clave) && !reducido) li.classList.add("nueva");
    lineas.append(li);
  }

  const textoMes = cuota ? `+ ${euros(cuota)} al mes${consumo ? " y consumo" : ""}` : "";
  if (filas.length) contar(suma); else { cancelAnimationFrame(animacion); mostrado = 0; total.textContent = "Elige algo"; }
  mes.textContent = textoMes;
  totalCorto.textContent = filas.length ? `Desde ${euros(suma)}` : "Elige algo";
  mesCorto.textContent = textoMes;
  flotante.hidden = !filas.length;

  // Mensaje de WhatsApp con el desglose ya escrito
  const texto = filas.length
    ? `Hola Daniel, he hecho el cálculo en tu web:\n${filas.map((f) => `- ${f.nombre}: ${f.precio.replace(/ /g, " ")}`).join("\n")}\nTotal orientativo: desde ${euros(suma).replace(" ", " ")}${textoMes ? " " + textoMes.replace(/ /g, " ") : ""}.\n¿Lo hablamos?`
    : "Hola Daniel, quiero pedirte presupuesto.";
  enviar.href = `https://wa.me/${datos.whatsapp}?text=${encodeURIComponent(texto)}`;
}

form.addEventListener("change", calcular);
calcular();

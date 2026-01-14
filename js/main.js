const WEBAPP_URL = "https://script.google.com/macros/s/AKfycb.../exec"; // Pega tu URL de Web App aquí

let modo = "entrada";

function setModo(m, el) {
  modo = m;
  document.querySelectorAll("#pantallaRegistro .tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");
  const btn = document.getElementById("btnGuardar");
  btn.className = m === "entrada" ? "entrada" : "salida";
}

async function guardar() {
  const usuario = document.getElementById("usuario");
  const producto = document.getElementById("producto");
  const cantidad = document.getElementById("cantidad");
  const btn = document.getElementById("btnGuardar");
  const msg = document.getElementById("msg");

  if (!producto.value || !cantidad.value) {
    msg.textContent = "Completa todos los campos";
    msg.style.color = "#b91c1c";
    return;
  }

  usuario.disabled = true;
  producto.disabled = true;
  cantidad.disabled = true;
  btn.disabled = true;
  const textoOriginal = btn.textContent;
  btn.innerHTML = `<div class="loader"></div>`;
  msg.textContent = "";

  const data = { tipo: modo, producto: producto.value, cantidad: cantidad.value, usuario: usuario.value };

  try {
    const res = await fetch(WEBAPP_URL, {
      method: "POST",
      body: JSON.stringify({ action: "guardarMovimiento", data }),
      headers: { "Content-Type": "application/json" }
    });
    const result = await res.json();
    if (result.status === "ok") {
      msg.textContent = "✔ Registro guardado";
      msg.style.color = "#047857";
      producto.value = "";
      cantidad.value = "";
    } else {
      msg.textContent = "❌ Error al guardar";
      msg.style.color = "#b91c1c";
    }
  } catch (e) {
    msg.textContent = "❌ Error al guardar";
    msg.style.color = "#b91c1c";
  } finally {
    usuario.disabled = false;
    producto.disabled = false;
    cantidad.disabled = false;
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
}

function irMovimientos() {
  document.getElementById("pantallaRegistro").style.display = "none";
  document.getElementById("pantallaMovimientos").style.display = "block";
  verTabla("entrada", document.querySelector("#pantallaMovimientos .tab"));
}

function irRegistro() {
  document.getElementById("pantallaMovimientos").style.display = "none";
  document.getElementById("pantallaRegistro").style.display = "block";
}

async function verTabla(tipo, el) {
  document.querySelectorAll("#pantallaMovimientos .tab").forEach(t => t.classList.remove("active"));
  el.classList.add("active");

  const tablaDiv = document.getElementById("tabla");
  tablaDiv.innerHTML = `<div style="padding:20px;text-align:center"><div class="loader" style="border-top-color:#2563eb"></div></div>`;

  try {
    const res = await fetch(`${WEBAPP_URL}?action=${tipo === "entrada" ? "getEntradas" : "getSalidas"}`);
    const json = await res.json();
    if (json.status === "ok") renderTabla(json.data);
    else tablaDiv.innerHTML = "<p style='text-align:center;color:#b91c1c'>❌ Error al cargar</p>";
  } catch {
    tablaDiv.innerHTML = "<p style='text-align:center;color:#b91c1c'>❌ Error al cargar</p>";
  }
}

function renderTabla(data) {
  const tablaDiv = document.getElementById("tabla");
  if (!data || !data.length) {
    tablaDiv.innerHTML = "<p style='text-align:center;color:#9ca3af'>Sin registros</p>";
    return;
  }
  let html = `<div class="table"><div class="row header"><div class="cell">Producto</div><div class="cell small">Cant.</div><div class="cell small">Usuario</div></div>`;
  data.forEach(r => {
    html += `<div class="row"><div class="cell">${r[1] || ""}</div><div class="cell small">${r[2] || ""}</div><div class="cell small">${r[3] || ""}</div></div>`;
  });
  html += "</div>";
  tablaDiv.innerHTML = html;
}

window.addEventListener("resize", () => {
  document.body.style.height = window.innerHeight + "px";
});

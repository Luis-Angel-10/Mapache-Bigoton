AOS.init();
const API_URL = "http://localhost:8080/api/sucursales";
let modal;

document.addEventListener("DOMContentLoaded", () => {
  modal = new bootstrap.Modal(document.getElementById("sucursalModal"));
  cargarSucursales();
});

async function cargarSucursales() {
  const container = document.getElementById("sucursales-container");
  container.innerHTML = `
    <div class="col-12 text-center text-muted">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-3">Cargando sucursales...</p>
    </div>
  `;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al obtener sucursales");

    const sucursales = await response.json();
    if (sucursales.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center text-muted py-5">
          <i class="fas fa-store-slash fa-3x mb-3"></i>
          <h5>No hay sucursales registradas</h5>
          <button class="btn btn-primary mt-3" onclick="abrirModalSucursal()">
            <i class="fas fa-store me-2"></i>Agregar Sucursal
          </button>
        </div>`;
      return;
    }

    container.innerHTML = sucursales.map(s => crearTarjetaSucursal(s)).join("");
  } catch (error) {
    console.error(error);
    container.innerHTML = `<div class="col-12 text-center text-danger">Error al cargar sucursales.</div>`;
  }
}

function crearTarjetaSucursal(s) {
  return `
    <div class="col-md-4 mb-4" data-aos="fade-up">
      <div class="sucursal-card">
        <div class="sucursal-header">
          <h5>${s.nombre}</h5>
          <div>
            <button class="btn-action btn-edit" onclick="editarSucursal(${s.id})"><i class="fas fa-edit"></i></button>
            <button class="btn-action btn-delete" onclick="eliminarSucursal(${s.id})"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <hr>
        <div class="sucursal-info">
          <p><i class="fas fa-map-marker-alt me-2"></i>${s.direccion}</p>
          <p><i class="fas fa-phone me-2"></i>${s.telefono || "Sin teléfono"}</p>
          <p><i class="fas fa-clock me-2"></i>${s.horario || "Horario no definido"}</p>
          <p><i class="fas fa-toggle-${s.activa ? "on text-success" : "off text-secondary"} me-2"></i>
            ${s.activa ? "Activa" : "Inactiva"}
          </p>
        </div>
      </div>
    </div>
  `;
}

function abrirModalSucursal() {
  document.getElementById("formSucursal").reset();
  document.getElementById("sucursalId").value = "";
  document.getElementById("sucursalModalLabel").textContent = "Agregar Sucursal";
  modal.show();
}

async function guardarSucursal() {
  const id = document.getElementById("sucursalId").value;
  const data = {
    nombre: document.getElementById("nombre").value,
    direccion: document.getElementById("direccion").value,
    telefono: document.getElementById("telefono").value,
    horario: document.getElementById("horario").value,
    activa: document.getElementById("activa").checked
  };

  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("Error al guardar sucursal");

    Swal.fire({
      icon: "success",
      title: "¡Sucursal guardada!",
      timer: 1500,
      showConfirmButton: false
    });

    modal.hide();
    cargarSucursales();
  } catch (error) {
    Swal.fire("Error", "No se pudo guardar la sucursal", "error");
  }
}

async function editarSucursal(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    const s = await res.json();

    document.getElementById("sucursalId").value = s.id;
    document.getElementById("nombre").value = s.nombre;
    document.getElementById("direccion").value = s.direccion;
    document.getElementById("telefono").value = s.telefono;
    document.getElementById("horario").value = s.horario;
    document.getElementById("activa").checked = s.activa;

    document.getElementById("sucursalModalLabel").textContent = "Editar Sucursal";
    modal.show();
  } catch (error) {
    Swal.fire("Error", "No se pudo cargar la sucursal", "error");
  }
}

async function eliminarSucursal(id) {
  const confirm = await Swal.fire({
    title: "¿Eliminar sucursal?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    Swal.fire("Eliminada", "La sucursal ha sido eliminada", "success");
    cargarSucursales();
  } catch (error) {
    Swal.fire("Error", "No se pudo eliminar la sucursal", "error");
  }
}

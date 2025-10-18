const API_BASE_URL = 'http://localhost:8080/api';

let barberos = [];
let barberoEditando = null;
let vistaActual = 'grid';
let imagenBase64 = "";

// ===================== INICIALIZACIÓN ===================== //
document.addEventListener('DOMContentLoaded', () => {
    inicializarAOS();
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.classList.remove('d-none');

    cargarSucursales();   // ✅ Cargar lista de sucursales al iniciar
    cargarBarberos();
    configurarEventListeners();
});

function inicializarAOS() {
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
}


function configurarEventListeners() {
    document.getElementById('btnGuardarBarbero').addEventListener('click', guardarBarbero);
    document.getElementById('buscarBarbero').addEventListener('input', filtrarBarberos);
    document.getElementById('filtroEspecialidad').addEventListener('change', filtrarBarberos);
    document.getElementById('crearBarberoModal').addEventListener('hidden.bs.modal', () => {
        limpiarFormularioBarbero();
        barberoEditando = null;
        imagenBase64 = "";
    });

    document.getElementById('fotoInput').addEventListener('change', manejarSeleccionImagen);
}


async function cargarSucursales() {
    try {
        const response = await fetch(`${API_BASE_URL}/sucursales`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const sucursales = await response.json();

        const select = document.getElementById('sucursal');
        if (!select) return;

        select.innerHTML = '<option value="" disabled selected>Selecciona una sucursal</option>';
        sucursales.forEach(sucursal => {
            const option = document.createElement('option');
            option.value = sucursal.id_sucursal ?? sucursal.id;
            option.textContent = sucursal.nombre;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar sucursales:', error);
    }
}


function manejarSeleccionImagen(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('fotoPreview');

    if (!file) {
        preview.innerHTML = '<span class="text-muted">No hay imagen seleccionada</span>';
        return;
    }

    if (!file.type.match('image.*')) {
        Swal.fire('Error', 'Selecciona un archivo de imagen válido', 'error');
        event.target.value = '';
        preview.innerHTML = '<span class="text-muted">No hay imagen seleccionada</span>';
        return;
    }

    // ✅ Comprimir imagen primero (aunque pese más de 2 MB)
    comprimirImagen(file, 800, 0.7)
        .then(blob => {
            // ✅ Validar tamaño DESPUÉS de la compresión (2 MB máximo)
            if (blob.size > 2 * 1024 * 1024) {
                Swal.fire('Advertencia', 'La imagen sigue siendo muy grande incluso después de comprimirla (máx 2 MB)', 'warning');
                event.target.value = '';
                preview.innerHTML = '<span class="text-muted">No hay imagen seleccionada</span>';
                return;
            }

            // Convertir blob comprimido a Base64
            const reader = new FileReader();
            reader.onload = e => {
                imagenBase64 = e.target.result;
                preview.innerHTML = `<img src="${imagenBase64}" class="img-fluid" style="max-height: 100px;" alt="Vista previa">`;
            };
            reader.readAsDataURL(blob);
        })
        .catch(err => {
            console.error('Error al comprimir imagen:', err);
            Swal.fire('Error', 'No se pudo procesar la imagen', 'error');
        });
}


function comprimirImagen(file, maxWidth, calidad = 0.8) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function () {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(blob => {
                if (blob) resolve(blob);
                else reject(new Error('No se pudo comprimir'));
            }, 'image/jpeg', calidad);
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


async function cargarBarberos() {
    try {
        mostrarLoading(true);
        const response = await fetch(`${API_BASE_URL}/barberos`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        barberos = await response.json();
        mostrarBarberos(barberos);
        actualizarEstadisticas();
        actualizarContador();
    } catch (error) {
        console.error('Error cargando barberos:', error);
        usarBarberosDePrueba();
    } finally {
        mostrarLoading(false);
    }
}

function mostrarBarberos(lista) {
    const contenedor = document.getElementById('barberos-grid');
    const sinBarberos = document.getElementById('sin-barberos');

    if (!Array.isArray(lista) || lista.length === 0) {
        contenedor.innerHTML = '';
        sinBarberos.classList.remove('d-none');
        return;
    }

    sinBarberos.classList.add('d-none');

    contenedor.innerHTML = vistaActual === 'grid'
        ? lista.map(crearCardBarbero).join('')
        : lista.map(crearFilaBarbero).join('');

    setTimeout(() => {
        document.querySelectorAll('.btn-editar').forEach(btn =>
            btn.addEventListener('click', () => editarBarbero(btn.dataset.id)));
        document.querySelectorAll('.btn-eliminar').forEach(btn =>
            btn.addEventListener('click', () => eliminarBarbero(btn.dataset.id)));
    }, 100);
}

function crearCardBarbero(barbero) {
    const id = barbero.id_barbero ?? barbero.id;
    const especialidad = barbero.especialidad || 'Barbero Profesional';
    const sucursal = barbero.sucursal?.nombre || '-';

    return `
    <div class="col-lg-4 col-md-6" data-aos="fade-up">
      <div class="barbero-card card h-100 ${barbero.activo === false ? 'no-disponible' : 'disponible'}">
        <div class="card-body text-center p-4">
          ${barbero.foto
            ? `<img src="${barbero.foto}" alt="${barbero.nombre}" class="barbero-image">`
            : `<div class="default-avatar"><i class="fas fa-user"></i></div>`}
          <h4 class="card-title fw-bold">${barbero.nombre}</h4>
          <p class="text-muted mb-1">${especialidad}</p>
          <p class="text-muted small mb-2">Sucursal: ${sucursal}</p>
          <span class="experiencia-badge">${barbero.experiencia || 0} años</span>
          <p class="small text-muted mt-2">${barbero.descripcion || 'Barbero profesional'}</p>

          <div class="acciones-grupo mt-3">
            <button class="btn btn-editar btn-sm" data-id="${id}">
              <i class="fas fa-edit me-1"></i>Editar
            </button>
            <button class="btn btn-eliminar btn-sm" data-id="${id}">
              <i class="fas fa-trash me-1"></i>Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

function crearFilaBarbero(barbero) {
    const id = barbero.id_barbero ?? barbero.id;
    const sucursal = barbero.sucursal?.nombre || '-';

    return `
    <div class="col-12" data-aos="fade-up">
      <div class="barbero-lista d-flex justify-content-between align-items-center p-2 border rounded">
        <div>
          <strong>${barbero.nombre}</strong> - ${barbero.especialidad || 'Barbero Profesional'} 
          <br><small>Sucursal: ${sucursal}</small>
        </div>
        <div>
          <button class="btn btn-editar btn-sm me-1" data-id="${id}"><i class="fas fa-edit"></i></button>
          <button class="btn btn-eliminar btn-sm" data-id="${id}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>`;
}

function filtrarBarberos() {
    const texto = document.getElementById('buscarBarbero').value.toLowerCase();
    const especialidad = document.getElementById('filtroEspecialidad').value;

    const filtrados = barberos.filter(b => {
        const coincideNombre = b.nombre.toLowerCase().includes(texto);
        const coincideEspecialidad = especialidad ? b.especialidad === especialidad : true;
        return coincideNombre && coincideEspecialidad;
    });

    mostrarBarberos(filtrados);
    actualizarContador(filtrados.length);
}


async function guardarBarbero() {
    const form = document.getElementById('formBarbero');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    try {
        mostrarLoading(true);
        const fotoInput = document.getElementById('fotoInput');
        if (fotoInput.files.length > 0) {
            imagenBase64 = await convertirImagenABase64(fotoInput.files[0]);
        }

        const barberoData = {
            nombre: document.getElementById('nombre').value.trim(),
            especialidad: document.getElementById('especialidad').value,
            experiencia: parseInt(document.getElementById('experiencia').value) || 0,
            edad: parseInt(document.getElementById('edad').value) || null,
            telefono: document.getElementById('telefono').value.trim() || null,
            descripcion: document.getElementById('descripcion').value.trim() || null,
            horario: document.getElementById('horario').value || null,
            foto: imagenBase64,
            email: document.getElementById('email').value.trim() || null,
            activo: document.getElementById('activo').checked,
            sucursal: document.getElementById('sucursal').value
                ? { id_sucursal: parseInt(document.getElementById('sucursal').value) }
                : null
        };


        const id = document.getElementById('barberoId').value;

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_BASE_URL}/barberos/${id}` : `${API_BASE_URL}/barberos`;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(barberoData)
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);

        const modal = bootstrap.Modal.getInstance(document.getElementById('crearBarberoModal'));
        if (modal) modal.hide();

        await Swal.fire({
            icon: 'success',
            title: id ? 'Barbero actualizado' : 'Barbero registrado',
            showConfirmButton: false,
            timer: 1500
        });

        form.reset();
        imagenBase64 = "";
        await cargarBarberos();

    } catch (error) {
        console.error('Error al guardar barbero:', error);
        Swal.fire('Error', 'No se pudo guardar el barbero', 'error');
    } finally {
        mostrarLoading(false);
    }
}

async function editarBarbero(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/barberos/${id}`);
        if (!response.ok) throw new Error(`Error ${response.status}`);
        const barbero = await response.json();

        barberoEditando = barbero;

        document.getElementById('barberoId').value = barbero.id_barbero;
        document.getElementById('nombre').value = barbero.nombre;
        document.getElementById('especialidad').value = barbero.especialidad || '';
        document.getElementById('experiencia').value = barbero.experiencia || '';
        document.getElementById('edad').value = barbero.edad || '';
        document.getElementById('telefono').value = barbero.telefono || '';
        document.getElementById('descripcion').value = barbero.descripcion || '';
        document.getElementById('horario').value = barbero.horario || '';
        document.getElementById('email').value = barbero.email || '';
        document.getElementById('activo').checked = barbero.activo;

        // ✅ Mostrar la sucursal actual
        setTimeout(() => {
            const selectSucursal = document.getElementById('sucursal');
            if (selectSucursal) {
                selectSucursal.value = barbero.sucursal?.id_sucursal || '';
            }
        }, 300);

        // ✅ Mostrar foto actual
        const preview = document.getElementById('fotoPreview');
        if (barbero.foto) {
            preview.innerHTML = `<img src="${barbero.foto}" class="img-fluid" style="max-height:100px;">`;
            imagenBase64 = barbero.foto;
        } else {
            preview.innerHTML = '<span class="text-muted">No hay imagen seleccionada</span>';
        }

        const modal = new bootstrap.Modal(document.getElementById('crearBarberoModal'));
        modal.show();

    } catch (error) {
        console.error('Error al editar barbero:', error);
    }
}

async function eliminarBarbero(id) {
    const confirmacion = await Swal.fire({
        title: '¿Eliminar barbero?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        try {
            const response = await fetch(`${API_BASE_URL}/barberos/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            Swal.fire('Eliminado', 'El barbero ha sido eliminado', 'success');
            await cargarBarberos();
        } catch (error) {
            console.error('Error al eliminar barbero:', error);
            Swal.fire('Error', 'No se pudo eliminar el barbero', 'error');
        }
    }
}

// ===================== UTILIDADES ===================== //

function limpiarFormularioBarbero() {
    document.getElementById('formBarbero').reset();
    document.getElementById('fotoPreview').innerHTML = '<span class="text-muted">No hay imagen seleccionada</span>';
    document.getElementById('formBarbero').classList.remove('was-validated');
    document.getElementById('barberoId').value = '';
}

function mostrarLoading(mostrar) {
    const contenedor = document.getElementById('barberos-grid');
    if (mostrar) {
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status"></div>
                <p>Cargando barberos...</p>
            </div>`;
    }
}

// ===================== ESTADÍSTICAS ===================== //

function actualizarEstadisticas() {
    const total = barberos.length;
    const experienciaPromedio = total > 0
        ? Math.round(barberos.reduce((sum, b) => sum + (b.experiencia || 0), 0) / total)
        : 0;
    const especialidades = new Set(barberos.map(b => b.especialidad)).size;

    document.getElementById('total-barberos').textContent = total;
    document.getElementById('experiencia-promedio').textContent = experienciaPromedio;
    document.getElementById('especialidades').textContent = especialidades;
}

function actualizarContador(total = barberos.length) {
    document.getElementById('contadorBarberos').textContent =
        `${total} barbero${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;
}

function usarBarberosDePrueba() {
    barberos = [
        { id_barbero: 1, nombre: "Carlos Mendoza", especialidad: "Corte Clásico", experiencia: 10, activo: true },
        { id_barbero: 2, nombre: "Javier López", especialidad: "Corte Moderno", experiencia: 7, activo: true },
    ];
    mostrarBarberos(barberos);
    actualizarEstadisticas();
    actualizarContador();
}

// ===================== EXPOSICIÓN GLOBAL ===================== //
window.abrirModalCrear = () => {
    barberoEditando = null;
    limpiarFormularioBarbero();
    document.getElementById('modalTitulo').textContent = 'Crear Barbero';
    document.getElementById('btnGuardarBarbero').innerHTML = '<i class="fas fa-save me-2"></i>Guardar Barbero';
    const modal = new bootstrap.Modal(document.getElementById('crearBarberoModal'));
    modal.show();
};

window.cambiarVista = tipo => {
    vistaActual = tipo;
    mostrarBarberos(barberos);
};

window.guardarBarbero = guardarBarbero;
window.editarBarbero = editarBarbero;
window.eliminarBarbero = eliminarBarbero;
window.limpiarFiltros = () => { document.getElementById('buscarBarbero').value = ''; filtrarBarberos(); };

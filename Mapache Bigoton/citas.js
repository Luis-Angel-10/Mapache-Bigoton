const API_BASE_URL = 'http://localhost:8080/api';

let serviciosData = [];
let barberosData = [];
let sucursalesData = [];

document.addEventListener('DOMContentLoaded', function() {
    inicializarAOS();
    configurarFechaMinima();
    cargarDatosIniciales();
    configurarEventListeners();
    verificarServicioPreSeleccionado();
});

function inicializarAOS() {
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
}

function configurarFechaMinima() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fecha').setAttribute('min', today);
    document.getElementById('fecha').value = today;
}

async function cargarDatosIniciales() {
    try {
        await Promise.all([
            cargarServicios(),
            cargarBarberos(),
            cargarSucursales()
        ]);
        generarHorasDisponibles();
    } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        mostrarErrorCarga();
    }
}

function configurarEventListeners() {
    document.getElementById('nombre').addEventListener('input', validarNombre);
    document.getElementById('telefono').addEventListener('input', validarTelefono);
    document.getElementById('fecha').addEventListener('change', validarFecha);
    document.getElementById('citaForm').addEventListener('submit', manejarEnvioFormulario);
    document.getElementById('servicio').addEventListener('change', actualizarResumen);
    document.getElementById('barbero').addEventListener('change', actualizarResumen);
    document.getElementById('fecha').addEventListener('change', actualizarResumen);
    document.getElementById('hora').addEventListener('change', actualizarResumen);
}

function verificarServicioPreSeleccionado() {
    const servicioGuardado = localStorage.getItem('servicioSeleccionado');
    if (servicioGuardado) {
        const servicio = JSON.parse(servicioGuardado);
        setTimeout(() => {
            const selectServicio = document.getElementById('servicio');
            selectServicio.value = servicio.id;
            localStorage.removeItem('servicioSeleccionado');
        }, 1000);
    }
}


async function cargarSucursales() {
    try {
        const select = document.getElementById('sucursal');
        select.innerHTML = '<option value="" disabled selected>Cargando sucursales...</option>';

        const response = await fetch(`${API_BASE_URL}/sucursales`);
        if (!response.ok) throw new Error(`Error ${response.status}`);

        sucursalesData = await response.json();
        llenarSelectSucursales(sucursalesData);
    } catch (error) {
        console.error('Error cargando sucursales:', error);
        usarSucursalesDePrueba();
    }
}

function llenarSelectSucursales(sucursales) {
    const select = document.getElementById('sucursal');
    select.innerHTML = '<option value="" selected disabled>Selecciona una sucursal</option>';
    
    sucursales.forEach(sucursal => {
        const option = document.createElement('option');
        option.value = sucursal.id_sucursal ?? sucursal.id;
        option.textContent = sucursal.nombre;
        select.appendChild(option);
    });
}

async function cargarServicios() {
    try {
        mostrarLoadingServicios(true);
        const response = await fetch(`${API_BASE_URL}/servicios`);
        if (response.ok) {
            serviciosData = await response.json();
            llenarSelectServicios(serviciosData);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Error cargando servicios:', error);
        usarServiciosDePrueba();
    } finally {
        mostrarLoadingServicios(false);
    }
}

async function cargarBarberos() {
    try {
        mostrarLoadingBarberos(true);
        const response = await fetch(`${API_BASE_URL}/barberos`);
        if (response.ok) {
            barberosData = await response.json();
            llenarSelectBarberos(barberosData);
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (error) {
        console.error('Error cargando barberos:', error);
        usarBarberosDePrueba();
    } finally {
        mostrarLoadingBarberos(false);
    }
}

function llenarSelectServicios(servicios) {
    const selectServicio = document.getElementById('servicio');
    selectServicio.innerHTML = '<option value="" selected disabled>Selecciona un servicio</option>';
    
    servicios.forEach(servicio => {
        const option = document.createElement('option');
        option.value = servicio.id_servicio;
        option.textContent = `${servicio.descripcion} - $${servicio.costo} MXN`;
        option.setAttribute('data-costo', servicio.costo);
        option.setAttribute('data-descripcion', servicio.descripcion);
        selectServicio.appendChild(option);
    });
}

function llenarSelectBarberos(barberos) {
    const selectBarbero = document.getElementById('barbero');
    selectBarbero.innerHTML = '<option value="" selected>Sin preferencia</option>';
    
    barberos.forEach(barbero => {
        const option = document.createElement('option');
        option.value = barbero.id_barbero;
        option.textContent = barbero.nombre;
        selectBarbero.appendChild(option);
    });
}


function generarHorasDisponibles() {
    const selectHora = document.getElementById('hora');
    selectHora.innerHTML = '<option value="" selected disabled>Selecciona una hora</option>';
    
    for (let hora = 9; hora <= 19; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
            const hora24 = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`;
            const hora12 = formato12h(hora, minuto);
            
            const option = document.createElement('option');
            option.value = hora24;
            option.textContent = hora12;
            selectHora.appendChild(option);
        }
    }
}

function validarNombre() {
    const input = document.getElementById('nombre');
    const value = input.value.trim();
    
    if (value.length < 2 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        input.classList.add('is-invalid');
        return false;
    }
    
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
}

function validarTelefono() {
    const input = document.getElementById('telefono');
    const value = input.value.replace(/\D/g, '');
    
    if (value.length !== 10) {
        input.classList.add('is-invalid');
        return false;
    }
    
    input.value = value;
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
}

function validarFecha() {
    const input = document.getElementById('fecha');
    const fechaSeleccionada = new Date(input.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
        input.classList.add('is-invalid');
        Swal.fire('Fecha inválida', 'No puedes seleccionar una fecha pasada', 'warning');
        input.value = hoy.toISOString().split('T')[0];
        return false;
    }
    
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    return true;
}

function validarFormulario() {
    const nombreValido = validarNombre();
    const telefonoValido = validarTelefono();
    const servicioValido = document.getElementById('servicio').value !== '';
    const sucursalValida = document.getElementById('sucursal').value !== '';
    const fechaValida = validarFecha();
    const horaValida = document.getElementById('hora').value !== '';
    
    return nombreValido && telefonoValido && servicioValido && sucursalValida && fechaValida && horaValida;
}


async function manejarEnvioFormulario(e) {
    e.preventDefault();
    
    if (!validarFormulario()) {
        Swal.fire('Error', 'Por favor completa todos los campos requeridos correctamente', 'error');
        return;
    }
    
    await enviarCita();
}

async function enviarCita() {
    const submitBtn = document.querySelector('#citaForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Agendando...';
        submitBtn.disabled = true;
        
        const datosCita = obtenerDatosFormulario();
        const confirmacion = await mostrarConfirmacion(datosCita);
        
        if (confirmacion) {
            const resultado = await enviarAlBackend(datosCita);
            await mostrarResultadoExitoso(resultado, datosCita);
            limpiarFormulario();
        }
    } catch (error) {
        await manejarError(error);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function obtenerDatosFormulario() {
    const servicioSelect = document.getElementById('servicio');
    const servicioOption = servicioSelect.options[servicioSelect.selectedIndex];
    const sucursalSelect = document.getElementById('sucursal');
    const sucursalOption = sucursalSelect.options[sucursalSelect.selectedIndex];
    
    return {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value,
        servicioId: parseInt(servicioSelect.value),
        servicioDescripcion: servicioOption.getAttribute('data-descripcion'),
        servicioCosto: servicioOption.getAttribute('data-costo'),
        sucursalId: parseInt(sucursalSelect.value),
        sucursalNombre: sucursalOption.textContent,
        barberoId: document.getElementById('barbero').value || null,
        barberoNombre: document.getElementById('barbero').options[document.getElementById('barbero').selectedIndex].text,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        comentarios: document.getElementById('comentarios').value.trim()
    };
}

async function mostrarConfirmacion(datos) {
    const fechaFormateada = new Date(datos.fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const [horaNum] = datos.hora.split(':');
    const horaFormateada = formato12h(parseInt(horaNum), 0);
    
    const { value: confirmar } = await Swal.fire({
        title: '¿Confirmar cita?',
        html: `
            <div class="text-start">
                <strong>👤 Cliente:</strong> ${datos.nombre}<br>
                <strong>📞 Teléfono:</strong> ${datos.telefono}<br>
                <strong>🏢 Sucursal:</strong> ${datos.sucursalNombre}<br>
                <strong>✂️ Servicio:</strong> ${datos.servicioDescripcion} - $${datos.servicioCosto} MXN<br>
                <strong>👨‍💼 Barbero:</strong> ${datos.barberoId ? datos.barberoNombre : 'Sin preferencia'}<br>
                <strong>📅 Fecha:</strong> ${fechaFormateada}<br>
                <strong>⏰ Hora:</strong> ${horaFormateada}<br>
                ${datos.comentarios ? `<strong>💬 Comentarios:</strong> ${datos.comentarios}` : ''}
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, agendar cita',
        cancelButtonText: 'Revisar datos',
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#6c757d',
        width: '600px'
    });
    return confirmar;
}

async function enviarAlBackend(datosCita) {
    const cliente = await crearClienteTemporal(datosCita.nombre, datosCita.telefono);
    
    const citaData = {
        fecha: datosCita.fecha,
        hora: datosCita.hora,
        barberoId: datosCita.barberoId ? parseInt(datosCita.barberoId) : null,
        clienteId: cliente.id_cliente,
        servicioId: datosCita.servicioId,
        sucursalId: datosCita.sucursalId
    };
    
    const response = await fetch(`${API_BASE_URL}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citaData)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return await response.json();
}

async function crearClienteTemporal(nombre, telefono) {
    try {
        const clienteData = {
            nombre: nombre,
            correo: `${nombre.replace(/\s+/g, '').toLowerCase()}@email.com`,
            contrasenia: "temp123",
            telefono: telefono
        };
        const response = await fetch(`${API_BASE_URL}/clientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clienteData)
        });
        if (response.ok) return await response.json();
        throw new Error('Error creando cliente');
    } catch {
        return {
            id_cliente: Math.floor(Math.random() * 1000) + 1,
            nombre: nombre,
            correo: `${nombre.replace(/\s+/g, '').toLowerCase()}@email.com`
        };
    }
}

async function mostrarResultadoExitoso(resultado, datos) {
    await Swal.fire({
        title: '¡Cita agendada! 🎉',
        html: `
            <div class="text-center">
                <i class="fas fa-check-circle text-success mb-3" style="font-size: 4rem;"></i>
                <h4 class="text-success">¡Reserva confirmada!</h4>
                <p><strong>ID de cita:</strong> #${resultado.id_cita}</p>
                <p><strong>Sucursal:</strong> ${datos.sucursalNombre}</p>
                <p><strong>Servicio:</strong> ${datos.servicioDescripcion}</p>
                <p><strong>Fecha:</strong> ${new Date(datos.fecha).toLocaleDateString('es-ES')}</p>
                <p><strong>Hora:</strong> ${formato12h(parseInt(datos.hora.split(':')[0]), 0)}</p>
                <div class="alert alert-info small mt-3">
                    <i class="fas fa-info-circle me-2"></i>
                    Te esperamos 15 minutos antes de tu cita
                </div>
            </div>
        `,
        icon: 'success',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#0d6efd',
        width: '500px'
    });
}

function limpiarFormulario() {
    document.getElementById('citaForm').reset();
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
}


async function manejarError(error) {
    console.error('Error agendando cita:', error);
    await Swal.fire({
        title: 'Error',
        text: 'No se pudo agendar la cita. ' + (error.message || ''),
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc3545'
    });
}

function formato12h(hora, minuto) {
    const periodo = hora >= 12 ? 'PM' : 'AM';
    const hora12 = hora % 12 || 12;
    return `${hora12}:${minuto.toString().padStart(2, '0')} ${periodo}`;
}

function mostrarLoadingServicios(mostrar) {
    const select = document.getElementById('servicio');
    if (mostrar)
        select.innerHTML = '<option value="" disabled>Cargando servicios...</option>';
}

function mostrarLoadingBarberos(mostrar) {
    const select = document.getElementById('barbero');
    if (mostrar)
        select.innerHTML = '<option value="" disabled>Cargando barberos...</option>';
}

function mostrarErrorCarga() {
    Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudieron cargar los datos. Usando información local.',
        icon: 'warning',
        timer: 3000
    });
}

function usarSucursalesDePrueba() {
    sucursalesData = [
        { id_sucursal: 1, nombre: "Sucursal Centro" },
        { id_sucursal: 2, nombre: "Sucursal Norte" },
        { id_sucursal: 3, nombre: "Sucursal Sur" }
    ];
    llenarSelectSucursales(sucursalesData);
}

function usarServiciosDePrueba() {
    serviciosData = [
        { id_servicio: 1, descripcion: "Corte de Cabello", costo: 150 },
        { id_servicio: 2, descripcion: "Arreglo de Barba", costo: 100 },
        { id_servicio: 3, descripcion: "Corte + Barba", costo: 220 }
    ];
    llenarSelectServicios(serviciosData);
}

function usarBarberosDePrueba() {
    barberosData = [
        { id_barbero: 1, nombre: "Carlos Mendoza" },
        { id_barbero: 2, nombre: "Javier López" },
        { id_barbero: 3, nombre: "Miguel Ángel" }
    ];
    llenarSelectBarberos(barberosData);
}

function actualizarResumen() {
    console.log('Formulario actualizado');
}

window.recargarServicios = cargarServicios;
window.recargarBarberos = cargarBarberos;

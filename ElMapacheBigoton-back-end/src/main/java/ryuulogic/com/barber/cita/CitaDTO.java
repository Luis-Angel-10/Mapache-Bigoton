package ryuulogic.com.barber.cita;

import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;

public class CitaDTO {

    private Long id_cita;
    private LocalDate fecha;
    private LocalTime hora;

    private Long barberoId;
    private String barberoNombre;

    private Long clienteId;
    private String clienteNombre;

    private Long servicioId;
    private String servicioDescripcion;
    private Double servicioCosto;

    private Long sucursalId;
    private String sucursalNombre;
    private String sucursalDireccion;

    public CitaDTO() {}

    public CitaDTO(Long id_cita, Date fecha, Time hora,
                   Long barberoId, String barberoNombre,
                   Long clienteId, String clienteNombre,
                   Long servicioId, String servicioDescripcion, Double servicioCosto,
                   Long sucursalId, String sucursalNombre, String sucursalDireccion) {

        this.id_cita = id_cita;
        this.fecha = fecha.toLocalDate();
        this.hora = hora.toLocalTime();
        this.barberoId = barberoId;
        this.barberoNombre = barberoNombre;
        this.clienteId = clienteId;
        this.clienteNombre = clienteNombre;
        this.servicioId = servicioId;
        this.servicioDescripcion = servicioDescripcion;
        this.servicioCosto = servicioCosto;
        this.sucursalId = sucursalId;
        this.sucursalNombre = sucursalNombre;
        this.sucursalDireccion = sucursalDireccion;
    }

    public Long getId_cita() { return id_cita; }
    public void setId_cita(Long id_cita) { this.id_cita = id_cita; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(Date fecha) { this.fecha = fecha.toLocalDate(); }

    public LocalTime getHora() { return hora; }
    public void setHora(Time hora) { this.hora = hora.toLocalTime(); }

    public Long getBarberoId() { return barberoId; }
    public void setBarberoId(Long barberoId) { this.barberoId = barberoId; }

    public String getBarberoNombre() { return barberoNombre; }
    public void setBarberoNombre(String barberoNombre) { this.barberoNombre = barberoNombre; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public Long getServicioId() { return servicioId; }
    public void setServicioId(Long servicioId) { this.servicioId = servicioId; }

    public String getServicioDescripcion() { return servicioDescripcion; }
    public void setServicioDescripcion(String servicioDescripcion) { this.servicioDescripcion = servicioDescripcion; }

    public Double getServicioCosto() { return servicioCosto; }
    public void setServicioCosto(Double servicioCosto) { this.servicioCosto = servicioCosto; }

    public Long getSucursalId() { return sucursalId; }
    public void setSucursalId(Long sucursalId) { this.sucursalId = sucursalId; }

    public String getSucursalNombre() { return sucursalNombre; }
    public void setSucursalNombre(String sucursalNombre) { this.sucursalNombre = sucursalNombre; }

    public String getSucursalDireccion() { return sucursalDireccion; }
    public void setSucursalDireccion(String sucursalDireccion) { this.sucursalDireccion = sucursalDireccion; }
}

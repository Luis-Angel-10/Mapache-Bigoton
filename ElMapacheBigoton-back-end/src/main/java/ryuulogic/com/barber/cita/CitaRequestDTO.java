package ryuulogic.com.barber.cita;

import java.sql.Date;
import java.sql.Time;

public class CitaRequestDTO {

    private Date fecha;
    private Time hora;

    private Long barberoId;
    private Long clienteId;
    private String clienteNombre;
    private Long servicioId;


    private Long sucursalId;

    public Date getFecha() { return fecha; }
    public void setFecha(Date fecha) { this.fecha = fecha; }

    public Time getHora() { return hora; }
    public void setHora(Time hora) { this.hora = hora; }

    public Long getBarberoId() { return barberoId; }
    public void setBarberoId(Long barberoId) { this.barberoId = barberoId; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public Long getServicioId() { return servicioId; }
    public void setServicioId(Long servicioId) { this.servicioId = servicioId; }

    public Long getSucursalId() { return sucursalId; }
    public void setSucursalId(Long sucursalId) { this.sucursalId = sucursalId; }
}

package ryuulogic.com.barber.cita;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ryuulogic.com.barber.barbero.Barbero;
import ryuulogic.com.barber.cliente.Cliente;

import java.sql.Date;
import java.util.List;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByBarbero(Barbero barbero);
    List<Cita> findByFecha(Date fecha);
    List<Cita> findByCliente(Cliente cliente);
    @Query("SELECT c FROM Cita c WHERE c.fecha = :fecha AND c.hora = :hora AND c.barbero = :barbero")
    List<Cita> findByFechaAndHoraAndBarbero(@Param("fecha") Date fecha,
                                            @Param("hora") java.sql.Time hora,
                                            @Param("barbero") Barbero barbero);

    @Query("SELECT c FROM Cita c WHERE c.fecha BETWEEN :startDate AND :endDate ORDER BY c.fecha, c.hora")
    List<Cita> findByFechaBetween(@Param("startDate") Date startDate,
                                  @Param("endDate") Date endDate);
}
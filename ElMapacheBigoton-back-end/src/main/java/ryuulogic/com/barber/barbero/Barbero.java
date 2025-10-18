package ryuulogic.com.barber.barbero;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import ryuulogic.com.barber.Sucursales.Sucursal;
import ryuulogic.com.barber.cita.Cita;

import java.util.ArrayList;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "barbero")
public class Barbero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_barbero;

    @Column(nullable = false, length = 100)
    private String nombre;

    private String especialidad;
    private Integer experiencia;
    private Integer edad;
    private String telefono;
    @Column(length = 1000)
    private String descripcion;
    private String horario;
    @Column(columnDefinition = "MEDIUMTEXT")
    private String foto;
    private String email;
    private Boolean activo = true;

    @JsonIgnore
    @OneToMany(mappedBy = "barbero", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Cita> cita = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sucursal", nullable = false)
    private Sucursal sucursal;
}

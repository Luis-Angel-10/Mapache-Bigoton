package ryuulogic.com.barber.barbero;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ryuulogic.com.barber.Sucursales.Sucursal;
import ryuulogic.com.barber.Sucursales.SucursalRepository;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:5173", "file://", "null"})
@RestController
@RequestMapping("/api/barberos")
public class BarberoController {

    @Autowired
    private BarberoRepository barberoRepository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Barbero>> getAllBarberos() {
        try {
            List<Barbero> barberos = (List<Barbero>) barberoRepository.findAll();
            return ResponseEntity.ok(barberos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Barbero> getBarberoById(@PathVariable Long id) {
        Optional<Barbero> barbero = barberoRepository.findById(id);
        return barbero.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Servicio de barberos funcionando");
    }

    @PostMapping
    public ResponseEntity<?> createBarbero(@RequestBody Barbero barbero) {
        try {
            System.out.println("=== INICIANDO CREACIÓN DE BARBERO ===");
            System.out.println("Datos recibidos:");
            System.out.println("- Nombre: " + barbero.getNombre());
            System.out.println("- Especialidad: " + barbero.getEspecialidad());
            System.out.println("- Experiencia: " + barbero.getExperiencia());
            System.out.println("- Email: " + barbero.getEmail());
            System.out.println("- Sucursal ID: " +
                    (barbero.getSucursal() != null ? barbero.getSucursal().getId_sucursal() : "null"));

            if (barbero.getNombre() == null || barbero.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("El nombre es obligatorio");
            }

            if (barbero.getSucursal() == null || barbero.getSucursal().getId_sucursal() == null) {
                return ResponseEntity.badRequest().body("Debe seleccionar una sucursal válida");
            }

            Sucursal sucursal = sucursalRepository.findById(barbero.getSucursal().getId_sucursal())
                    .orElseThrow(() -> new RuntimeException("Sucursal no encontrada con ID: "
                            + barbero.getSucursal().getId_sucursal()));

            barbero.setSucursal(sucursal);

            if (barbero.getActivo() == null) {
                barbero.setActivo(true);
            }

            Barbero savedBarbero = barberoRepository.save(barbero);
            System.out.println("✅ Barbero guardado exitosamente con ID: " + savedBarbero.getId_barbero());

            return ResponseEntity.status(HttpStatus.CREATED).body(savedBarbero);

        } catch (Exception e) {
            System.err.println("❌ ERROR al crear barbero:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBarbero(@PathVariable Long id, @RequestBody Barbero in) {
        try {
            Optional<Barbero> optional = barberoRepository.findById(id);
            if (optional.isEmpty()) return ResponseEntity.notFound().build();

            Barbero existing = optional.get();

            if (in.getNombre() != null) existing.setNombre(in.getNombre());
            if (in.getEspecialidad() != null) existing.setEspecialidad(in.getEspecialidad());
            if (in.getExperiencia() != null) existing.setExperiencia(in.getExperiencia());
            if (in.getEdad() != null) existing.setEdad(in.getEdad());
            if (in.getTelefono() != null) existing.setTelefono(in.getTelefono());
            if (in.getDescripcion() != null) existing.setDescripcion(in.getDescripcion());
            if (in.getHorario() != null) existing.setHorario(in.getHorario());
            if (in.getFoto() != null) existing.setFoto(in.getFoto());
            if (in.getEmail() != null) existing.setEmail(in.getEmail());
            if (in.getActivo() != null) existing.setActivo(in.getActivo());

            if (in.getSucursal() != null && in.getSucursal().getId_sucursal() != null) {
                Sucursal sucursal = sucursalRepository.findById(in.getSucursal().getId_sucursal())
                        .orElseThrow(() -> new RuntimeException("Sucursal no encontrada con ID: "
                                + in.getSucursal().getId_sucursal()));
                existing.setSucursal(sucursal);
            }

            Barbero updated = barberoRepository.save(existing);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar barbero: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBarbero(@PathVariable Long id) {
        if (!barberoRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        barberoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

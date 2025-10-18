package ryuulogic.com.barber.servicio;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:5173", "file://", "null"})
@RestController
@RequestMapping("/api/servicios")
public class ServicioController {

    @Autowired
    private ServicioRepository servicioRepository;

    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Servicio>> getAllServicios() {
        try {
            List<Servicio> servicios = (List<Servicio>) servicioRepository.findAll();
            return ResponseEntity.ok(servicios);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Servicio> getServicioById(@PathVariable Long id) {
        Optional<Servicio> servicio = servicioRepository.findById(id);
        return servicio.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Servicio> createServicio(@RequestBody Servicio servicio) {
        try {
            Servicio savedServicio = servicioRepository.save(servicio);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedServicio);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Servicio> updateServicio(@PathVariable Long id, @RequestBody Servicio servicioDetails) {
        try {
            Optional<Servicio> servicioOptional = servicioRepository.findById(id);

            if (servicioOptional.isPresent()) {
                Servicio servicio = servicioOptional.get();
                servicio.setDescripcion(servicioDetails.getDescripcion());
                servicio.setCosto(servicioDetails.getCosto());

                Servicio updatedServicio = servicioRepository.save(servicio);
                return ResponseEntity.ok(updatedServicio);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteServicio(@PathVariable Long id) {
        try {
            if (servicioRepository.existsById(id)) {
                servicioRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Servicio de servicios funcionando");
    }
}
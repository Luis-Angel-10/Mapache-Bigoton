package ryuulogic.com.barber.Sucursales;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/sucursales")
public class SucursalController {

    @Autowired
    private SucursalRepository sucursalRepository;

    @GetMapping
    public List<Sucursal> getAll() {
        return sucursalRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sucursal> getById(@PathVariable Long id) {
        Optional<Sucursal> sucursal = sucursalRepository.findById(id);
        return sucursal.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Sucursal create(@RequestBody Sucursal sucursal) {
        return sucursalRepository.save(sucursal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sucursal> update(@PathVariable Long id, @RequestBody Sucursal detalles) {
        return sucursalRepository.findById(id)
                .map(sucursal -> {
                    sucursal.setNombre(detalles.getNombre());
                    sucursal.setDireccion(detalles.getDireccion());
                    sucursal.setTelefono(detalles.getTelefono());
                    sucursal.setHorario(detalles.getHorario());
                    sucursal.setActiva(detalles.isActiva());
                    sucursalRepository.save(sucursal);
                    return ResponseEntity.ok(sucursal);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (sucursalRepository.existsById(id)) {
            sucursalRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}

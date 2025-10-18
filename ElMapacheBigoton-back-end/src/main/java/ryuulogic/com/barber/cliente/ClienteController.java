package ryuulogic.com.barber.cliente;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Optional;

@CrossOrigin(origins = {"http://localhost:5173", "file://", "null"})
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    ClienteRepository clienteRepository;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Cliente newCliente, UriComponentsBuilder ucb) {
        try {
            if (clienteRepository.findByCorreo(newCliente.getCorreo()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("{\"message\": \"El correo electrónico ya está registrado\"}");
            }
            if (newCliente.getNombre() == null || newCliente.getNombre().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("{\"message\": \"El nombre es obligatorio\"}");
            }

            if (newCliente.getCorreo() == null || newCliente.getCorreo().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("{\"message\": \"El correo electrónico es obligatorio\"}");
            }

            Cliente savedCliente = clienteRepository.save(newCliente);
            URI uri = ucb
                    .path("/api/clientes/{id_cliente}")
                    .buildAndExpand(savedCliente.getId_cliente())
                    .toUri();
            return ResponseEntity.created(uri).body(savedCliente);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"message\": \"Error interno del servidor: \" + e.getMessage()}");
        }
    }

    @GetMapping()
    public ResponseEntity<Iterable<Cliente>> findAll() {
        return ResponseEntity.ok(clienteRepository.findAll());
    }

    @GetMapping("/{id_cliente}")
    public ResponseEntity<Cliente> findById(@PathVariable Long id_cliente) {
        Optional<Cliente> clienteOptional = clienteRepository.findById(id_cliente);
        return clienteOptional.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }



    @PutMapping("/{id_cliente}")
    public ResponseEntity<Void> update(@PathVariable Long id_cliente, @RequestBody Cliente clienteAct) {
        Optional<Cliente> clienteAntOptional = clienteRepository.findById(id_cliente);
        if (clienteAntOptional.isPresent()) {
            clienteAct.setId_cliente(id_cliente);
            clienteRepository.save(clienteAct);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id_cliente}")
    public ResponseEntity<Void> delete(@PathVariable Long id_cliente) {
        if (clienteRepository.existsById(id_cliente)) {
            clienteRepository.deleteById(id_cliente);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    public static class LoginRequest {
        private String correo;
        private String contrasenia;

        public String getCorreo() { return correo; }
        public void setCorreo(String correo) { this.correo = correo; }
        public String getContrasenia() { return contrasenia; }
        public void setContrasenia(String contrasenia) { this.contrasenia = contrasenia; }
    }
}
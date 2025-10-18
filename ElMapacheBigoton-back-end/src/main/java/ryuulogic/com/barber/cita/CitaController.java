package ryuulogic.com.barber.cita;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ryuulogic.com.barber.Sucursales.Sucursal;
import ryuulogic.com.barber.Sucursales.SucursalRepository;
import ryuulogic.com.barber.barbero.Barbero;
import ryuulogic.com.barber.barbero.BarberoRepository;
import ryuulogic.com.barber.cliente.Cliente;
import ryuulogic.com.barber.cliente.ClienteRepository;
import ryuulogic.com.barber.servicio.Servicio;
import ryuulogic.com.barber.servicio.ServicioRepository;

import java.sql.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = {"http://localhost:5173", "file://", "null"})
@RestController
@RequestMapping("/api/citas")
public class CitaController {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private BarberoRepository barberoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private ServicioRepository servicioRepository;

    @Autowired
    private SucursalRepository sucursalRepository;


    @RequestMapping(method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }


    @GetMapping
    public ResponseEntity<List<CitaDTO>> getAllCitas() {
        try {
            List<Cita> citas = citaRepository.findAll();
            List<CitaDTO> citaDTOs = citas.stream().map(this::convertToDTO).collect(Collectors.toList());
            return ResponseEntity.ok(citaDTOs);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CitaDTO> getCitaById(@PathVariable Long id) {
        try {
            Optional<Cita> citaOptional = citaRepository.findById(id);
            if (citaOptional.isPresent()) {
                CitaDTO citaDTO = convertToDTO(citaOptional.get());
                return ResponseEntity.ok(citaDTO);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @PostMapping
    public ResponseEntity<?> createCita(@RequestBody CitaRequestDTO citaRequest) {
        try {
            System.out.println("Recibiendo solicitud para crear cita: " + citaRequest);

            if (citaRequest.getFecha() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"La fecha es obligatoria\"}");
            }

            if (citaRequest.getHora() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"La hora es obligatoria\"}");
            }

            if (citaRequest.getServicioId() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"El servicio es obligatorio\"}");
            }

            if (citaRequest.getSucursalId() == null) {
                return ResponseEntity.badRequest().body("{\"error\": \"La sucursal es obligatoria\"}");
            }

            Optional<Servicio> servicioOptional = servicioRepository.findById(citaRequest.getServicioId());
            if (!servicioOptional.isPresent()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Servicio no encontrado\"}");
            }
            Servicio servicio = servicioOptional.get();

            Optional<Sucursal> sucursalOptional = sucursalRepository.findById(citaRequest.getSucursalId());
            if (!sucursalOptional.isPresent()) {
                return ResponseEntity.badRequest().body("{\"error\": \"Sucursal no encontrada\"}");
            }
            Sucursal sucursal = sucursalOptional.get();

            Barbero barbero = null;
            if (citaRequest.getBarberoId() != null) {
                Optional<Barbero> barberoOptional = barberoRepository.findById(citaRequest.getBarberoId());
                if (barberoOptional.isPresent()) {
                    barbero = barberoOptional.get();
                } else {
                    return ResponseEntity.badRequest().body("{\"error\": \"Barbero no encontrado\"}");
                }
            }

            Cliente cliente;
            if (citaRequest.getClienteId() != null) {
                cliente = clienteRepository.findById(citaRequest.getClienteId())
                        .orElseGet(() -> crearClienteTemporal(citaRequest.getClienteNombre()));
            } else {
                cliente = crearClienteTemporal(citaRequest.getClienteNombre());
            }

            Cita nuevaCita = new Cita();
            nuevaCita.setFecha(citaRequest.getFecha());
            nuevaCita.setHora(citaRequest.getHora());
            nuevaCita.setBarbero(barbero);
            nuevaCita.setCliente(cliente);
            nuevaCita.setServicio(servicio);
            nuevaCita.setSucursal(sucursal);

            Cita citaGuardada = citaRepository.save(nuevaCita);
            System.out.println("Cita guardada exitosamente: " + citaGuardada.getId_cita());

            CitaDTO citaDTO = convertToDTO(citaGuardada);
            return ResponseEntity.status(HttpStatus.CREATED).body(citaDTO);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Error al crear la cita: " + e.getMessage() + "\"}");
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateCita(@PathVariable Long id, @RequestBody CitaRequestDTO citaRequest) {
        try {
            Optional<Cita> citaOptional = citaRepository.findById(id);

            if (citaOptional.isPresent()) {
                Cita citaExistente = citaOptional.get();

                if (citaRequest.getFecha() != null) {
                    citaExistente.setFecha(citaRequest.getFecha());
                }

                if (citaRequest.getHora() != null) {
                    citaExistente.setHora(citaRequest.getHora());
                }

                if (citaRequest.getBarberoId() != null) {
                    Optional<Barbero> barberoOptional = barberoRepository.findById(citaRequest.getBarberoId());
                    if (barberoOptional.isPresent()) {
                        citaExistente.setBarbero(barberoOptional.get());
                    }
                }

                if (citaRequest.getServicioId() != null) {
                    Optional<Servicio> servicioOptional = servicioRepository.findById(citaRequest.getServicioId());
                    if (servicioOptional.isPresent()) {
                        citaExistente.setServicio(servicioOptional.get());
                    }
                }

                Cita citaActualizada = citaRepository.save(citaExistente);
                CitaDTO citaDTO = convertToDTO(citaActualizada);
                return ResponseEntity.ok(citaDTO);

            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Error al actualizar la cita: \" + e.getMessage()}");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCita(@PathVariable Long id) {
        try {
            if (citaRepository.existsById(id)) {
                citaRepository.deleteById(id);
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Error al eliminar la cita: \" + e.getMessage()}");
        }
    }

    private CitaDTO convertToDTO(Cita cita) {
        CitaDTO dto = new CitaDTO();
        dto.setId_cita(cita.getId_cita());

        if (cita.getFecha() != null) {
            long timeInMillis = cita.getFecha().getTime();
            dto.setFecha(new java.sql.Date(timeInMillis));
        }

        dto.setHora(cita.getHora());

        if (cita.getBarbero() != null) {
            dto.setBarberoId(cita.getBarbero().getId_barbero());
            dto.setBarberoNombre(cita.getBarbero().getNombre());
        }

        if (cita.getCliente() != null) {
            dto.setClienteId(cita.getCliente().getId_cliente());
            dto.setClienteNombre(cita.getCliente().getNombre());
        }

        if (cita.getServicio() != null) {
            dto.setServicioId(cita.getServicio().getId_servicio());
            dto.setServicioDescripcion(cita.getServicio().getDescripcion());
            dto.setServicioCosto(cita.getServicio().getCosto());
        }

        return dto;
    }

    private Cliente crearClienteTemporal(String nombre) {
        Cliente cliente = new Cliente();
        cliente.setNombre(nombre != null ? nombre : "Cliente Temporal");
        cliente.setCorreo("temp" + System.currentTimeMillis() + "@email.com");
        cliente.setContrasenia("temp123");
        return clienteRepository.save(cliente);
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        try {
            long count = citaRepository.count();
            return ResponseEntity.ok("Servicio de citas funcionando correctamente. Total de citas: " + count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body("Error en el servicio: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("{\"message\": \"CitaController está funcionando correctamente\"}");
    }
}
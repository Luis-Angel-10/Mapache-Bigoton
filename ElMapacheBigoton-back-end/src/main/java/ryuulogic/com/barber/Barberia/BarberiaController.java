package ryuulogic.com.barber.Barberia;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/barberia")
public class BarberiaController {

    @GetMapping("/info")
    public Map<String, Object> getInfoBarberia() {
        return Map.of(
                "nombre", "Barbería El Mapache Bigotón",
                "descripcion", "Donde el estilo se encuentra con la tradición. Cortes clásicos y modernos para el hombre contemporáneo.",
                "horario", "Lunes a Sábado: 9:00 AM - 7:00 PM\nDomingo: 10:00 AM - 4:00 PM",
                "contacto", "📞 (123) 456-7890\n📧 info@elmapachebigoton.com\n📍 Calle Principal #123, Ciudad",
                "galeria", List.of(
                        Map.of("imagen", "galeria1.jpeg", "titulo", "Trabajo de calidad"),
                        Map.of("imagen", "galeria2.jpeg", "titulo", "Ambiente acogedor"),
                        Map.of("imagen", "galeria3.jpeg", "titulo", "Resultados impecables")
                )
        );
    }
}


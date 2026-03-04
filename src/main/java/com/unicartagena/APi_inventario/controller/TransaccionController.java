package com.unicartagena.APi_inventario.controller;

import com.unicartagena.APi_inventario.dto.TransaccionRequestDTO;
import com.unicartagena.APi_inventario.entity.Transaccion;
import com.unicartagena.APi_inventario.service.TransaccionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/transacciones")
public class TransaccionController {

    private final TransaccionService service;

    public TransaccionController(TransaccionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Transaccion> listar() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaccion> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

@PostMapping
public ResponseEntity<Transaccion> crear(@Valid @RequestBody TransaccionRequestDTO tDto) {
    Transaccion creado = service.save(tDto);
    return ResponseEntity.created(URI.create("/api/transacciones/" + creado.getIdTransaccion())).body(creado);
}

    @PutMapping("/{id}")
    public ResponseEntity<Transaccion> actualizar(@PathVariable Long id, @Valid @RequestBody TransaccionRequestDTO tDto) {
        return ResponseEntity.ok(service.update(id, tDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

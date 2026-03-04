package com.unicartagena.APi_inventario.controller;

import com.unicartagena.APi_inventario.entity.Inventario;
import com.unicartagena.APi_inventario.service.InventarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/inventarios")
public class InventarioController {

    private final InventarioService service;

    public InventarioController(InventarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<Inventario> listar() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventario> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Inventario> crear(@Valid @RequestBody Inventario inv) {
        Inventario creado = service.save(inv);
        return ResponseEntity.created(URI.create("/api/inventarios/" + creado.getIdInventario())).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inventario> actualizar(@PathVariable Long id, @Valid @RequestBody Inventario inv) {
        return ResponseEntity.ok(service.update(id, inv));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


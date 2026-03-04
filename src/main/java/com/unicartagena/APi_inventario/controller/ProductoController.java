package com.unicartagena.APi_inventario.controller;

import com.unicartagena.APi_inventario.dto.ProductoRequestDTO;
import com.unicartagena.APi_inventario.entity.Producto;
import com.unicartagena.APi_inventario.service.ProductoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Producto> listar() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

@PostMapping
public ResponseEntity<Producto> crear(@Valid @RequestBody ProductoRequestDTO pDto) {
    Producto creado = service.save(pDto);
    return ResponseEntity.created(URI.create("/api/productos/" + creado.getIdProducto())).body(creado);
}

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequestDTO pDto) {
        return ResponseEntity.ok(service.update(id, pDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}


package com.unicartagena.APi_inventario.controller;

import com.unicartagena.APi_inventario.entity.Inventario;
import com.unicartagena.APi_inventario.service.InventarioService;
import com.unicartagena.APi_inventario.exception.ForbiddenException;
import com.unicartagena.APi_inventario.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/inventarios")
public class InventarioController {

    private final InventarioService service;
    private final SecurityUtils securityUtils;

    public InventarioController(InventarioService service, SecurityUtils securityUtils) {
        this.service = service;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public List<Inventario> listar() {
        if (!securityUtils.isAdmin()) {
            throw new ForbiddenException("Solo el administrador puede listar todo el inventario");
        }
        return service.findAll();
    }

    @GetMapping("/mios")
    public List<Inventario> listarMios() {
        return service.findMine();
    }

    @GetMapping("/mercado")
    public List<Inventario> listarMercado() {
        return service.findMercado();
    }

    @GetMapping("/productor/{idUsuario}")
    public List<Inventario> listarPorProductor(@PathVariable Long idUsuario) {
        return service.findPublicacionesByProductor(idUsuario);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventario> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.findByIdVisible(id));
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


package com.unicartagena.APi_inventario.controller;

import com.unicartagena.APi_inventario.dto.UsuarioRequestDTO;
import com.unicartagena.APi_inventario.entity.Usuario;
import com.unicartagena.APi_inventario.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public List<Usuario> listar() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<Usuario> crear(@Valid @RequestBody UsuarioRequestDTO uDto) {
        Usuario creado = service.save(uDto);
        return ResponseEntity.created(URI.create("/api/usuarios/" + creado.getIdUsuario())).body(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequestDTO uDto) {
        return ResponseEntity.ok(service.update(id, uDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> borrar(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

package com.unicartagena.APi_inventario.service;

import com.unicartagena.APi_inventario.entity.Inventario;
import com.unicartagena.APi_inventario.entity.Producto;
import com.unicartagena.APi_inventario.entity.Usuario;
import com.unicartagena.APi_inventario.exception.ResourceNotFoundException;
import com.unicartagena.APi_inventario.repository.InventarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventarioService {
    private final InventarioRepository repo;

    private final UsuarioService usuarioService;
    private final ProductoService productoService;

    public InventarioService(InventarioRepository repo, UsuarioService usuarioService, ProductoService productoService) {
        this.repo = repo;
        this.usuarioService = usuarioService;
        this.productoService = productoService;
    }

    public List<Inventario> findAll() { return repo.findAll(); }

    public Inventario findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado con id " + id));
    }

    public Inventario save(Inventario inv) {

        Usuario u = usuarioService.findById(inv.getUsuario().getIdUsuario());
        Producto p = productoService.findById(inv.getProducto().getIdProducto());
        inv.setUsuario(u);
        inv.setProducto(p);
        return repo.save(inv);
    }

    public Inventario update(Long id, Inventario inv) {
        Inventario existing = findById(id);
        existing.setCantidadDisponible(inv.getCantidadDisponible());
        existing.setFechaRegistro(inv.getFechaRegistro());

        if (inv.getUsuario() != null) {
            existing.setUsuario(usuarioService.findById(inv.getUsuario().getIdUsuario()));
        }
        if (inv.getProducto() != null) {
            existing.setProducto(productoService.findById(inv.getProducto().getIdProducto()));
        }
        return repo.save(existing);
    }

    public void delete(Long id) {
        Inventario existing = findById(id);
        repo.delete(existing);
    }
}


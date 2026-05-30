package com.unicartagena.APi_inventario.service;

import com.unicartagena.APi_inventario.entity.Inventario;
import com.unicartagena.APi_inventario.entity.Producto;
import com.unicartagena.APi_inventario.entity.Usuario;
import com.unicartagena.APi_inventario.exception.ForbiddenException;
import com.unicartagena.APi_inventario.exception.ResourceNotFoundException;
import com.unicartagena.APi_inventario.repository.InventarioRepository;
import com.unicartagena.APi_inventario.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventarioService {
    private final InventarioRepository repo;

    private final UsuarioService usuarioService;
    private final ProductoService productoService;
    private final SecurityUtils securityUtils;

    public InventarioService(
            InventarioRepository repo,
            UsuarioService usuarioService,
            ProductoService productoService,
            SecurityUtils securityUtils
    ) {
        this.repo = repo;
        this.usuarioService = usuarioService;
        this.productoService = productoService;
        this.securityUtils = securityUtils;
    }

    public List<Inventario> findAll() { return repo.findAll(); }

    public List<Inventario> findMine() {
        return repo.findByUsuario_IdUsuario(securityUtils.getCurrentUsuario().getIdUsuario());
    }

    public List<Inventario> findMercado() {
        Long myId = securityUtils.getCurrentUsuario().getIdUsuario();
        return repo.findByUsuario_IdUsuarioNotAndCantidadDisponibleGreaterThan(myId, 0.0);
    }

    public List<Inventario> findPublicacionesByProductor(Long idUsuario) {
        if (!securityUtils.isAdmin()) {
            throw new ForbiddenException("Solo el administrador puede consultar publicaciones de otros productores");
        }
        usuarioService.findById(idUsuario);
        return repo.findByUsuario_IdUsuarioAndCantidadDisponibleGreaterThan(idUsuario, 0.0);
    }

    public Inventario findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Inventario no encontrado con id " + id));
    }

    public Inventario findByIdVisible(Long id) {
        Inventario inventario = findById(id);
        Usuario current = securityUtils.getCurrentUsuario();
        if (securityUtils.isAdmin()) {
            return inventario;
        }
        boolean isOwner = inventario.getUsuario().getIdUsuario().equals(current.getIdUsuario());
        boolean isMercadoItem = !isOwner && inventario.getCantidadDisponible() > 0;
        if (!isOwner && !isMercadoItem) {
            throw new ForbiddenException("No tienes acceso a esta publicación");
        }
        return inventario;
    }

    public Inventario save(Inventario inv) {
        Usuario current = securityUtils.getCurrentUsuario();
        Usuario u = usuarioService.findById(inv.getUsuario().getIdUsuario());
        if (!u.getIdUsuario().equals(current.getIdUsuario()) && !securityUtils.isAdmin()) {
            throw new ForbiddenException("Solo puedes publicar productos en tu propio inventario");
        }
        Producto p = productoService.findById(inv.getProducto().getIdProducto());
        inv.setUsuario(u);
        inv.setProducto(p);
        if (inv.getPrecio() == null) {
            inv.setPrecio(p.getPrecio() != null ? p.getPrecio() : 0.0);
        }
        return repo.save(inv);
    }

    public Inventario update(Long id, Inventario inv) {
        Inventario existing = findById(id);
        assertOwnerOrAdmin(existing);
        existing.setCantidadDisponible(inv.getCantidadDisponible());
        existing.setFechaRegistro(inv.getFechaRegistro());
        if (inv.getPrecio() != null) {
            existing.setPrecio(inv.getPrecio());
        }

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
        assertOwnerOrAdmin(existing);
        repo.delete(existing);
    }

    private void assertOwnerOrAdmin(Inventario inventario) {
        Usuario current = securityUtils.getCurrentUsuario();
        if (securityUtils.isAdmin()) {
            return;
        }
        if (!inventario.getUsuario().getIdUsuario().equals(current.getIdUsuario())) {
            throw new ForbiddenException("Solo puedes modificar o eliminar tus propias publicaciones");
        }
    }
}


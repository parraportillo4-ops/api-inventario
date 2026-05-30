package com.unicartagena.APi_inventario.service;

import com.unicartagena.APi_inventario.dto.ProductoRequestDTO;
import com.unicartagena.APi_inventario.entity.Producto;
import com.unicartagena.APi_inventario.entity.Usuario;
import com.unicartagena.APi_inventario.exception.ForbiddenException;
import com.unicartagena.APi_inventario.exception.ResourceNotFoundException;
import com.unicartagena.APi_inventario.repository.ProductoRepository;
import com.unicartagena.APi_inventario.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {
    private final ProductoRepository repo;
    private final SecurityUtils securityUtils;

    public ProductoService(ProductoRepository repo, SecurityUtils securityUtils) {
        this.repo = repo;
        this.securityUtils = securityUtils;
    }

    public List<Producto> findAll() { return repo.findAll(); }

    public List<Producto> findVisibleForCurrentUser() {
        if (securityUtils.isAdmin()) {
            return repo.findAll();
        }
        return repo.findByUsuario_IdUsuario(securityUtils.getCurrentUsuario().getIdUsuario());
    }

    public Producto findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id " + id));
    }

    public Producto findByIdVisible(Long id) {
        Producto producto = findById(id);
        assertOwnerOrAdmin(producto);
        return producto;
    }

    public Producto save(ProductoRequestDTO pDto) {
        Usuario current = securityUtils.getCurrentUsuario();
        Producto producto = new Producto();
        producto.setNombreProducto(pDto.getNombreProducto());
        producto.setDescripcion(pDto.getDescripcion());
        producto.setUnidadMedida(pDto.getUnidadMedida());
        producto.setPrecio(pDto.getPrecio());
        producto.setUsuario(current);
        return repo.save(producto);
    }

    public Producto update(Long id, ProductoRequestDTO pDto) {
        Producto existing = findById(id);
        assertOwnerOrAdmin(existing);
        existing.setNombreProducto(pDto.getNombreProducto());
        existing.setDescripcion(pDto.getDescripcion());
        existing.setUnidadMedida(pDto.getUnidadMedida());
        existing.setPrecio(pDto.getPrecio());
        return repo.save(existing);
    }

    public void delete(Long id) {
        Producto existing = findById(id);
        assertOwnerOrAdmin(existing);
        repo.delete(existing);
    }

    private void assertOwnerOrAdmin(Producto producto) {
        Usuario current = securityUtils.getCurrentUsuario();
        if (securityUtils.isAdmin()) {
            return;
        }
        if (producto.getUsuario() == null) {
            throw new ForbiddenException("Solo el administrador puede modificar productos del catálogo sin dueño");
        }
        if (!producto.getUsuario().getIdUsuario().equals(current.getIdUsuario())) {
            throw new ForbiddenException("Solo puedes modificar o eliminar tus propios productos");
        }
    }
}

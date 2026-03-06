package com.unicartagena.APi_inventario.service;

import com.unicartagena.APi_inventario.dto.ProductoRequestDTO;
import com.unicartagena.APi_inventario.entity.Producto;
import com.unicartagena.APi_inventario.exception.*;
import com.unicartagena.APi_inventario.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductoService {
    private final ProductoRepository repo;

    public ProductoService(ProductoRepository repo) {
        this.repo = repo;
    }

    public List<Producto> findAll() { return repo.findAll(); }

    public Producto findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id " + id));
    }
// comment
    public Producto save(ProductoRequestDTO pDto) {
        Producto producto = new Producto();
        producto.setNombreProducto(pDto.getNombreProducto());
        producto.setDescripcion(pDto.getDescripcion());
        producto.setUnidadMedida(pDto.getUnidadMedida());
        return repo.save(producto);
    }

    public Producto update(Long id, ProductoRequestDTO pDto) {
        Producto existing = findById(id);
        existing.setNombreProducto(pDto.getNombreProducto());
        existing.setDescripcion(pDto.getDescripcion());
        existing.setUnidadMedida(pDto.getUnidadMedida());
        return repo.save(existing);
    }

    public void delete(Long id) {
        Producto existing = findById(id);
        repo.delete(existing);
    }
}

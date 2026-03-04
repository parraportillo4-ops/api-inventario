package com.unicartagena.APi_inventario.service;

import com.unicartagena.APi_inventario.dto.TransaccionRequestDTO;
import com.unicartagena.APi_inventario.entity.Transaccion;
import com.unicartagena.APi_inventario.entity.Producto;
import com.unicartagena.APi_inventario.entity.Usuario;
import com.unicartagena.APi_inventario.exception.ResourceNotFoundException;
import com.unicartagena.APi_inventario.repository.TransaccionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransaccionService {

    private final TransaccionRepository transaccionRepository;
    private final UsuarioService usuarioService;
    private final ProductoService productoService;


    public TransaccionService(TransaccionRepository repo, UsuarioService usuarioService, ProductoService productoService) {
        this.transaccionRepository = repo;
        this.usuarioService = usuarioService;
        this.productoService = productoService;
    }

    public List<Transaccion> findAll() {
        return transaccionRepository.findAll();
    }

    public Transaccion findById(Long id) {
        return transaccionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Transacción no encontrada con id " + id)); // Usar la nueva variable
    }

public Transaccion save(TransaccionRequestDTO tDto) {

    Usuario vendedor = usuarioService.findById(tDto.getIdVendedor());
    Usuario comprador = usuarioService.findById(tDto.getIdComprador());
    Producto producto = productoService.findById(tDto.getIdProducto());

    Transaccion transaccion = new Transaccion();
    transaccion.setVendedor(vendedor);
    transaccion.setComprador(comprador);
    transaccion.setProducto(producto);
    transaccion.setCantidad(tDto.getCantidad());
    transaccion.setPrecio(tDto.getPrecio());
    transaccion.setFecha(tDto.getFecha());

    return transaccionRepository.save(transaccion);
}

public Transaccion update(Long id, TransaccionRequestDTO tDto) {
    Transaccion existing = findById(id);

    existing.setCantidad(tDto.getCantidad());
    existing.setPrecio(tDto.getPrecio());
    existing.setFecha(tDto.getFecha());

    if (tDto.getIdVendedor() != null) existing.setVendedor(usuarioService.findById(tDto.getIdVendedor()));
    if (tDto.getIdComprador() != null) existing.setComprador(usuarioService.findById(tDto.getIdComprador()));
    if (tDto.getIdProducto() != null) existing.setProducto(productoService.findById(tDto.getIdProducto()));

    return transaccionRepository.save(existing);
}
    public void delete(Long id) {
        Transaccion existing = findById(id);
        transaccionRepository.delete(existing);
    }
}
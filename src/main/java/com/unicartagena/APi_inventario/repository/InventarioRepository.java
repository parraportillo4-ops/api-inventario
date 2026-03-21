package com.unicartagena.APi_inventario.repository;

import com.unicartagena.APi_inventario.entity.Inventario;
import com.unicartagena.APi_inventario.entity.Producto;
import com.unicartagena.APi_inventario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    Optional<Inventario> findByUsuarioAndProducto(Usuario usuario, Producto producto);
}

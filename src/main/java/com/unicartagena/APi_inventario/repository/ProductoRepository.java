package com.unicartagena.APi_inventario.repository;

import com.unicartagena.APi_inventario.entity.Producto;
import com.unicartagena.APi_inventario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByUsuario_IdUsuario(Long idUsuario);

    Optional<Producto> findByUsuario_IdUsuarioAndNombreProducto(Long idUsuario, String nombreProducto);
}

package com.unicartagena.APi_inventario.repository;

import com.unicartagena.APi_inventario.entity.Inventario;
import com.unicartagena.APi_inventario.entity.Producto;
import com.unicartagena.APi_inventario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {
    Optional<Inventario> findByUsuarioAndProducto(Usuario usuario, Producto producto);

    List<Inventario> findByUsuario_IdUsuario(Long idUsuario);

    List<Inventario> findByUsuario_IdUsuarioAndCantidadDisponibleGreaterThan(
            Long idUsuario,
            Double cantidadDisponible
    );

    List<Inventario> findByUsuario_IdUsuarioNotAndCantidadDisponibleGreaterThan(
            Long idUsuario,
            Double cantidadDisponible
    );
}

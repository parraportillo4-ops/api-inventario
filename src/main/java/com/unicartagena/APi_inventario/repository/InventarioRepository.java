package com.unicartagena.APi_inventario.repository;

import com.unicartagena.APi_inventario.entity.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {
}

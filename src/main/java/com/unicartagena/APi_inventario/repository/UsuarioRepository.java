package com.unicartagena.APi_inventario.repository;

import com.unicartagena.APi_inventario.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

    @Repository
    public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    }


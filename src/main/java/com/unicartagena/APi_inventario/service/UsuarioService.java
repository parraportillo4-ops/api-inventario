package com.unicartagena.APi_inventario.service;

import com.unicartagena.APi_inventario.entity.Usuario;
import com.unicartagena.APi_inventario.exception.ResourceNotFoundException;
import com.unicartagena.APi_inventario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import com.unicartagena.APi_inventario.dto.UsuarioRequestDTO;

import java.util.List;

@Service
public class UsuarioService {
    private final UsuarioRepository repo;

    public UsuarioService(UsuarioRepository repo) {
        this.repo = repo;
    }

    public List<Usuario> findAll() {
        return repo.findAll();
    }

    public Usuario findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id " + id));
    }

public Usuario save(UsuarioRequestDTO uDto) {

    Usuario usuario = new Usuario();
    usuario.setNombre(uDto.getNombre());
    usuario.setApellido(uDto.getApellido());
    usuario.setTipoUsuario(uDto.getTipoUsuario());
    usuario.setTelefono(uDto.getTelefono());
    usuario.setCorreo(uDto.getCorreo());
    usuario.setUbicacion(uDto.getUbicacion());

    return repo.save(usuario);
}

    public Usuario update(Long id, UsuarioRequestDTO uDto) {
        Usuario existing = findById(id);
        existing.setNombre(uDto.getNombre());
        existing.setApellido(uDto.getApellido());
        existing.setTipoUsuario(uDto.getTipoUsuario());
        existing.setTelefono(uDto.getTelefono());
        existing.setCorreo(uDto.getCorreo());
        existing.setUbicacion(uDto.getUbicacion());
        return repo.save(existing);
    }

    public void delete(Long id) {
        Usuario existing = findById(id);
        repo.delete(existing);
    }
}
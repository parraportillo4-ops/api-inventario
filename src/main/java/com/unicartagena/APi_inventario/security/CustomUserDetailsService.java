package com.unicartagena.APi_inventario.security;

import com.unicartagena.APi_inventario.entity.Usuario;
import com.unicartagena.APi_inventario.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreo(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        String role = normalizeRole(usuario.getTipoUsuario());
        return User.withUsername(usuario.getCorreo())
                .password(usuario.getPasswordHash() == null ? "" : usuario.getPasswordHash())
                .authorities(List.of(new SimpleGrantedAuthority(role)))
                .build();
    }

    private static String normalizeRole(String tipoUsuario) {
        if (tipoUsuario == null || tipoUsuario.isBlank()) {
            return "ROLE_USER";
        }
        String normalized = tipoUsuario.trim().toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9_]", "_");
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }
        return normalized;
    }
}

package com.unicartagena.APi_inventario.controller;

import com.unicartagena.APi_inventario.entity.Usuario;
import com.unicartagena.APi_inventario.repository.UsuarioRepository;
import com.unicartagena.APi_inventario.security.JwtService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (usuarioRepository.existsByCorreo(request.correo())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("El correo ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre());
        usuario.setApellido(request.apellido());
        usuario.setTipoUsuario(request.tipoUsuario());
        usuario.setTelefono(request.telefono());
        usuario.setCorreo(request.correo());
        usuario.setUbicacion(request.ubicacion());
        usuario.setPasswordHash(passwordEncoder.encode(request.password()));

        Usuario saved = usuarioRepository.save(usuario);
        String token = jwtService.generateToken(saved.getCorreo());
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.correo(), request.password())
        );

        String subject = authentication.getName();
        String token = jwtService.generateToken(subject);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    public record LoginRequest(
            @NotBlank @Size(max = 50) String correo,
            @NotBlank @Size(min = 6, max = 72) String password
    ) {}

    public record RegisterRequest(
            @NotBlank @Size(max = 30) String nombre,
            @NotBlank @Size(max = 30) String apellido,
            @NotBlank @Size(max = 15) String tipoUsuario,
            @NotBlank @Size(max = 10) String telefono,
            @NotBlank @Size(max = 50) String correo,
            @NotBlank @Size(max = 55) String ubicacion,
            @NotBlank @Size(min = 6, max = 72) String password
    ) {}

    public record AuthResponse(String token) {}
}

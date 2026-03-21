package com.unicartagena.APi_inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @NonNull
    @Column(length = 30)
    @NotBlank
    private String nombre;

    @NonNull
    @Column(length = 30)
    @NotBlank
    private String apellido;

    @NonNull
    @Column(length = 15)
    @NotBlank
    private String tipoUsuario;

    @NonNull
    @Column(length = 10)
    @NotBlank
    private String telefono;

    @NonNull
    @Column(unique = true, length = 50)
    @NotBlank
    private String correo;

    @NonNull
    @Column(length = 55)
    @NotBlank
    private String ubicacion;

    @JsonIgnore
    @Column(name = "password_hash", length = 100)
    private String passwordHash;

    @JsonIgnore
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Inventario> inventario;
}

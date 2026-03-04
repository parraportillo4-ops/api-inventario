package com.unicartagena.APi_inventario.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Inventario {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inventario")
    private Long idInventario;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    @NotNull
    @NonNull
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_producto")
    @NotNull
    @NonNull

    private Producto producto;

    @NonNull
    @Column(name = "cantidad_disponible")
    @NotNull
    private Double cantidadDisponible;

    @NonNull
    @Column(name = "fecha_registro")
    @NotNull
    private LocalDate fechaRegistro;


}

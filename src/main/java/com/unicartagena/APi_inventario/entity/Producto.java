package com.unicartagena.APi_inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    @NonNull
    @Column(length = 30)
    @NotBlank

    private String nombreProducto;

    @NonNull
    @Column(length = 150)
    @NotBlank

    private String descripcion;
    @NonNull
    @Column(length = 20)
    @NotBlank
    private String unidadMedida;

    @JsonIgnore
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Inventario> inventarios;

}

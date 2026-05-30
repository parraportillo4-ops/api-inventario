package com.unicartagena.APi_inventario.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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

    @Min(0)
    @Column(name = "precio")
    private Double precio;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    @JsonIgnoreProperties({"inventario", "passwordHash"})
    private Usuario usuario;

    @JsonIgnore
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Inventario> inventarios;

}

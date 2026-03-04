package com.unicartagena.APi_inventario.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transacciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_transaccion")
    private Long idTransaccion;


    @NonNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    @NotNull(message = "El producto no puede ser nulo")
    private Producto producto;


    @NonNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vendedor")
    @NotNull(message = "El vendedor no puede ser nulo")
    private Usuario vendedor;


    @NonNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_comprador")
    @NotNull(message = "El comprador no puede ser nulo")
    private Usuario comprador;

    @NonNull
    @NotNull(message = "La cantidad es obligatoria")
    @Column
    private Integer cantidad;

    @NonNull
    @NotNull(message = "El precio es obligatorio")
    @Column
    private Double precio;

    @NonNull
    @NotNull(message = "La fecha es obligatoria")
    @Column
    private LocalDateTime fecha;
}

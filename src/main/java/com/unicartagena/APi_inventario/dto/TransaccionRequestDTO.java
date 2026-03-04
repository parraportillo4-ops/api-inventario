package com.unicartagena.APi_inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransaccionRequestDTO {

    @NotNull(message = "El ID del producto es obligatorio")
    @Min(value = 1, message = "El ID del producto debe ser válido")
    private Long idProducto;

    @NotNull(message = "El ID del vendedor es obligatorio")
    @Min(value = 1, message = "El ID del vendedor debe ser válido")
    private Long idVendedor;

    @NotNull(message = "El ID del comprador es obligatorio")
    @Min(value = 1, message = "El ID del comprador debe ser válido")
    private Long idComprador;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    @NotNull(message = "El precio es obligatorio")
    @Min(value = 0, message = "El precio no puede ser negativo")
    private Double precio;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDateTime fecha;
}

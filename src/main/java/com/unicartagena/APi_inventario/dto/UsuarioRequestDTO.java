package com.unicartagena.APi_inventario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRequestDTO {


    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 30, message = "El nombre no puede exceder los 30 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 30, message = "El apellido no puede exceder los 30 caracteres")
    private String apellido;

    @NotBlank(message = "El tipo de usuario es obligatorio")
    @Size(max = 15, message = "El tipo de usuario no puede exceder los 15 caracteres")
    private String tipoUsuario;

    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 10, message = "El teléfono no puede exceder los 10 caracteres")
    private String telefono;

    @NotBlank(message = "El correo es obligatorio")
    @Size(max = 50, message = "El correo no puede exceder los 50 caracteres")
    private String correo;

    @NotBlank(message = "La ubicación es obligatoria")
    @Size(max = 55, message = "La ubicación no puede exceder los 55 caracteres")
    private String ubicacion;
}
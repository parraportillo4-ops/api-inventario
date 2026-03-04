package com.unicartagena.APi_inventario.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class appConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Inventario Agrícola")
                        .version("v1")
                        .description("API para gestión de usuarios, productos, inventarios y transacciones"));
    }
}
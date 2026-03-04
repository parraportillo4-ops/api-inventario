# API Inventario Agrícola (APi-inventario)

API REST para gestión de usuarios, productos, inventarios y transacciones. Incluye autenticación stateless con JWT, CORS habilitado y documentación OpenAPI/Swagger UI.

## Contenido

- Descripción
- Requisitos
- Configuración
- Autenticación (JWT)
- Swagger UI (Authorize)
- CORS
- Endpoints
- Modelo de datos
- Errores comunes
- Ejecución local

## Descripción

Esta API está pensada para un escenario de inventario agrícola:

- Usuarios: productores, compradores, administradores, etc.
- Productos: catálogo de productos agrícolas.
- Inventario: disponibilidad de un producto por usuario.
- Transacciones: registro de compras/ventas entre usuarios.

## Requisitos

- Java 25 (según `pom.xml`)
- Maven (wrapper o instalación local)
- SQLite (embebido vía JDBC; no requiere servidor)

## Configuración

Configuración principal en [application.yml](file:///c:/Users/User/api-inventario/src/main/resources/application.yml):

- Base de datos: `jdbc:sqlite:./inventario.db`
- JPA: `ddl-auto: update` (crea/actualiza tablas automáticamente)
- Logs SQL: `show-sql: true`

### Variables de entorno

JWT:

- `JWT_SECRET`: clave de firma del token. Debe ser privada y suficientemente larga.
- `JWT_EXPIRATION_MS`: expiración del token en milisegundos (por defecto 86400000 = 24h).

La configuración está en:

```yml
jwt:
  secret: ${JWT_SECRET:change-me-change-me-change-me-change-me}
  expiration-ms: ${JWT_EXPIRATION_MS:86400000}
```

En producción, define siempre `JWT_SECRET` y evita usar el valor por defecto.

## Autenticación (JWT)

La seguridad está configurada como stateless (sin sesión). Todos los endpoints quedan protegidos salvo los explícitamente permitidos.

Implementación:

- Filtro JWT: [JwtAuthenticationFilter.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/security/JwtAuthenticationFilter.java)
- Servicio JWT: [JwtService.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/security/JwtService.java)
- Security/CORS: [SecurityConfig.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/config/SecurityConfig.java)

### Cómo se valida un request

Para endpoints protegidos, envía este header:

```
Authorization: Bearer <TOKEN>
```

- El `subject` del token es el `correo` del usuario.
- Si el token es inválido o expira, la API responde `401 Unauthorized`.

### Endpoints públicos

Están permitidos sin token:

- `/api/auth/**` (login y register)
- `/v3/api-docs/**`, `/swagger-ui/**`, `/swagger-ui.html`
- `OPTIONS /**` (preflight CORS)
- `/error`

Todo lo demás requiere token.

### Registro y login

Endpoints en [AuthController.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/controller/AuthController.java):

#### POST /api/auth/register

Crea un usuario con password (se almacena como hash BCrypt) y retorna un JWT.

Body:

```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "tipoUsuario": "USER",
  "telefono": "3001234567",
  "correo": "juan@correo.com",
  "ubicacion": "Cartagena",
  "password": "secreto123"
}
```

Respuesta:

```json
{ "token": "<JWT>" }
```

Errores:

- `409 Conflict`: el correo ya está registrado.
- `400 Bad Request`: validaciones (campos requeridos, tamaños).

#### POST /api/auth/login

Valida correo y password, y retorna un JWT.

Body:

```json
{
  "correo": "juan@correo.com",
  "password": "secreto123"
}
```

Respuesta:

```json
{ "token": "<JWT>" }
```

Errores:

- `401 Unauthorized`: credenciales inválidas.

### Notas sobre roles

El `tipoUsuario` de [Usuario.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/entity/Usuario.java) se normaliza a un rol Spring Security:

- `"ADMIN"` -> `ROLE_ADMIN`
- `"USER"` -> `ROLE_USER`
- Si viene vacío o null -> `ROLE_USER`

Por ahora la API no restringe por rol a nivel de endpoint; solo exige autenticación.

## Swagger UI (Authorize)

Se configuró el esquema Bearer en OpenAPI para que Swagger UI muestre el botón **Authorize**:

- Config OpenAPI: [appConfig.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/config/appConfig.java)

Uso recomendado:

1. Ejecuta `POST /api/auth/login` o `POST /api/auth/register` desde Swagger.
2. Copia el valor `token`.
3. Abre **Authorize** y pega el token.
4. Swagger enviará automáticamente `Authorization: Bearer <token>` en las solicitudes.

## CORS

Configuración en [SecurityConfig.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/config/SecurityConfig.java):

- Orígenes: `*` (vía `allowedOriginPatterns`)
- Métodos: `GET, POST, PUT, DELETE, OPTIONS`
- Headers permitidos: `Authorization, Content-Type, Accept, Origin, X-Requested-With`
- Credentials: `false`

Si tu frontend necesita credentials/cookies, esta configuración debe ajustarse (y no usar `*`).

## Endpoints

Base path: `/api`

### Usuarios

Controlador: [UsuarioController.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/controller/UsuarioController.java)

- `GET /api/usuarios` lista usuarios
- `GET /api/usuarios/{id}` obtiene usuario por id
- `POST /api/usuarios` crea usuario (sin password)
- `PUT /api/usuarios/{id}` actualiza usuario
- `DELETE /api/usuarios/{id}` elimina usuario

Nota: el endpoint `POST /api/usuarios` usa [UsuarioRequestDTO.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/dto/UsuarioRequestDTO.java) y no recibe `password`. Para crear usuarios que puedan autenticarse, usa `POST /api/auth/register`.

### Productos

Controlador: [ProductoController.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/controller/ProductoController.java)

- `GET /api/productos` lista productos
- `GET /api/productos/{id}` obtiene producto por id
- `POST /api/productos` crea producto (usa `ProductoRequestDTO`)
- `PUT /api/productos/{id}` actualiza producto
- `DELETE /api/productos/{id}` elimina producto

### Inventarios

Controlador: [InventarioController.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/controller/InventarioController.java)

- `GET /api/inventarios` lista inventarios
- `GET /api/inventarios/{id}` obtiene inventario por id
- `POST /api/inventarios` crea inventario
- `PUT /api/inventarios/{id}` actualiza inventario
- `DELETE /api/inventarios/{id}` elimina inventario

Detalle de creación:

- El servicio resuelve referencias a `Usuario` y `Producto` por id (ver [InventarioService.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/service/InventarioService.java)).

Ejemplo de body para crear inventario:

```json
{
  "usuario": { "idUsuario": 1 },
  "producto": { "idProducto": 2 },
  "cantidadDisponible": 10.5,
  "fechaRegistro": "2026-03-04"
}
```

### Transacciones

Controlador: [TransaccionController.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/controller/TransaccionController.java)

- `GET /api/transacciones` lista transacciones
- `GET /api/transacciones/{id}` obtiene transacción por id
- `POST /api/transacciones` crea transacción (usa `TransaccionRequestDTO`)
- `PUT /api/transacciones/{id}` actualiza transacción
- `DELETE /api/transacciones/{id}` elimina transacción

Ejemplo de body para crear transacción:

```json
{
  "idVendedor": 1,
  "idComprador": 2,
  "idProducto": 3,
  "cantidad": 2,
  "precio": 15000.0,
  "fecha": "2026-03-04T10:15:30"
}
```

## Modelo de datos (resumen)

Entidades:

- Usuario: [Usuario.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/entity/Usuario.java)
  - `idUsuario`, `nombre`, `apellido`, `tipoUsuario`, `telefono`, `correo`, `ubicacion`
  - `passwordHash` (no se expone en JSON)
- Producto: [Producto.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/entity/Producto.java)
  - `idProducto`, `nombreProducto`, `descripcion`, `unidadMedida`
- Inventario: [Inventario.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/entity/Inventario.java)
  - `idInventario`, `usuario`, `producto`, `cantidadDisponible`, `fechaRegistro`
- Transaccion: [Transaccion.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/entity/Transaccion.java)
  - `idTransaccion`, `producto`, `vendedor`, `comprador`, `cantidad`, `precio`, `fecha`

## Errores comunes

- `401 Unauthorized`: falta token o token inválido.
- `404 Not Found`: entidades no encontradas (ver [ResourceNotFoundException.java](file:///c:/Users/User/api-inventario/src/main/java/com/unicartagena/APi_inventario/exception/ResourceNotFoundException.java)).
- `409 Conflict`: correo duplicado en registro.
- `400 Bad Request`: fallos de validación `jakarta.validation`.

## Ejecución local

Opciones típicas con Maven:

```bash
mvn spring-boot:run
```

o construir y ejecutar:

```bash
mvn clean package
java -jar target/APi-inventario-0.0.1-SNAPSHOT.jar
```

Swagger UI:

- `http://localhost:8080/swagger-ui/index.html`

package com.unicartagena.APi_inventario.config;

import com.unicartagena.APi_inventario.entity.Inventario;
import com.unicartagena.APi_inventario.entity.Producto;
import com.unicartagena.APi_inventario.entity.Transaccion;
import com.unicartagena.APi_inventario.entity.Usuario;
import com.unicartagena.APi_inventario.repository.InventarioRepository;
import com.unicartagena.APi_inventario.repository.ProductoRepository;
import com.unicartagena.APi_inventario.repository.TransaccionRepository;
import com.unicartagena.APi_inventario.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class DatabaseSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    static final String DEMO_PRODUCTOR_CORREO = "productor@inventario.local";
    static final String DEMO_COMPRADOR_CORREO = "comprador@inventario.local";

    private record DemoUser(String nombre, String apellido, String correo, String telefono, String ubicacion) {}

    private record DemoProduct(String nombre, String descripcion, String unidad, double precio) {}

    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final InventarioRepository inventarioRepository;
    private final TransaccionRepository transaccionRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.correo:admin@inventario.local}")
    private String adminCorreo;

    @Value("${app.admin.password:admin123456}")
    private String adminPassword;

    @Value("${app.admin.nombre:Admin}")
    private String adminNombre;

    @Value("${app.admin.apellido:Sistema}")
    private String adminApellido;

    @Value("${app.admin.telefono:0000000000}")
    private String adminTelefono;

    @Value("${app.admin.ubicacion:Sistema}")
    private String adminUbicacion;

    @Value("${app.seed.demo-password:demo123456}")
    private String demoPassword;

    @Value("${app.seed.transacciones:50}")
    private int targetTransacciones;

    public DatabaseSeeder(
            UsuarioRepository usuarioRepository,
            ProductoRepository productoRepository,
            InventarioRepository inventarioRepository,
            TransaccionRepository transaccionRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.inventarioRepository = inventarioRepository;
        this.transaccionRepository = transaccionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedAdmin();

        long txCount = transaccionRepository.count();
        if (txCount >= targetTransacciones) {
            log.info("Seed de demostración ya presente ({} transacciones), no se vuelve a cargar.", txCount);
            return;
        }

        List<Usuario> productores = seedProductores();
        List<Usuario> compradores = seedCompradores();
        List<Producto> productos = seedCatalogo(productores);
        seedPublicaciones(productos);
        seedTransacciones(productos, productores, compradores);

        log.info("Seed de demostración cargado: {} productores, {} compradores, {} productos, {} transacciones.",
                productores.size(),
                compradores.size(),
                productoRepository.count(),
                transaccionRepository.count());
        log.info("Admin: {} / {}", adminCorreo, adminPassword);
        log.info("Usuarios demo (todos): contraseña {}", demoPassword);
        log.info("Ejemplos: {} | {} | {}", DEMO_PRODUCTOR_CORREO, "maria.verduras@inventario.local", DEMO_COMPRADOR_CORREO);
    }

    private List<Usuario> seedProductores() {
        List<DemoUser> defs = List.of(
                new DemoUser("Ana", "Productora", DEMO_PRODUCTOR_CORREO, "3001111111", "Cartagena"),
                new DemoUser("Carlos", "Campo", "carlos.campo@inventario.local", "3001111112", "Sincelejo"),
                new DemoUser("María", "Verduras", "maria.verduras@inventario.local", "3001111113", "Montería"),
                new DemoUser("Jorge", "Frutas", "jorge.frutas@inventario.local", "3001111114", "Santa Marta"),
                new DemoUser("Rosa", "Orgánico", "rosa.organico@inventario.local", "3001111115", "Valledupar"),
                new DemoUser("Pedro", "Grano", "pedro.grano@inventario.local", "3001111116", "Ibagué"),
                new DemoUser("Lucía", "Finca", "lucia.finca@inventario.local", "3001111117", "Popayán"),
                new DemoUser("Diego", "Costa", "diego.costa@inventario.local", "3001111118", "Barranquilla"),
                new DemoUser("Sandra", "Huerta", "sandra.huerta@inventario.local", "3001111119", "Pasto"),
                new DemoUser("Miguel", "Sabana", "miguel.sabana@inventario.local", "3001111120", "Villavicencio")
        );
        List<Usuario> productores = new ArrayList<>();
        for (DemoUser def : defs) {
            productores.add(findOrCreateUser(def));
        }
        return productores;
    }

    private List<Usuario> seedCompradores() {
        List<DemoUser> defs = List.of(
                new DemoUser("Luis", "Comprador", DEMO_COMPRADOR_CORREO, "3002222221", "Sincelejo"),
                new DemoUser("Carmen", "Mercado", "carmen.mercado@inventario.local", "3002222222", "Cartagena"),
                new DemoUser("Andrés", "Distribución", "andres.distribucion@inventario.local", "3002222223", "Medellín"),
                new DemoUser("Patricia", "Tienda", "patricia.tienda@inventario.local", "3002222224", "Cali"),
                new DemoUser("Hugo", "Restaurante", "hugo.restaurante@inventario.local", "3002222225", "Bogotá"),
                new DemoUser("Elena", "Cooperativa", "elena.cooperativa@inventario.local", "3002222226", "Bucaramanga"),
                new DemoUser("Felipe", "Mayorista", "felipe.mayorista@inventario.local", "3002222227", "Pereira"),
                new DemoUser("Diana", "Canasta", "diana.canasta@inventario.local", "3002222228", "Manizales")
        );
        List<Usuario> compradores = new ArrayList<>();
        for (DemoUser def : defs) {
            compradores.add(findOrCreateUser(def));
        }
        return compradores;
    }

    private List<Producto> seedCatalogo(List<Usuario> productores) {
        List<List<DemoProduct>> catalogos = List.of(
                List.of(
                        new DemoProduct("Tomate chonto", "Tomate fresco de campo", "kg", 2500),
                        new DemoProduct("Papa criolla", "Papa seleccionada", "kg", 1800),
                        new DemoProduct("Plátano maduro", "Racimo maduro", "racimo", 3500),
                        new DemoProduct("Yuca blanca", "Yuca limpia para consumo", "kg", 1600)
                ),
                List.of(
                        new DemoProduct("Arroz pilado", "Arroz de primera", "kg", 3200),
                        new DemoProduct("Maíz tierno", "Mazorca lista para asar", "unidad", 1200),
                        new DemoProduct("Cilantro fresco", "Atado recién cortado", "atado", 800),
                        new DemoProduct("Ají dulce", "Ají rojo maduro", "kg", 4200)
                ),
                List.of(
                        new DemoProduct("Lechuga crespa", "Lechuga hidropónica", "unidad", 1500),
                        new DemoProduct("Cebolla cabezona", "Cebolla blanca", "kg", 2200),
                        new DemoProduct("Zanahoria", "Zanahoria lavada", "kg", 1900),
                        new DemoProduct("Pepino cohombro", "Pepino fresco", "kg", 2100),
                        new DemoProduct("Espinaca", "Espinaca en manojo", "manojo", 900)
                ),
                List.of(
                        new DemoProduct("Mango baba", "Mango dulce de temporada", "kg", 2800),
                        new DemoProduct("Piña gold", "Piña madura", "unidad", 4500),
                        new DemoProduct("Papaya tainung", "Papaya grande", "kg", 2400),
                        new DemoProduct("Melón", "Melón amarillo", "unidad", 3800)
                ),
                List.of(
                        new DemoProduct("Miel de abejas", "Miel pura de montaña", "frasco", 12000),
                        new DemoProduct("Huevos AA", "Huevos frescos de gallina", "docena", 6500),
                        new DemoProduct("Queso fresco", "Queso artesanal del día", "kg", 9800),
                        new DemoProduct("Yogurt natural", "Yogurt sin azúcar", "litro", 5200)
                ),
                List.of(
                        new DemoProduct("Café pergamino", "Café secado en finca", "kg", 8500),
                        new DemoProduct("Fríjol cargamanto", "Fríjol rojo limpio", "kg", 5400),
                        new DemoProduct("Caña panelera", "Caña para jugo", "atado", 3000),
                        new DemoProduct("Plátano verde", "Plátano para cocinar", "kg", 1700)
                ),
                List.of(
                        new DemoProduct("Cebolla larga", "Cebolla de rama", "atado", 1100),
                        new DemoProduct("Berenjena", "Berenjena morada", "kg", 2600),
                        new DemoProduct("Coliflor", "Coliflor mediana", "unidad", 3200),
                        new DemoProduct("Habichuela", "Habichuela tierna", "kg", 2300)
                ),
                List.of(
                        new DemoProduct("Tilapia roja", "Pescado fresco del día", "kg", 12500),
                        new DemoProduct("Camarón", "Camarón grande", "kg", 28000),
                        new DemoProduct("Coco seco", "Coco para leche", "unidad", 2500),
                        new DemoProduct("Bocachico", "Pescado de río", "kg", 9800)
                ),
                List.of(
                        new DemoProduct("Arracacha", "Arracacha amarilla", "kg", 2100),
                        new DemoProduct("Ulluco", "Papa criolla andina", "kg", 2400),
                        new DemoProduct("Feijoa", "Feijoa madura", "kg", 3600),
                        new DemoProduct("Cidra", "Cidra dulce", "kg", 1900)
                ),
                List.of(
                        new DemoProduct("Lulo", "Lulo para jugo", "kg", 2800),
                        new DemoProduct("Guayaba", "Guayaba pera", "kg", 2200),
                        new DemoProduct("Culantro", "Culantro fresco", "atado", 700),
                        new DemoProduct("Plátano hartón", "Plátano verde grande", "kg", 1500)
                )
        );

        List<Producto> productos = new ArrayList<>();
        for (int i = 0; i < productores.size(); i++) {
            Usuario owner = productores.get(i);
            List<DemoProduct> items = catalogos.get(i);
            for (DemoProduct item : items) {
                productos.add(findOrCreateProduct(owner, item));
            }
        }
        return productos;
    }

    private void seedPublicaciones(List<Producto> productos) {
        for (Producto producto : productos) {
            Usuario owner = producto.getUsuario();
            if (owner == null) {
                continue;
            }
            double precio = producto.getPrecio() != null ? producto.getPrecio() : 0;
            findOrCreateInventario(owner, producto, inferStock(producto), precio);
        }
    }

    private double inferStock(Producto producto) {
        String nombre = producto.getNombreProducto().toLowerCase();
        if (nombre.contains("camarón") || nombre.contains("tilapia") || nombre.contains("bocachico")) {
            return ThreadLocalRandom.current().nextDouble(15, 35);
        }
        if (nombre.contains("miel") || nombre.contains("queso")) {
            return ThreadLocalRandom.current().nextDouble(20, 45);
        }
        return ThreadLocalRandom.current().nextDouble(40, 120);
    }

    private void seedTransacciones(
            List<Producto> productos,
            List<Usuario> productores,
            List<Usuario> compradores
    ) {
        int existentes = (int) transaccionRepository.count();
        int faltantes = targetTransacciones - existentes;
        if (faltantes <= 0) {
            return;
        }

        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int i = 0; i < faltantes; i++) {
            Producto producto = productos.get(random.nextInt(productos.size()));
            Usuario vendedor = producto.getUsuario();
            if (vendedor == null) {
                vendedor = productores.get(random.nextInt(productores.size()));
            }
            Usuario comprador = compradores.get(random.nextInt(compradores.size()));
            int cantidad = random.nextInt(2, 25);
            double precio = producto.getPrecio() != null ? producto.getPrecio() : 1000;
            int diasAtras = random.nextInt(1, 90);
            seedTransaccion(producto, vendedor, comprador, cantidad, precio, diasAtras);
        }
    }

    private Usuario findOrCreateUser(DemoUser def) {
        Optional<Usuario> existing = usuarioRepository.findByCorreo(def.correo());
        if (existing.isPresent()) {
            return existing.get();
        }
        return seedUsuario(def.nombre(), def.apellido(), "USER", def.telefono(), def.correo(), def.ubicacion());
    }

    private Producto findOrCreateProduct(Usuario owner, DemoProduct def) {
        return productoRepository.findByUsuario_IdUsuarioAndNombreProducto(owner.getIdUsuario(), def.nombre())
                .orElseGet(() -> seedProducto(owner, def.nombre(), def.descripcion(), def.unidad(), def.precio()));
    }

    private void findOrCreateInventario(Usuario owner, Producto producto, double cantidad, double precio) {
        Optional<Inventario> existing = inventarioRepository.findByUsuarioAndProducto(owner, producto);
        if (existing.isPresent()) {
            return;
        }
        seedInventario(owner, producto, cantidad, precio);
    }

    private void seedAdmin() {
        if (usuarioRepository.existsByCorreo(adminCorreo)) {
            return;
        }
        Usuario admin = new Usuario();
        admin.setNombre(adminNombre);
        admin.setApellido(adminApellido);
        admin.setTipoUsuario("ADMIN");
        admin.setTelefono(adminTelefono);
        admin.setCorreo(adminCorreo);
        admin.setUbicacion(adminUbicacion);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        usuarioRepository.save(admin);
        log.info("Usuario administrador creado: {}", adminCorreo);
    }

    private Usuario seedUsuario(
            String nombre,
            String apellido,
            String tipoUsuario,
            String telefono,
            String correo,
            String ubicacion
    ) {
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setApellido(apellido);
        usuario.setTipoUsuario(tipoUsuario);
        usuario.setTelefono(telefono);
        usuario.setCorreo(correo);
        usuario.setUbicacion(ubicacion);
        usuario.setPasswordHash(passwordEncoder.encode(demoPassword));
        return usuarioRepository.save(usuario);
    }

    private Producto seedProducto(
            Usuario owner,
            String nombre,
            String descripcion,
            String unidad,
            double precio
    ) {
        Producto producto = new Producto();
        producto.setNombreProducto(nombre);
        producto.setDescripcion(descripcion);
        producto.setUnidadMedida(unidad);
        producto.setPrecio(precio);
        producto.setUsuario(owner);
        return productoRepository.save(producto);
    }

    private void seedInventario(Usuario owner, Producto producto, double cantidad, double precio) {
        Inventario inventario = Inventario.builder()
                .usuario(owner)
                .producto(producto)
                .cantidadDisponible(cantidad)
                .fechaRegistro(LocalDate.now())
                .precio(precio)
                .build();
        inventarioRepository.save(inventario);
    }

    private void seedTransaccion(
            Producto producto,
            Usuario vendedor,
            Usuario comprador,
            int cantidad,
            double precio,
            int diasAtras
    ) {
        Transaccion transaccion = new Transaccion();
        transaccion.setProducto(producto);
        transaccion.setVendedor(vendedor);
        transaccion.setComprador(comprador);
        transaccion.setCantidad(cantidad);
        transaccion.setPrecio(precio);
        transaccion.setFecha(LocalDateTime.now().minusDays(diasAtras));
        transaccionRepository.save(transaccion);
    }
}

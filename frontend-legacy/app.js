const API_URL = 'http://localhost:8080/api';
let currentUser = null;
let token = localStorage.getItem('token');

// Configurar Axios
axios.interceptors.request.use(config => {
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Referencias DOM
const appContainer = document.getElementById('app-container');
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const authInfo = document.getElementById('auth-info');
const userNameEl = document.getElementById('user-name');

// Iniciar aplicación
async function init() {
    if (token) {
        await loadCurrentUser();
        if (currentUser) {
            showDashboard();
        } else {
            logout();
        }
    } else {
        showAuth();
    }
}

// ---- AUTENTICACIÓN ----
async function loadCurrentUser() {
    try {
        // Extraer email del JWT
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        const email = decodedPayload.sub;

        // Buscar usuario por email (ya que la API no tiene un endpoint /me)
        const res = await axios.get(`${API_URL}/usuarios`);
        console.log("Respuesta de /usuarios:", res.data); // LOG PARA DEBUG
        
        const usuarios = Array.isArray(res.data) ? res.data : (res.data.content || res.data.data || []);
        
        if (!Array.isArray(usuarios)) {
            throw new Error("El endpoint /usuarios no devolvió un array válido");
        }

        currentUser = usuarios.find(u => u.correo === email);
        
        if(currentUser) {
            userNameEl.textContent = `${currentUser.nombre} ${currentUser.apellido}`;
        }
    } catch (error) {
        console.error("Error cargando usuario:", error);
        if(error.response) {
            console.error("Detalles del error del servidor:", error.response.status, error.response.data);
        }
        currentUser = null;
        logout(); // Si falla la carga del usuario, limpiar el token corrupto
    }
}

document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const correo = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    try {
        const res = await axios.post(`${API_URL}/auth/login`, { correo, password });
        token = res.data.token;
        localStorage.setItem('token', token);
        await init();
    } catch (error) {
        errorEl.textContent = "Credenciales inválidas";
        errorEl.classList.remove('hidden');
    }
});

document.getElementById('form-register').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('reg-nombre').value,
        apellido: document.getElementById('reg-apellido').value,
        telefono: document.getElementById('reg-telefono').value,
        ubicacion: document.getElementById('reg-ubicacion').value,
        correo: document.getElementById('reg-correo').value,
        password: document.getElementById('reg-password').value,
        tipoUsuario: "USER"
    };
    const errorEl = document.getElementById('register-error');
    
    try {
        const res = await axios.post(`${API_URL}/auth/register`, data);
        token = res.data.token;
        localStorage.setItem('token', token);
        await init();
    } catch (error) {
        errorEl.textContent = "Error al registrarse. Verifique los datos.";
        errorEl.classList.remove('hidden');
    }
});

document.getElementById('btn-logout').addEventListener('click', logout);

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    showAuth();
}

function showAuth() {
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    authInfo.classList.add('hidden');
}

function showDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    authInfo.classList.remove('hidden');
    loadMisProductos(); // Cargar la vista por defecto
}

// Pestañas Auth
document.getElementById('tab-login').addEventListener('click', () => {
    document.getElementById('form-login').classList.remove('hidden');
    document.getElementById('form-register').classList.add('hidden');
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
});
document.getElementById('tab-register').addEventListener('click', () => {
    document.getElementById('form-register').classList.remove('hidden');
    document.getElementById('form-login').classList.add('hidden');
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
});

// ---- NAVEGACIÓN DASHBOARD ----
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        document.querySelectorAll('.view-panel').forEach(panel => panel.classList.add('hidden'));
        const targetId = e.target.getAttribute('data-target');
        document.getElementById(targetId).classList.remove('hidden');

        if(targetId === 'view-mis-productos') loadMisProductos();
        if(targetId === 'view-otros-productos') loadMercado();
        if(targetId === 'view-transacciones') loadTransacciones();
        if(targetId === 'view-productos-catalogo') loadCatalogo();
    });
});

// ---- VISTAS Y DATOS ----

// 1. MI INVENTARIO
async function loadMisProductos() {
    try {
        const res = await axios.get(`${API_URL}/inventarios`);
        const miInventario = res.data.filter(inv => inv.usuario.idUsuario === currentUser.idUsuario);
        
        const tbody = document.querySelector('#table-mis-productos tbody');
        tbody.innerHTML = '';
        
        miInventario.forEach(inv => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${inv.idInventario}</td>
                <td>${inv.producto.nombreProducto}</td>
                <td>${inv.cantidadDisponible} ${inv.producto.unidadMedida}</td>
                <td>${inv.fechaRegistro}</td>
                <td>
                    <button class="btn-danger" onclick="eliminarInventario(${inv.idInventario})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error cargando mi inventario", error);
    }
}

// 2. MERCADO (OTROS USUARIOS)
async function loadMercado() {
    try {
        const res = await axios.get(`${API_URL}/inventarios`);
        // Filtrar solo los inventarios donde el usuario NO sea el usuario actual
        // y que tengan stock disponible
        const otrosInventarios = res.data.filter(inv => 
            inv.usuario && 
            inv.usuario.idUsuario !== currentUser.idUsuario &&
            inv.cantidadDisponible > 0
        );
        
        const grid = document.getElementById('grid-otros-productos');
        grid.innerHTML = '';
        
        if(otrosInventarios.length === 0) {
            grid.innerHTML = '<p class="info-msg">No hay productos de otros usuarios disponibles para comprar en este momento.</p>';
            return;
        }

        otrosInventarios.forEach(inv => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <h4>${inv.producto.nombreProducto}</h4>
                    <span class="badge">Venta</span>
                </div>
                <div class="card-body">
                    <p><strong>Vendedor:</strong> ${inv.usuario.nombre} ${inv.usuario.apellido}</p>
                    <p><strong>Ubicación:</strong> ${inv.usuario.ubicacion}</p>
                    <p class="stock"><strong>Disponible:</strong> ${inv.cantidadDisponible} ${inv.producto.unidadMedida}</p>
                    <p class="description">${inv.producto.descripcion}</p>
                </div>
                <div class="card-actions">
                    <button class="btn-primary btn-block" onclick='abrirModalComprar(${JSON.stringify(inv)})'>Comprar Ahora</button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Error cargando mercado", error);
    }
}

// 3. TRANSACCIONES
async function loadTransacciones() {
    try {
        const res = await axios.get(`${API_URL}/transacciones`);
        // Filtrar transacciones donde soy comprador o vendedor
        const misTx = res.data.filter(tx => 
            tx.vendedor.idUsuario === currentUser.idUsuario || 
            tx.comprador.idUsuario === currentUser.idUsuario
        );
        
        const tbody = document.querySelector('#table-transacciones tbody');
        tbody.innerHTML = '';
        
        misTx.forEach(tx => {
            const esVenta = tx.vendedor.idUsuario === currentUser.idUsuario;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${tx.idTransaccion}</td>
                <td>${tx.producto.nombreProducto}</td>
                <td>${esVenta ? 'Yo' : tx.vendedor.nombre}</td>
                <td>${!esVenta ? 'Yo' : tx.comprador.nombre}</td>
                <td>${tx.cantidad}</td>
                <td>$${tx.precio}</td>
                <td>${new Date(tx.fecha).toLocaleString()}</td>
            `;
            // Resaltar ligeramente si es venta o compra
            tr.style.backgroundColor = esVenta ? '#f0fdf4' : '#f0f9ff';
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error cargando transacciones", error);
    }
}

// 4. CATÁLOGO
async function loadCatalogo() {
    try {
        const res = await axios.get(`${API_URL}/productos`);
        const tbody = document.querySelector('#table-productos-catalogo tbody');
        tbody.innerHTML = '';
        
        res.data.forEach(prod => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${prod.idProducto}</td>
                <td>${prod.nombreProducto}</td>
                <td>${prod.descripcion}</td>
                <td>${prod.unidadMedida}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error cargando catálogo", error);
    }
}

// ---- MODALES Y CRUD ----

// Cerrar modales
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').classList.add('hidden');
    });
});

// Modal Nuevo Producto (Catálogo)
document.getElementById('btn-add-producto').addEventListener('click', () => {
    document.getElementById('form-producto').reset();
    document.getElementById('modal-producto').classList.remove('hidden');
});

document.getElementById('form-producto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        nombreProducto: document.getElementById('prod-nombre').value,
        descripcion: document.getElementById('prod-desc').value,
        unidadMedida: document.getElementById('prod-unidad').value
    };
    try {
        await axios.post(`${API_URL}/productos`, data);
        document.getElementById('modal-producto').classList.add('hidden');
        loadCatalogo();
    } catch (error) {
        alert("Error al crear producto");
    }
});

// Modal Agregar a Mi Inventario
document.getElementById('btn-add-inventario').addEventListener('click', async () => {
    document.getElementById('form-inventario').reset();
    
    // Cargar opciones de productos
    const res = await axios.get(`${API_URL}/productos`);
    const select = document.getElementById('inv-producto');
    select.innerHTML = '';
    res.data.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.idProducto;
        opt.textContent = `${p.nombreProducto} (${p.unidadMedida})`;
        select.appendChild(opt);
    });

    document.getElementById('modal-inventario').classList.remove('hidden');
});

document.getElementById('form-inventario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        usuario: { idUsuario: currentUser.idUsuario },
        producto: { idProducto: parseInt(document.getElementById('inv-producto').value) },
        cantidadDisponible: parseFloat(document.getElementById('inv-cantidad').value),
        fechaRegistro: new Date().toISOString().split('T')[0]
    };
    try {
        await axios.post(`${API_URL}/inventarios`, data);
        document.getElementById('modal-inventario').classList.add('hidden');
        loadMisProductos();
    } catch (error) {
        alert("Error al agregar al inventario");
    }
});

async function eliminarInventario(id) {
    if(confirm("¿Seguro que deseas eliminar este item de tu inventario?")) {
        try {
            await axios.delete(`${API_URL}/inventarios/${id}`);
            loadMisProductos();
        } catch (error) {
            alert("Error al eliminar");
        }
    }
}

// Modal Comprar (Transacciones)
function abrirModalComprar(inventario) {
    document.getElementById('form-comprar').reset();
    document.getElementById('compra-vendedor-nombre').textContent = `${inventario.usuario.nombre} ${inventario.usuario.apellido}`;
    document.getElementById('compra-producto-nombre').textContent = inventario.producto.nombreProducto;
    
    document.getElementById('compra-vendedor-id').value = inventario.usuario.idUsuario;
    document.getElementById('compra-producto-id').value = inventario.producto.idProducto;
    
    document.getElementById('compra-cantidad').max = inventario.cantidadDisponible;

    document.getElementById('modal-comprar').classList.remove('hidden');
}

document.getElementById('form-comprar').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        idProducto: parseInt(document.getElementById('compra-producto-id').value),
        idVendedor: parseInt(document.getElementById('compra-vendedor-id').value),
        idComprador: currentUser.idUsuario,
        cantidad: parseInt(document.getElementById('compra-cantidad').value),
        precio: parseFloat(document.getElementById('compra-precio').value),
        fecha: new Date().toISOString().split('.')[0] // Evitar milisegundos excesivos para Spring
    };
    try {
        const res = await axios.post(`${API_URL}/transacciones`, data);
        console.log("Transacción exitosa:", res.data);
        alert("¡Compra realizada con éxito! El inventario se ha actualizado.");
        document.getElementById('modal-comprar').classList.add('hidden');
        
        // Recargar todas las vistas para reflejar los cambios en el inventario
        loadMisProductos();
        loadMercado();
        loadTransacciones();
    } catch (error) {
        console.error("Error al comprar:", error.response ? error.response.data : error);
        alert("Error al realizar la compra. Verifica la consola para más detalles.");
    }
});

// Init
init();
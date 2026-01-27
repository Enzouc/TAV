export const CLAVES_BD = {
    USUARIOS: 'gasexpress_users',
    PRODUCTOS: 'gasexpress_products',
    PEDIDOS: 'gasexpress_orders',
    USUARIO_ACTUAL: 'gasexpress_current_user',
    CARRITO: 'gasexpress_cart',
    SESSION_TOKEN: 'gasexpress_session_token',
    CSRF_TOKEN: 'gasexpress_csrf_token',
    ACTIVITY_LOG: 'gasexpress_activity_log',
    LOGIN_ATTEMPTS: 'gasexpress_login_attempts',
    SESSION_EXP: 'gasexpress_session_exp'
};

export const STORAGE_VERSION = 'v1';
export const PREFIXES = {
    USER: 'user',
    ORDER: 'order',
    PRODUCT: 'product'
};
export const construirPrefijo = (tipo, id) => `${tipo}_${STORAGE_VERSION}_${id}`;

const parseSeguro = (valor, respaldo) => {
    try {
        return JSON.parse(valor || '');
    } catch {
        return respaldo;
    }
};

export const inicializarDatos = () => {
    if (!localStorage.getItem(CLAVES_BD.USUARIOS)) {
        const usuariosIniciales = [
            {
                id: '#ADMIN_ROOT',
                nombre: 'Root Admin',
                email: 'admin@tav.cl',
                rol: 'admin',
                contrasena: 'Root123!',
                estado: 'activo',
                telefono: '+56 9 0000 0000',
                fechaRegistro: new Date().toLocaleString('es-CL')
            },
            {
                id: '#ADMIN',
                nombre: 'Administrador',
                email: 'admin@gasexpress.cl',
                rol: 'admin',
                contrasena: 'Admin123!',
                estado: 'activo',
                telefono: '+56 9 0000 0001',
                fechaRegistro: new Date().toLocaleString('es-CL')
            },
            {
                id: '#R050',
                nombre: 'Pedro El Rayo',
                email: 'pedro@gasexpress.cl',
                rol: 'repartidor',
                contrasena: 'Pedro123!',
                estado: 'activo',
                telefono: '+56 9 1234 5678',
                estadisticas: { entregas: 145, calificacion: 4.8 }
            },
            {
                id: '#U101',
                nombre: 'Juan Pérez',
                email: 'juan@example.com',
                rol: 'usuario',
                contrasena: 'Juan123!',
                estado: 'activo',
                telefono: '+56 9 8765 4321',
                direccion: { calle: 'Av. Siempre Viva', numero: '123', region: 'Biobío', comuna: 'Concepción' }
            },
            {
                id: '#U102',
                nombre: 'Maria González',
                email: 'maria@example.com',
                rol: 'usuario',
                contrasena: 'Maria123!',
                estado: 'bloqueado',
                telefono: '+56 9 1111 2222',
                direccion: { calle: 'Collao', numero: '456', region: 'Biobío', comuna: 'Concepción' }
            }
        ];
        localStorage.setItem(CLAVES_BD.USUARIOS, JSON.stringify(usuariosIniciales));
    } else {
        const usuarios = parseSeguro(localStorage.getItem(CLAVES_BD.USUARIOS), []);
        if (!usuarios.find(u => u.id === '#ADMIN_ROOT')) {
            usuarios.unshift({
                id: '#ADMIN_ROOT',
                nombre: 'Root Admin',
                email: 'admin@tav.cl',
                rol: 'admin',
                contrasena: 'Root123!',
                estado: 'activo',
                telefono: '+56 9 0000 0000'
            });
            localStorage.setItem(CLAVES_BD.USUARIOS, JSON.stringify(usuarios));
        }
    }

    if (!localStorage.getItem(CLAVES_BD.PRODUCTOS)) {
        const productosIniciales = [
            { 
                id: '#P001', 
                nombre: 'Gas 11 Kg', 
                precio: 14500, 
                stock: 50, 
                categoria: 'Normal',
                descripcion: 'Cilindro de gas licuado de 11kg, ideal para estufas y cocinas domésticas. Formato tradicional y versátil para el hogar.'
            },
            { 
                id: '#P002', 
                nombre: 'Gas 15 Kg', 
                precio: 19000, 
                stock: 30, 
                categoria: 'Normal',
                descripcion: 'Cilindro de 15kg con mayor autonomía. Perfecto para familias medianas y uso constante en calefacción y cocina.'
            },
            { 
                id: '#P003', 
                nombre: 'Gas 45 Kg', 
                precio: 58000, 
                stock: 5, 
                categoria: 'Industrial',
                descripcion: 'Gran capacidad de 45kg para alto consumo. Recomendado para comercios, restaurantes o sistemas de calefacción central.'
            },
            { 
                id: '#P004', 
                nombre: 'Gas 5 Kg', 
                precio: 8000, 
                stock: 100, 
                categoria: 'Camping',
                descripcion: 'Formato portátil de 5kg. Ligero y fácil de transportar, esencial para camping, parrillas móviles y estufas pequeñas.'
            },
            { 
                id: '#P005', 
                nombre: 'Catalítico 11 Kg', 
                precio: 15500, 
                stock: 20, 
                categoria: 'Catalítico',
                descripcion: 'Cilindro especial para estufas catalíticas. Conexión rápida y segura para mantener tu hogar cálido en invierno.'
            }
        ];
        localStorage.setItem(CLAVES_BD.PRODUCTOS, JSON.stringify(productosIniciales));
    }

    if (!localStorage.getItem(CLAVES_BD.PEDIDOS)) {
        const pedidosIniciales = [
            {
                id: '#ORD-001',
                idUsuario: '#U101',
                nombreUsuario: 'Juan Pérez',
                direccion: 'Av. Paicaví 123, Concepción',
                total: 14500,
                estado: 'Pendiente',
                idRepartidor: null,
                items: [{ productoId: '#P001', nombre: 'Gas 11 Kg', cantidad: 1, precio: 14500 }],
                fecha: '2023-10-08 10:15'
            },
            {
                id: '#ORD-002',
                idUsuario: '#U102',
                nombreUsuario: 'Maria González',
                direccion: 'Collao 456, Concepción',
                total: 19000,
                estado: 'En Camino',
                idRepartidor: '#R050',
                items: [{ productoId: '#P002', nombre: 'Gas 15 Kg', cantidad: 1, precio: 19000 }],
                fecha: '2023-10-09 14:30'
            }
        ];
        localStorage.setItem(CLAVES_BD.PEDIDOS, JSON.stringify(pedidosIniciales));
    }
};

export const aplicarFormatoMoneda = (monto) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
};

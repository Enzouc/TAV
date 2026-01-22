import { obtenerProductos, guardarProductos, obtenerUsuarioActual } from './almacenamiento';
import { CLAVES_BD } from './datos';

const registrarLog = (entrada) => {
    const log = JSON.parse(localStorage.getItem(CLAVES_BD.ACTIVITY_LOG) || '[]');
    log.push({ ts: Date.now(), ...entrada });
    localStorage.setItem(CLAVES_BD.ACTIVITY_LOG, JSON.stringify(log));
};

// 1. Agregar Producto
export const agregarProducto = (id, nombre, precio, stock, categoria) => {
    const productos = obtenerProductos();
    
    if (productos.some(p => p.id === id)) {
        throw new Error('El ID del producto ya existe.');
    }
    
    const nuevoProducto = {
        id,
        nombre: nombre,
        precio: Number(precio),
        stock: Number(stock),
        categoria: categoria || 'Normal'
    };
    
    productos.push(nuevoProducto);
    guardarProductos(productos);
    const actor = obtenerUsuarioActual();
    registrarLog({
        tipo: 'producto_create',
        fecha: new Date().toLocaleString('es-CL'),
        detalle: {
            actorId: actor?.id || 'sistema',
            productoId: nuevoProducto.id,
            campos: { ...nuevoProducto }
        }
    });
    return nuevoProducto;
};

// 2. Actualizar Stock
export const actualizarStock = (id, cantidad) => {
    const productos = obtenerProductos();
    const indice = productos.findIndex(p => p.id === id);
    
    if (indice === -1) {
        throw new Error('Producto no encontrado.');
    }
    
    const previo = { ...productos[indice] };
    const nuevoStock = Number(cantidad);
    productos[indice].stock = nuevoStock;
    guardarProductos(productos);
    const actor = obtenerUsuarioActual();
    registrarLog({
        tipo: 'producto_change',
        fecha: new Date().toLocaleString('es-CL'),
        detalle: {
            actorId: actor?.id || 'sistema',
            productoId: id,
            cambios: [{ campo: 'stock', anterior: previo.stock, nuevo: nuevoStock }]
        }
    });
    return productos[indice];
};

// 3. Buscar Productos por Categoría
export const buscarProductosPorCategoria = (categoria) => {
    const productos = obtenerProductos();
    if (!categoria) return productos;
    return productos.filter(p => p.categoria === categoria);
};

// 4. Obtener Producto por ID
export const obtenerProductoPorId = (id) => {
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id === id);
    if (!producto) throw new Error('Producto no encontrado.');
    return producto;
};

// 5. Obtener Imagen de Producto (Helper)
export const obtenerImagenProducto = (nombre) => {
    if (!nombre) return 'productos_gas/producto-gas-15-kg.png';
    const nm = String(nombre).toLowerCase();
    
    if (nm.includes('catalítico') || nm.includes('catalitico')) {
        return 'productos_gas/producto-gas-catalitico-11-kg.jpg';
    }
    
    const match = nm.match(/(\d+)\s*kg/);
    const peso = match ? parseInt(match[1], 10) : null;
    
    if (peso === 5) return 'productos_gas/producto-gas-5-kg.png';
    if (peso === 11) return 'productos_gas/producto-gas-11-kg.png';
    if (peso === 15) return 'productos_gas/producto-gas-15-kg.png';
    if (peso === 45) return 'productos_gas/producto-gas-45-kg.png';
    
    return 'productos_gas/producto-gas-15-kg.png';
};

// 6. Eliminar Producto
export const eliminarProducto = (id) => {
    const productos = obtenerProductos();
    const indice = productos.findIndex(p => p.id === id);
    
    if (indice === -1) {
        throw new Error('Producto no encontrado.');
    }
    
    const previo = productos[indice];
    productos.splice(indice, 1);
    guardarProductos(productos);
    const actor = obtenerUsuarioActual();
    registrarLog({
        tipo: 'producto_delete',
        fecha: new Date().toLocaleString('es-CL'),
        detalle: {
            actorId: actor?.id || 'sistema',
            productoId: id,
            camposPrevios: { ...previo }
        }
    });
    return true;
};

// Extra: Obtener todos los productos
export const obtenerTodosLosProductos = () => {
    const productos = obtenerProductos();
    return productos.slice().sort((a, b) => a.precio - b.precio);
};

// Extra: Actualizar Producto
export const actualizarProducto = (id, camposActualizados) => {
    const productos = obtenerProductos();
    const indice = productos.findIndex(p => p.id === id);
    if (indice === -1) throw new Error('Producto no encontrado');
    
    // Permitir cambio de ID con verificación de unicidad
    if (camposActualizados.id && camposActualizados.id !== id) {
        if (productos.some(p => p.id === camposActualizados.id)) {
            throw new Error('El nuevo ID de producto ya existe.');
        }
    }
    const previo = { ...productos[indice] };
    productos[indice] = { ...productos[indice], ...camposActualizados };
    guardarProductos(productos);
    const actor = obtenerUsuarioActual();
    const actualizado = productos[indice];
    const cambios = Object.keys(camposActualizados).map(campo => ({
        campo,
        anterior: previo[campo],
        nuevo: actualizado[campo]
    })).filter(c => c.anterior !== c.nuevo);
    if (cambios.length > 0) {
        registrarLog({
            tipo: 'producto_change',
            fecha: new Date().toLocaleString('es-CL'),
            detalle: {
                actorId: actor?.id || 'sistema',
                productoId: actualizado.id,
                cambios
            }
        });
    }
    return productos[indice];
};

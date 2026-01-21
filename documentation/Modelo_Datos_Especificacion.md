# Especificación del Modelo de Datos - GasExpress
**Versión:** 1.0.0  
**Fecha:** 2026-01-12  
**Estado:** Implementado

## 1. Introducción
Este documento describe el modelo de datos implementado actualmente en el sistema GasExpress. La persistencia de datos se maneja a través de `localStorage` en el navegador, simulando una base de datos relacional mediante colecciones JSON estructuradas.

---

## 2. Entidades Principales

### 2.1. Usuario (User)
Representa a todos los actores del sistema. Se utiliza una estrategia de "Single Table Inheritance" donde el atributo `rol` discrimina el tipo de usuario.

| Atributo | Tipo de Dato | Descripción | Restricciones |
| :--- | :--- | :--- | :--- |
| `id` | String (PK) | Identificador único | Formato `#U{num}` o `#ADMIN` |
| `nombre` | String | Nombre completo | Min 3 caracteres |
| `email` | String | Correo electrónico | Único, formato válido |
| `contrasena` | String | Contraseña de acceso | - |
| `rol` | String | Rol del usuario | Enum: `['usuario', 'admin', 'repartidor']` |
| `estado` | String | Estado de la cuenta | Enum: `['activo', 'bloqueado']` |
| `telefono` | String | Teléfono de contacto | Formato chileno preferido |
| `direccion` | Object | Dirección de despacho | Solo para rol `usuario` |
| `estadisticas` | Object | Estadísticas de rendimiento | Solo para rol `repartidor` |

**Estructura del Objeto Dirección:**
```json
{
  "calle": "String",
  "numero": "String",
  "region": "String",
  "comuna": "String"
}
```

**Estructura del Objeto Estadísticas:**
```json
{
  "entregas": "Number",
  "calificacion": "Number"
}
```

### 2.2. Producto (Product)
Representa los cilindros de gas disponibles para la venta.

| Atributo | Tipo de Dato | Descripción | Restricciones |
| :--- | :--- | :--- | :--- |
| `id` | String (PK) | Identificador único | Formato `#P{num}` |
| `nombre` | String | Nombre comercial | Ej: "Gas 15 Kg" |
| `precio` | Number | Precio unitario (CLP) | >= 0 |
| `stock` | Number | Cantidad disponible | >= 0 |
| `categoria` | String | Categoría del producto | Enum: `['Normal', 'Industrial', 'Camping', 'Catalítico']` |

### 2.3. Pedido (Order)
Representa una transacción de compra realizada por un cliente.

| Atributo | Tipo de Dato | Descripción | Restricciones |
| :--- | :--- | :--- | :--- |
| `id` | String (PK) | Identificador único | Formato `#ORD-{num}` |
| `idUsuario` | String (FK) | ID del cliente | Referencia a `Usuario.id` |
| `nombreUsuario` | String | Snapshot del nombre del cliente | Persistencia histórica |
| `telefonoUsuario` | String | Snapshot del teléfono | Contacto para entrega |
| `direccion` | String | Dirección de entrega completa | Concatenación de campos |
| `total` | Number | Monto total de la compra | Suma de items |
| `estado` | String | Estado del pedido | Enum: `['Pendiente', 'En Camino', 'Entregado', 'Cancelado']` |
| `idRepartidor` | String (FK) | ID del repartidor asignado | Referencia a `Usuario.id`, Nullable |
| `fecha` | String | Fecha y hora de creación | ISO String o Locale String |
| `metodoPago` | String | Método de pago | Enum: `['transferencia', 'tarjeta', 'efectivo']` |

### 2.4. DetallePedido (OrderItem)
Objeto embebido dentro de la entidad `Pedido` que detalla los productos comprados.

| Atributo | Tipo de Dato | Descripción | Restricciones |
| :--- | :--- | :--- | :--- |
| `idProducto` | String (FK) | ID del producto | Referencia a `Producto.id` |
| `nombre` | String | Nombre del producto | Snapshot histórico |
| `cantidad` | Number | Cantidad comprada | > 0 |
| `precio` | Number | Precio unitario al momento de compra | Snapshot histórico |

---

## 3. Relaciones y Cardinalidades

1. **Usuario (Cliente) a Pedido (Order):**
   - Tipo: Asociación 1 a N.
   - Cardinalidad: `1` Cliente puede tener `0..*` Pedidos.
   - Descripción: Un cliente realiza múltiples pedidos en el tiempo.

2. **Usuario (Repartidor) a Pedido (Order):**
   - Tipo: Asociación 0 a N.
   - Cardinalidad: `1` Repartidor puede tener `0..*` Pedidos asignados.
   - Descripción: Un repartidor entrega pedidos. Un pedido puede no tener repartidor asignado inicialmente (`null`).

3. **Pedido (Order) a DetallePedido (OrderItem):**
   - Tipo: Composición.
   - Cardinalidad: `1` Pedido contiene `1..*` Items.
   - Descripción: Si se elimina el pedido, se eliminan sus detalles (en este modelo NoSQL embebido).

4. **DetallePedido a Producto (Product):**
   - Tipo: Asociación Unidireccional.
   - Cardinalidad: `1` Item referencia a `1` Producto.
   - Descripción: Referencia lógica para control de inventario.

---

## 4. Métodos y Comportamiento (Lógica de Negocio)

### Clase Usuario (Abstracta / Base)
- `iniciarSesion(email, contrasena)`: Valida credenciales y estado `activo`.
- `cerrarSesion()`: Destruye la sesión en localStorage.
- `verificarAutenticacion(rol)`: Verifica permisos de acceso.

### Clase Admin (Extiende Usuario)
- `agregarProducto(datosProducto)`: Crea nuevo registro en inventario.
- `actualizarStock(id, cantidad)`: Modifica precio/stock.
- `cambiarEstadoUsuario(idUsuario, nuevoEstado)`: Cambia estado de usuario a `bloqueado`.
- `asignarRepartidor(idPedido, idRepartidor)`: Vincula un repartidor a un pedido.

### Clase Cliente (Extiende Usuario)
- `agregarAlCarrito(producto, cantidad)`: Agrega item a `gasexpress_cart` (lógica en vista/contexto).
- `crearPedido()`: Convierte el carrito en una entidad `Pedido` y vacía el carrito.

### Clase Pedido
- `calcularTotal()`: Suma `cantidad * precio` de todos los items.
- `actualizarEstadoPedido(nuevoEstado)`: Transición de estados (e.g., Pendiente -> En Camino).

---

## 5. Diccionario de Datos (Local Storage Keys)
El sistema utiliza las siguientes claves maestras para persistencia:

- `gasexpress_users`: Array de objetos Usuario.
- `gasexpress_products`: Array de objetos Producto.
- `gasexpress_orders`: Array de objetos Pedido.
- `gasexpress_cart`: Array de objetos ItemCarrito (Sesión local).
- `gasexpress_current_user`: Objeto Usuario (Sesión activa).

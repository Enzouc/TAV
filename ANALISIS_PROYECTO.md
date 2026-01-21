# Análisis del Proyecto Fullstack TAV

## 1. Arquitectura del Sistema

El proyecto es una **Aplicación de Página Única (SPA)** desarrollada con **React 19** y construida con **Vite 7**. La arquitectura sigue un enfoque "sin backend" para esta fase, utilizando `localStorage` del navegador como capa de persistencia de datos simulada.

### Componentes Principales

*   **Vistas (Views):** Ubicadas en `src/views`, representan las páginas principales de la aplicación (Inicio, Catálogo, Inicio de Sesión, Carrito, Admin, etc.).
*   **Componentes UI:** Ubicados en `src/components`, son piezas reutilizables de interfaz como `Header`, `Footer`, `Modal`, `Notificacion`.
*   **Rutas:** Gestionadas por `react-router-dom` v7 en `src/App.jsx`. Incluye rutas públicas y rutas protegidas mediante el componente `RutaProtegida`.
*   **Estado Global:** Se maneja a través de `ContextoUI` (para estado de UI como notificaciones y modales) y eventos personalizados (`window.dispatchEvent`) para sincronizar cambios en autenticación y carrito entre componentes.
*   **Lógica de Negocio:** Encapsulada en `src/utils`, separando la lógica de la interfaz.

### Flujo de Datos
1.  **Lectura:** Los componentes solicitan datos a través de funciones en `utils` (ej. `obtenerProductos`, `obtenerUsuarioActual`).
2.  **Escritura:** Las acciones del usuario invocan funciones en `utils` (ej. `crearPedido`, `iniciarSesion`) que modifican los datos y actualizan `localStorage`.
3.  **Reactividad:** Eventos como `carrito-actualizado` o `auth-cambiado` notifican a la UI para que se renderice nuevamente con los datos actualizados.

## 2. Dependencias Clave

*   **React & React DOM (v19):** Biblioteca principal para la construcción de interfaces.
*   **React Router DOM (v7):** Manejo de navegación y rutas.
*   **Vite (v7):** Empaquetador y servidor de desarrollo rápido.
*   **Bootstrap (v5):** Framework CSS para estilos y diseño responsivo.
*   **Vitest & React Testing Library:** Framework de pruebas unitarias y de integración.

## 3. Estilo de Programación y Patrones

*   **Programación Funcional:** Uso extensivo de componentes funcionales de React y Hooks (`useState`, `useEffect`, `useContext`).
*   **Separación de Intereses (SoC):**
    *   `views/`: Lógica de presentación de páginas.
    *   `components/`: UI reutilizable.
    *   `utils/`: Lógica de negocio pura y acceso a datos.
*   **Patrón Repositorio (Simulado):** Los archivos en `src/utils` (`producto.js`, `usuario.js`, `pedido.js`) actúan como repositorios que abstraen el acceso a datos (`almacenamiento.js`), permitiendo que los componentes no conozcan los detalles de `localStorage`.
*   **Singleton/Estado Global:** `almacenamiento.js` actúa como una fuente de verdad única para la sesión y datos persistentes.

## 4. Idea Central del Desarrollo

El objetivo es simular una plataforma completa de venta y distribución de gas (GasExpress) con roles diferenciados:
1.  **Cliente:** Catálogo, carrito, pago, seguimiento de pedidos.
2.  **Repartidor:** Gestión de entregas asignadas.
3.  **Administrador:** Gestión de inventario, usuarios y supervisión general.

La implementación actual prioriza la experiencia de usuario y la lógica de flujo de datos en el frontend, utilizando persistencia local para permitir pruebas funcionales completas sin necesidad de un backend desplegado.

---

## Estrategia de Pruebas Implementada

Se ha diseñado una suite de pruebas que cubre:

1.  **Pruebas Unitarias (Utils):** Verificación de la lógica de negocio crítica (cálculos de precios, validación de usuarios, gestión de stock).
2.  **Pruebas de Componentes:** Verificación de renderizado y comportamiento de componentes UI (Notificaciones, Rutas Protegidas).
3.  **Pruebas de Integración (Simuladas):** Flujos que involucran múltiples unidades (ej. agregar al carrito y verificar total).

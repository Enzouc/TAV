## 2026-01-15

- Limpieza de imports en `src/views/VistaAdmin.jsx`:
  - Unificado `aplicarFormatoMoneda` y `CLAVES_BD` en un solo import desde `../utils/datos`.
  - Eliminados imports no utilizados de `cambiarEstadoUsuario` y `eliminarUsuario` desde `../utils/usuario`.
  - Verificada coherencia de rutas y uso correcto de los imports restantes.
- Validación: Suite completa de pruebas pasa (55 tests).


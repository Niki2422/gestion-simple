// ============================================================
// usuarios.rutas.js  —  multi-consorcio
// Ubicación: src/routes/usuarios.rutas.js
//
// Estas rutas NO tienen scope de consorcio.
// Las rutas con scope de consorcio están en consorcios.rutas.js
// montadas bajo /api/consorcios/:cid/usuarios
// ============================================================

const router     = require('express').Router();
const ctrl       = require('../controller/usuarios.controlador');
const autenticar = require('../middlewares/autenticar');

router.use(autenticar);

// Cambiar propia contraseña — cualquier usuario autenticado
router.patch('/mi-contrasena', ctrl.cambiarContrasena);

module.exports = router;
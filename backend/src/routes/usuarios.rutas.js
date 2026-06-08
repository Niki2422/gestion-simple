// ============================================================
// usuarios.rutas.js
// Ubicación: src/routes/usuarios.rutas.js
// ============================================================

const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controller/usuarios.controlador');
const autenticar = require('../middlewares/autenticar');
const autorizar  = require('../middlewares/autorizar');

router.use(autenticar);

// Ruta propia — cualquier usuario autenticado puede cambiar su contraseña
// IMPORTANTE: debe ir ANTES de /:id para no ser interceptada
router.patch('/mi-contrasena', ctrl.cambiarContrasena);

// Rutas solo para administrador
router.use(autorizar('administrador'));
router.get('/',       ctrl.listar);
router.get('/:id',    ctrl.obtenerUno);
router.post('/',      ctrl.crear);
router.put('/:id',    ctrl.actualizar);
router.delete('/:id', ctrl.desactivar);

module.exports = router;
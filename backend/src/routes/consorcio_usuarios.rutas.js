// ============================================================
// consorcio_usuarios.rutas.js
// Ubicación: src/routes/consorcio_usuarios.rutas.js
//
// Rutas de usuarios DENTRO de un consorcio.
// Montadas bajo /api/consorcios/:cid/usuarios
// req.consorcioId y req.rolEnConsorcio ya vienen inyectados.
// ============================================================

const router = require('express').Router({ mergeParams: true });
const ctrl   = require('../controller/usuarios.controlador');
const { soloAdminConsorcio } = require('../middlewares/verificarAccesoConsorcio');

// GET    /api/consorcios/:cid/usuarios          → listar miembros
// POST   /api/consorcios/:cid/usuarios          → agregar miembro
// PATCH  /api/consorcios/:cid/usuarios/:uid/rol → cambiar rol
// DELETE /api/consorcios/:cid/usuarios/:uid     → quitar del consorcio

router.get ('/',              ctrl.listar);
router.post('/',              soloAdminConsorcio, ctrl.crear);
router.patch('/:uid/rol',     soloAdminConsorcio, ctrl.actualizarRol);
router.delete('/:uid',        soloAdminConsorcio, ctrl.quitar);

module.exports = router;
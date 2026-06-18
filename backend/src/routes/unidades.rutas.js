// ============================================================
// unidades.rutas.js  —  multi-consorcio
// Ubicación: src/routes/unidades.rutas.js
// Montada bajo /api/consorcios/:cid/unidades
// ============================================================

const router = require('express').Router({ mergeParams: true });
const ctrl   = require('../controller/unidades.controlador');
const { soloAdminConsorcio } = require('../middlewares/verificarAccesoConsorcio');

// Lectura — cualquier miembro del consorcio
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtenerUna);

// Escritura — solo administrador del consorcio
router.post('/',      soloAdminConsorcio, ctrl.crear);
router.put('/:id',    soloAdminConsorcio, ctrl.actualizar);
router.delete('/:id', soloAdminConsorcio, ctrl.desactivar);

module.exports = router;
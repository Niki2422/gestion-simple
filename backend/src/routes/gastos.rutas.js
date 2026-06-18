// ============================================================
// gastos.rutas.js  —  multi-consorcio
// Ubicación: src/routes/gastos.rutas.js
// Montada bajo /api/consorcios/:cid/gastos
// ============================================================

const router = require('express').Router({ mergeParams: true });
const ctrl   = require('../controller/gastos.controlador');
const { soloAdminConsorcio } = require('../middlewares/verificarAccesoConsorcio');

// GET /gastos?periodoId=xxx — todos los roles pueden consultar
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtenerUno);

// Solo administrador del consorcio puede cargar y eliminar gastos
router.post('/',      soloAdminConsorcio, ctrl.crear);
router.delete('/:id', soloAdminConsorcio, ctrl.eliminar);

module.exports = router;
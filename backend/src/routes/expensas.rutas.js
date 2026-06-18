// ============================================================
// expensas.rutas.js  —  multi-consorcio
// Ubicación: src/routes/expensas.rutas.js
// Montada bajo /api/consorcios/:cid/expensas
// ============================================================

const router = require('express').Router({ mergeParams: true });
const ctrl   = require('../controller/expensas.controlador');
const { soloAdminConsorcio } = require('../middlewares/verificarAccesoConsorcio');

router.get('/',                 ctrl.listarPorPeriodo);
router.get('/deudas',           soloAdminConsorcio, ctrl.estadoDeudas);
router.get('/unidad/:unidadId', ctrl.listarPorUnidad);
router.get('/:id',              ctrl.obtenerUna);
router.patch('/:id/pagar',      soloAdminConsorcio, ctrl.marcarPagada);
router.patch('/:id/revertir',   soloAdminConsorcio, ctrl.revertirPago);

module.exports = router;
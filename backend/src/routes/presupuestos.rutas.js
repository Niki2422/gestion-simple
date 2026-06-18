// ============================================================
// presupuestos.rutas.js  —  multi-consorcio
// Ubicación: src/routes/presupuestos.rutas.js
// Montada bajo /api/consorcios/:cid/presupuestos
// ============================================================

const router = require('express').Router({ mergeParams: true });
const ctrl   = require('../controller/presupuestos.controlador');
const { soloAdminConsorcio } = require('../middlewares/verificarAccesoConsorcio');

router.get ('/',            ctrl.listarLicitaciones);
router.get ('/:id',         ctrl.obtenerLicitacion);
router.post('/',            soloAdminConsorcio, ctrl.crearLicitacion);
router.patch('/:id/estado', soloAdminConsorcio, ctrl.cambiarEstado);
router.delete('/:id',       soloAdminConsorcio, ctrl.eliminarLicitacion);

router.post  ('/:id/items',         soloAdminConsorcio, ctrl.agregarPresupuesto);
router.delete('/:id/items/:itemId', soloAdminConsorcio, ctrl.eliminarPresupuesto);

router.post('/:id/votar',     ctrl.votar);
router.get ('/:id/resultado', ctrl.resultado);

module.exports = router;
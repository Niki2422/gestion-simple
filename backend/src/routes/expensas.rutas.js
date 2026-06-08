// ============================================================
// expensas.rutas.js
// Ubicación: src/routes/expensas.rutas.js
// ============================================================

const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controller/expensas.controlador');
const autenticar = require('../middlewares/autenticar');
const autorizar  = require('../middlewares/autorizar');

router.use(autenticar);

router.get('/',                ctrl.listarPorPeriodo);
router.get('/deudas',          autorizar('administrador'), ctrl.estadoDeudas);
router.get('/unidad/:unidadId', ctrl.listarPorUnidad);
router.get('/:id',             ctrl.obtenerUna);
router.patch('/:id/pagar',     autorizar('administrador'), ctrl.marcarPagada);
router.patch('/:id/revertir',  autorizar('administrador'), ctrl.revertirPago);

module.exports = router;
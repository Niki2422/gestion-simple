// ============================================================
// periodos.rutas.js  —  multi-consorcio
// Ubicación: src/routes/periodos.rutas.js
//
// Montada bajo /api/consorcios/:cid/periodos
// req.consorcioId y req.rolEnConsorcio ya vienen inyectados
// por el middleware verificarAccesoConsorcio en app.js
// ============================================================

const router = require('express').Router({ mergeParams: true });
const ctrl   = require('../controller/periodos.controlador');
const { soloAdminConsorcio } = require('../middlewares/verificarAccesoConsorcio');

// Lectura: todos los roles del consorcio
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtenerUno);

// Escritura: solo administrador del consorcio
router.post('/',           soloAdminConsorcio, ctrl.crear);
router.post('/:id/cerrar', soloAdminConsorcio, ctrl.cerrar);
router.delete('/:id',      soloAdminConsorcio, ctrl.eliminar);

module.exports = router;
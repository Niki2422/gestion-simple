// ============================================================
// presupuestos.rutas.js
// Ubicación: src/routes/presupuestos.rutas.js
// ============================================================

const router     = require('express').Router();
const ctrl       = require('../controller/presupuesto.controlador');
const autenticar = require('../middlewares/autenticar');
const autorizar  = require('../middlewares/autorizar');

// Todas las rutas requieren autenticación
router.use(autenticar);

// ── Licitaciones ───────────────────────────────────────────
router.get ('/',                    ctrl.listarLicitaciones);
router.get ('/:id',                 ctrl.obtenerLicitacion);
router.post('/',                    autorizar('administrador'), ctrl.crearLicitacion);
router.patch('/:id/estado',         autorizar('administrador'), ctrl.cambiarEstado);
router.delete('/:id',               autorizar('administrador'), ctrl.eliminarLicitacion);

// ── Presupuestos individuales (admin) ──────────────────────
router.post  ('/:id/items',         autorizar('administrador'), ctrl.agregarPresupuesto);
router.delete('/:id/items/:itemId', autorizar('administrador'), ctrl.eliminarPresupuesto);

// ── Votación (propietarios y admin) ───────────────────────
router.post('/:id/votar', autorizar('propietario'), ctrl.votar);
router.get ('/:id/resultado',       ctrl.resultado);

module.exports = router;
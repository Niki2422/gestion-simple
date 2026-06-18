// ============================================================
// consorcios.rutas.js
// Ubicación: src/routes/consorcios.rutas.js
// ============================================================

const router     = require('express').Router();
const ctrl       = require('../controller/consorcios.controlador');
const autenticar = require('../middlewares/autenticar');
const { verificarAccesoConsorcio, soloAdminConsorcio } = require('../middlewares/verificarAccesoConsorcio');

router.use(autenticar);

// GET  /api/consorcios         → lista los consorcios del usuario
// POST /api/consorcios         → crea un nuevo consorcio (solo admin plataforma)
router.get ('/', ctrl.listar);
router.post('/', ctrl.crear);

// GET   /api/consorcios/:cid   → detalle del consorcio
// PATCH /api/consorcios/:cid   → editar nombre/dirección (solo admin consorcio)
router.get  ('/:cid', verificarAccesoConsorcio, ctrl.obtener);
router.patch('/:cid', verificarAccesoConsorcio, soloAdminConsorcio, ctrl.actualizar);

module.exports = router;
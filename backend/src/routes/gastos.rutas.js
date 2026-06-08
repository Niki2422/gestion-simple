// ============================================================
// gastos.rutas.js
// Solo administradores pueden cargar y eliminar gastos.
// ============================================================

const express  = require('express');
const router   = express.Router();
const ctrl     = require('../controller/gastos.controlador');
const autenticar = require('../middlewares/autenticar');
const autorizar  = require('../middlewares/autorizar');

// Todos los endpoints requieren sesión activa
router.use(autenticar);

// GET /api/gastos?periodoId=xxx  — admin ve todos, otros solo consultan
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtenerUno);

// Solo administrador puede cargar y eliminar gastos
router.post('/',    autorizar('administrador'), ctrl.crear);
router.delete('/:id', autorizar('administrador'), ctrl.eliminar);

module.exports = router;

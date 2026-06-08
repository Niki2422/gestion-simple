
// ============================================================
// periodos.rutas.js
// Ubicación: src/routes/periodos.rutas.js
// ============================================================
 
const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controller/periodos.controlador');
const autenticar = require('../middlewares/autenticar');
const autorizar  = require('../middlewares/autorizar');
 
router.use(autenticar);
 
// Lectura: todos los roles
router.get('/',    ctrl.listar);
router.get('/:id', ctrl.obtenerUno);
 
// Escritura: solo administrador
router.post('/',           autorizar('administrador'), ctrl.crear);
router.post('/:id/cerrar', autorizar('administrador'), ctrl.cerrar);
router.delete('/:id',      autorizar('administrador'), ctrl.eliminar);
 
module.exports = router;
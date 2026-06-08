// ============================================================
// unidades.rutas.js
// Lectura: todos los roles autenticados.
// Escritura: solo administrador.
// ============================================================

const express    = require('express');
const router     = express.Router();

const unidadesControlador = require('../controller/unidades.controlador');
const autenticar          = require('../middlewares/autenticar');
const autorizar           = require('../middlewares/autorizar');

// Lectura — cualquier usuario autenticado puede ver unidades
router.get('/',    autenticar, unidadesControlador.listar);
router.get('/:id', autenticar, unidadesControlador.obtenerUna);

// Escritura — solo administrador
router.post('/',      autenticar, autorizar('administrador'), unidadesControlador.crear);
router.put('/:id',    autenticar, autorizar('administrador'), unidadesControlador.actualizar);
router.delete('/:id', autenticar, autorizar('administrador'), unidadesControlador.desactivar);

module.exports = router;

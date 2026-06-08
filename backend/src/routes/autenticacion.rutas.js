// ============================================================
// autenticacion.rutas.js
// Define los endpoints públicos y protegidos de autenticación.
// ============================================================

const express    = require('express');
const router     = express.Router();

const autenticacionControlador = require('../controller/autenticacion.controlador');
const autenticar               = require('../middlewares/autenticar');

// POST /api/auth/login — público, no requiere token
router.post('/login', autenticacionControlador.login);

// GET /api/auth/yo — protegido, requiere token válido
// Útil para que el frontend verifique si la sesión sigue activa
router.get('/yo', autenticar, autenticacionControlador.obtenerUsuarioActual);

module.exports = router;

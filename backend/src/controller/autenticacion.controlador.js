// ============================================================
// autenticacion.controlador.js
// Responsabilidad: recibir la request, validar datos básicos,
// llamar al servicio y devolver la response.
// No contiene lógica de negocio.
// ============================================================

const autenticacionServicio = require('../service/autenticacion.servicio');
const { ErrorOperacional }  = require('../middlewares/manejarErrores');

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, contrasena } = req.body;

    // Validación básica de campos requeridos
    if (!email || !contrasena) {
      throw new ErrorOperacional('Email y contraseña son requeridos', 400);
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ErrorOperacional('Formato de email inválido', 400);
    }

    const resultado = await autenticacionServicio.login(
      email.toLowerCase().trim(),
      contrasena
    );

    res.json({
      exito:   true,
      mensaje: 'Login exitoso',
      datos:   resultado,
    });

  } catch (error) {
    next(error); // Pasa el error al middleware manejarErrores
  }
};

// GET /api/auth/yo — devuelve los datos del usuario autenticado
// Esta ruta estará protegida por el middleware autenticar.js
const obtenerUsuarioActual = async (req, res, next) => {
  try {
    // req.usuario es inyectado por el middleware autenticar.js
    res.json({
      exito: true,
      datos: req.usuario,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, obtenerUsuarioActual };

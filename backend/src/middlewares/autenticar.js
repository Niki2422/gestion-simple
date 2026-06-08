// ============================================================
// autenticar.js
// Middleware que verifica el JWT en cada petición protegida.
//
// Uso en rutas:
//   router.get('/ruta', autenticar, controlador)
//
// Si el token es válido, agrega req.usuario con los datos
// del usuario y llama a next(). Si no, devuelve 401.
// ============================================================

const jwt                  = require('jsonwebtoken');
const { ErrorOperacional } = require('./manejarErrores');

const autenticar = (req, res, next) => {
  try {
    // El token viene en el header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ErrorOperacional('Token de autenticación requerido', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verificar y decodificar el token
    const payload = jwt.verify(token, process.env.JWT_SECRETO);

    // Inyectar los datos del usuario en la request
    // Disponible como req.usuario en todos los middlewares siguientes
    req.usuario = {
      id:     payload.id,
      nombre: payload.nombre,
      email:  payload.email,
      rol:    payload.rol,
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ErrorOperacional('La sesión expiró. Ingresá nuevamente', 401));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ErrorOperacional('Token inválido', 401));
    }
    next(error);
  }
};

module.exports = autenticar;

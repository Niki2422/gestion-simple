// ============================================================
// autenticar.js  —  multi-consorcio
// Ubicación: src/middlewares/autenticar.js
// ============================================================

const jwt                  = require('jsonwebtoken');
const { ErrorOperacional } = require('./manejarErrores');

const autenticar = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ErrorOperacional('Token de autenticación requerido', 401);
    }

    const token   = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRETO);

    // rol_plataforma: 'administrador' | 'usuario'
    req.usuario = {
      id:             payload.id,
      nombre:         payload.nombre,
      email:          payload.email,
      rol:            payload.rol,            // alias para compatibilidad
      rol_plataforma: payload.rol_plataforma ?? payload.rol,
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
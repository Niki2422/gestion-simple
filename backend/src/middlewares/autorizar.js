// ============================================================
// autorizar.js
// Middleware que verifica que el usuario tenga el rol requerido.
//
// Uso en rutas (siempre DESPUÉS de autenticar):
//   router.post('/usuarios', autenticar, autorizar('administrador'), controlador)
//   router.get('/gastos',    autenticar, autorizar('administrador', 'propietario'), controlador)
//
// Acepta uno o varios roles permitidos.
// ============================================================

const { ErrorOperacional } = require('./manejarErrores');

const autorizar = (...rolesPermitidos) => {
  return (req, res, next) => {
    // autenticar.js debe ejecutarse antes que este middleware
    if (!req.usuario) {
      return next(new ErrorOperacional('No autenticado', 401));
    }

    const tienePermiso = rolesPermitidos.includes(req.usuario.rol);

    if (!tienePermiso) {
      return next(new ErrorOperacional(
        `Acceso denegado. Se requiere rol: ${rolesPermitidos.join(' o ')}`,
        403
      ));
    }

    next();
  };
};

module.exports = autorizar;

// ============================================================
// verificarAccesoConsorcio.js
// Ubicación: src/middlewares/verificarAccesoConsorcio.js
//
// Verifica que el usuario autenticado tenga acceso al consorcio
// indicado en req.params.cid o req.params.consorcioId.
//
// Inyecta req.consorcioId y req.rolEnConsorcio para que los
// controladores no necesiten repetir esta lógica.
//
// Uso:
//   router.use('/:cid/...', autenticar, verificarAccesoConsorcio)
// ============================================================

const ConsorcioModelo      = require('../models/consorcio.modelo');
const { ErrorOperacional } = require('./manejarErrores');

const verificarAccesoConsorcio = async (req, res, next) => {
  try {
    const consorcioId = parseInt(req.params.cid || req.params.consorcioId);
    if (!consorcioId || isNaN(consorcioId)) {
      return next(new ErrorOperacional('ID de consorcio inválido', 400));
    }

    const { acceso, rol } = await ConsorcioModelo.tieneAcceso(consorcioId, req.usuario.id);

    if (!acceso) {
      return next(new ErrorOperacional('No tenés acceso a este consorcio', 403));
    }

    // Disponible en todos los controladores siguientes
    req.consorcioId     = consorcioId;
    req.rolEnConsorcio  = rol;   // 'administrador' | 'propietario' | 'inquilino'

    next();
  } catch (error) {
    next(error);
  }
};

// Helper: solo el admin del consorcio puede continuar
const soloAdminConsorcio = (req, res, next) => {
  if (req.rolEnConsorcio !== 'administrador') {
    return next(new ErrorOperacional('Solo el administrador puede realizar esta acción', 403));
  }
  next();
};

// Helper: propietarios y admins (no inquilinos)
const soloPropietarioOAdmin = (req, res, next) => {
  if (!['administrador', 'propietario'].includes(req.rolEnConsorcio)) {
    return next(new ErrorOperacional('Acción no permitida para inquilinos', 403));
  }
  next();
};

module.exports = { verificarAccesoConsorcio, soloAdminConsorcio, soloPropietarioOAdmin };
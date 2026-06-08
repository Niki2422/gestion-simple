// ============================================================
// Middleware: manejarErrores.js
//
// Captura cualquier error lanzado en controladores o servicios.
// Express lo identifica como middleware de error por tener
// exactamente 4 parámetros: (error, req, res, next).
//
// Ventaja: los controladores solo hacen "throw new Error(...)"
// y este middleware se encarga del formato de respuesta.
// ============================================================

const manejarErrores = (error, req, res, next) => {
  console.error('❌ Error:', error.message);

  // Errores operacionales conocidos (lanzados intencionalmente)
  if (error.esOperacional) {
    return res.status(error.codigoHttp).json({
      exito: false,
      mensaje: error.message,
    });
  }

  // Errores de PostgreSQL
  if (error.code === '23505') {
    return res.status(409).json({
      exito: false,
      mensaje: 'Ya existe un registro con esos datos.',
    });
  }

  if (error.code === '23503') {
    return res.status(400).json({
      exito: false,
      mensaje: 'El registro referenciado no existe.',
    });
  }

  // Error genérico — no exponemos detalles internos en producción
  const mensaje = process.env.NODE_ENV === 'development'
    ? error.message
    : 'Ocurrió un error interno. Intente más tarde.';

  res.status(500).json({
    exito: false,
    mensaje,
  });
};

// ============================================================
// Clase para errores operacionales con código HTTP
//
// Uso en controladores:
//   throw new ErrorOperacional('Usuario no encontrado', 404);
// ============================================================

class ErrorOperacional extends Error {
  constructor(mensaje, codigoHttp = 400) {
    super(mensaje);
    this.codigoHttp = codigoHttp;
    this.esOperacional = true;
  }
}

module.exports = { manejarErrores, ErrorOperacional };

// ============================================================
// gastos.controlador.js
// ============================================================

const gastosServicio = require('../service/gastos.servicio');

// GET /api/gastos?periodoId=xxx
const listar = async (req, res, next) => {
  try {
    const { periodoId } = req.query;
    if (!periodoId) {
      return res.status(400).json({
        exito:   false,
        mensaje: 'El parámetro periodoId es obligatorio',
      });
    }
    const gastos = await gastosServicio.listarPorPeriodo(periodoId);
    res.json({ exito: true, datos: gastos });
  } catch (error) {
    next(error);
  }
};

// GET /api/gastos/:id
const obtenerUno = async (req, res, next) => {
  try {
    const gasto = await gastosServicio.obtenerPorId(req.params.id);
    res.json({ exito: true, datos: gasto });
  } catch (error) {
    next(error);
  }
};

// POST /api/gastos
const crear = async (req, res, next) => {
  try {
    const { descripcion, monto, tipo, periodoId, comprobanteUrl } = req.body;
    const creadoPor = req.usuario.id; // viene del middleware autenticar

    const gasto = await gastosServicio.crear({
      descripcion,
      monto,
      tipo,
      periodoId,
      creadoPor,
      comprobanteUrl,
    });

    res.status(201).json({
      exito:   true,
      mensaje: 'Gasto registrado correctamente',
      datos:   gasto,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/gastos/:id
const eliminar = async (req, res, next) => {
  try {
    const gasto = await gastosServicio.eliminar(req.params.id);
    res.json({
      exito:   true,
      mensaje: 'Gasto eliminado correctamente',
      datos:   gasto,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtenerUno, crear, eliminar };

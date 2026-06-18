// ============================================================
// gastos.controlador.js  —  multi-consorcio
// Ubicación: src/controller/gastos.controlador.js
// ============================================================

const gastosServicio = require('../service/gastos.servicio');

const listar = async (req, res, next) => {
  try {
    const { periodoId } = req.query;
    if (!periodoId) return res.status(400).json({ exito: false, mensaje: 'periodoId es obligatorio' });
    const gastos = await gastosServicio.listarPorPeriodo(periodoId, req.consorcioId);
    res.json({ exito: true, datos: gastos });
  } catch (e) { next(e); }
};

const obtenerUno = async (req, res, next) => {
  try {
    const gasto = await gastosServicio.obtenerPorId(req.params.id);
    res.json({ exito: true, datos: gasto });
  } catch (e) { next(e); }
};

const crear = async (req, res, next) => {
  try {
    const { descripcion, monto, tipo, periodoId } = req.body;
    const gasto = await gastosServicio.crear({
      descripcion, monto, tipo, periodoId,
      creadoPor:   req.usuario.id,
      consorcioId: req.consorcioId,
    });
    res.status(201).json({ exito: true, mensaje: 'Gasto registrado correctamente', datos: gasto });
  } catch (e) { next(e); }
};

const eliminar = async (req, res, next) => {
  try {
    const gasto = await gastosServicio.eliminar(req.params.id, req.consorcioId);
    res.json({ exito: true, mensaje: 'Gasto eliminado correctamente', datos: gasto });
  } catch (e) { next(e); }
};

module.exports = { listar, obtenerUno, crear, eliminar };
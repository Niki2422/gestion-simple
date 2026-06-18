// ============================================================
// expensas.controlador.js  —  multi-consorcio
// Ubicación: src/controller/expensas.controlador.js
// ============================================================

const expensaModelo        = require('../models/expensa.modelo');
const { ErrorOperacional } = require('../middlewares/manejarErrores');

const listarPorPeriodo = async (req, res, next) => {
  try {
    const { periodoId } = req.query;
    if (!periodoId) return res.status(400).json({ exito: false, mensaje: 'periodoId es obligatorio' });

    const expensas = await expensaModelo.listarPorPeriodo(periodoId);

    // Propietario/inquilino solo ven sus propias expensas
    if (req.rolEnConsorcio !== 'administrador') {
      const filtradas = expensas.filter(
        e => e.propietario_email === req.usuario.email ||
             e.inquilino_email   === req.usuario.email
      );
      return res.json({ exito: true, datos: filtradas });
    }
    res.json({ exito: true, datos: expensas });
  } catch (e) { next(e); }
};

const estadoDeudas = async (req, res, next) => {
  try {
    const deudas = await expensaModelo.estadoDeudaPorUnidad(req.consorcioId);
    res.json({ exito: true, datos: deudas });
  } catch (e) { next(e); }
};

const listarPorUnidad = async (req, res, next) => {
  try {
    const expensas = await expensaModelo.listarPorUnidad(req.params.unidadId);
    res.json({ exito: true, datos: expensas });
  } catch (e) { next(e); }
};

const obtenerUna = async (req, res, next) => {
  try {
    const expensa = await expensaModelo.buscarPorId(req.params.id);
    if (!expensa) throw new ErrorOperacional('Expensa no encontrada', 404);
    res.json({ exito: true, datos: expensa });
  } catch (e) { next(e); }
};

const marcarPagada = async (req, res, next) => {
  try {
    const expensa = await expensaModelo.buscarPorId(req.params.id);
    if (!expensa) throw new ErrorOperacional('Expensa no encontrada', 404);
    if (expensa.pagado) throw new ErrorOperacional('Esta expensa ya fue registrada como pagada', 400);
    const actualizada = await expensaModelo.marcarPagada(req.params.id);
    res.json({ exito: true, mensaje: 'Expensa marcada como pagada', datos: actualizada });
  } catch (e) { next(e); }
};

const revertirPago = async (req, res, next) => {
  try {
    const expensa = await expensaModelo.buscarPorId(req.params.id);
    if (!expensa) throw new ErrorOperacional('Expensa no encontrada', 404);
    if (!expensa.pagado) throw new ErrorOperacional('Esta expensa no está marcada como pagada', 400);
    const actualizada = await expensaModelo.marcarPendiente(req.params.id);
    res.json({ exito: true, mensaje: 'Pago revertido correctamente', datos: actualizada });
  } catch (e) { next(e); }
};

module.exports = { listarPorPeriodo, estadoDeudas, listarPorUnidad, obtenerUna, marcarPagada, revertirPago };
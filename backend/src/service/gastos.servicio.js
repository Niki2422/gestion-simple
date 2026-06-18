// ============================================================
// gastos.servicio.js  —  multi-consorcio
// Ubicación: src/service/gastos.servicio.js
// ============================================================

const gastoModelo          = require('../models/gasto.modelo');
const periodoModelo        = require('../models/periodo.modelo');
const { ErrorOperacional } = require('../middlewares/manejarErrores');

const TIPOS_VALIDOS = ['ordinario', 'extraordinario'];

const listarPorPeriodo = async (periodoId, consorcioId) => {
  const periodo = await periodoModelo.buscarPorId(periodoId, consorcioId);
  if (!periodo) throw new ErrorOperacional('Período no encontrado', 404);
  return await gastoModelo.listarPorPeriodo(periodoId);
};

const obtenerPorId = async (id) => {
  const gasto = await gastoModelo.buscarPorId(id);
  if (!gasto) throw new ErrorOperacional('Gasto no encontrado', 404);
  return gasto;
};

const crear = async ({ descripcion, monto, tipo, periodoId, creadoPor, consorcioId }) => {
  if (!descripcion?.trim()) throw new ErrorOperacional('La descripción es obligatoria', 400);

  const montoNum = parseFloat(monto);
  if (isNaN(montoNum) || montoNum <= 0)
    throw new ErrorOperacional('El monto debe ser un número mayor a cero', 400);

  if (!TIPOS_VALIDOS.includes(tipo))
    throw new ErrorOperacional('El tipo debe ser "ordinario" o "extraordinario"', 400);

  const periodo = await periodoModelo.buscarPorId(periodoId, consorcioId);
  if (!periodo) throw new ErrorOperacional('Período no encontrado', 404);
  if (periodo.cerrado)
    throw new ErrorOperacional(`El período ${periodo.periodo} ya está cerrado`, 400);

  return await gastoModelo.crear({
    descripcion: descripcion.trim(),
    monto:       montoNum,
    tipo,
    periodoId,
    creadoPor,
  });
};

const eliminar = async (id, consorcioId) => {
  const gasto = await gastoModelo.buscarPorId(id);
  if (!gasto) throw new ErrorOperacional('Gasto no encontrado', 404);

  const periodo = await periodoModelo.buscarPorId(gasto.periodo_id, consorcioId);
  if (periodo?.cerrado)
    throw new ErrorOperacional('No se pueden eliminar gastos de un período cerrado', 400);

  return await gastoModelo.eliminar(id);
};

module.exports = { listarPorPeriodo, obtenerPorId, crear, eliminar };
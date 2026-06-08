// ============================================================
// gastos.servicio.js
// Lógica de negocio para carga y consulta de gastos.
// ============================================================

const gastoModelo          = require('../models/gasto.modelo');
const periodoModelo        = require('../models/periodo.modelo');
const { ErrorOperacional } = require('../middlewares/manejarErrores');

const TIPOS_VALIDOS = ['ordinario', 'extraordinario'];

const listarPorPeriodo = async (periodoId) => {
  const periodo = await periodoModelo.buscarPorId(periodoId);
  if (!periodo) {
    throw new ErrorOperacional('Período no encontrado', 404);
  }
  return await gastoModelo.listarPorPeriodo(periodoId);
};

const obtenerPorId = async (id) => {
  const gasto = await gastoModelo.buscarPorId(id);
  if (!gasto) {
    throw new ErrorOperacional('Gasto no encontrado', 404);
  }
  return gasto;
};

const crear = async ({ descripcion, monto, tipo, periodoId, creadoPor, comprobanteUrl }) => {
  // Validaciones
  if (!descripcion || descripcion.trim() === '') {
    throw new ErrorOperacional('La descripción es obligatoria', 400);
  }

  const montoNumerico = parseFloat(monto);
  if (isNaN(montoNumerico) || montoNumerico <= 0) {
    throw new ErrorOperacional('El monto debe ser un número mayor a cero', 400);
  }

  if (!tipo || !TIPOS_VALIDOS.includes(tipo)) {
    throw new ErrorOperacional(
      `El tipo debe ser "ordinario" o "extraordinario"`,
      400
    );
  }

  const periodo = await periodoModelo.buscarPorId(periodoId);
  if (!periodo) {
    throw new ErrorOperacional('Período no encontrado', 404);
  }
  if (periodo.cerrado) {
    throw new ErrorOperacional(
      `El período ${periodo.periodo} ya está cerrado. No se pueden agregar gastos.`,
      400
    );
  }

  return await gastoModelo.crear({
    descripcion: descripcion.trim(),
    monto:       montoNumerico,
    tipo,
    periodoId,
    creadoPor,
    comprobanteUrl,
  });
};

const eliminar = async (id) => {
  // Verificar que el gasto existe
  const gasto = await gastoModelo.buscarPorId(id);
  if (!gasto) {
    throw new ErrorOperacional('Gasto no encontrado', 404);
  }

  // No permitir eliminar gastos de períodos cerrados
  const periodo = await periodoModelo.buscarPorId(gasto.periodo_id);
  if (periodo && periodo.cerrado) {
    throw new ErrorOperacional(
      `No se pueden eliminar gastos de un período ya cerrado`,
      400
    );
  }

  return await gastoModelo.eliminar(id);
};

module.exports = { listarPorPeriodo, obtenerPorId, crear, eliminar };

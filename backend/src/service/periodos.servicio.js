// ============================================================
// periodos.servicio.js
// Ubicación: src/service/periodos.servicio.js
// ============================================================
 
const periodoModelo        = require('../models/periodo.modelo');
const { consultar }        = require('../config/baseDatos');
const { ErrorOperacional } = require('../middlewares/manejarErrores');
 
const REGEX_PERIODO = /^\d{4}-(0[1-9]|1[0-2])$/;
 
const listar = async () => {
  return await periodoModelo.listarTodos();
};
 
const obtenerPorId = async (id) => {
  const periodo = await periodoModelo.buscarPorId(id);
  if (!periodo) throw new ErrorOperacional('Período no encontrado', 404);
  return periodo;
};
 
const crear = async (periodo) => {
  if (!periodo || !REGEX_PERIODO.test(periodo)) {
    throw new ErrorOperacional('El formato del período es inválido. Usá "YYYY-MM" (ej: 2025-03)', 400);
  }
  const existente = await periodoModelo.buscarPorPeriodo(periodo);
  if (existente) throw new ErrorOperacional(`El período ${periodo} ya existe`, 409);
  return await periodoModelo.crear(periodo);
};
 
const eliminar = async (id) => {
  const periodo = await periodoModelo.buscarPorId(id);
  if (!periodo) throw new ErrorOperacional('Período no encontrado', 404);
 
  // Eliminar gastos y expensas asociadas primero (FK)
  await consultar('DELETE FROM expensas_unidad WHERE periodo_id = $1', [id]);
  await consultar('DELETE FROM gastos WHERE periodo_id = $1', [id]);
 
  return await periodoModelo.eliminar(id);
};
 
module.exports = { listar, obtenerPorId, crear, eliminar };
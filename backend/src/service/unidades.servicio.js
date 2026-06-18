// ============================================================
// unidades.servicio.js  —  multi-consorcio
// Ubicación: src/service/unidades.servicio.js
// ============================================================

const unidadModelo         = require('../models/unidad.modelo');
const usuarioModelo        = require('../models/usuario.modelo');
const { ErrorOperacional } = require('../middlewares/manejarErrores');

const TIPOS_VALIDOS = ['departamento', 'cochera', 'local', 'otro'];

const listar = async (consorcioId) => unidadModelo.listarTodas(consorcioId);

const listarPorUsuario = async (usuarioId, rolEnConsorcio, consorcioId) => {
  if (rolEnConsorcio === 'propietario') {
    return unidadModelo.buscarPorPropietario(usuarioId, consorcioId);
  }
  // admin e inquilino ven todas (inquilino verá la suya en el frontend)
  return unidadModelo.listarTodas(consorcioId);
};

const obtenerPorId = async (id, consorcioId) => {
  const unidad = await unidadModelo.buscarPorId(id, consorcioId);
  if (!unidad) throw new ErrorOperacional('Unidad no encontrada', 404);
  return unidad;
};

const crear = async ({ nombre, tipo, coeficiente, propietarioId, inquilinoId, consorcioId }) => {
  if (!nombre || !tipo || coeficiente === undefined) {
    throw new ErrorOperacional('Nombre, tipo y coeficiente son requeridos', 400);
  }
  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw new ErrorOperacional(`Tipo inválido. Debe ser: ${TIPOS_VALIDOS.join(', ')}`, 400);
  }

  const coefNum = parseFloat(coeficiente);
  if (isNaN(coefNum) || coefNum <= 0 || coefNum > 100) {
    throw new ErrorOperacional('El coeficiente debe ser un número entre 0 y 100', 400);
  }

  // Validar roles en consorcio si se asignan
  if (propietarioId) {
    const mem = await usuarioModelo.obtenerMembresia(propietarioId, consorcioId);
    if (!mem) throw new ErrorOperacional('El propietario no es miembro de este consorcio', 400);
    if (!['propietario','administrador'].includes(mem.rol)) {
      throw new ErrorOperacional('El usuario asignado como propietario debe tener rol propietario', 400);
    }
  }
  if (inquilinoId) {
    const mem = await usuarioModelo.obtenerMembresia(inquilinoId, consorcioId);
    if (!mem) throw new ErrorOperacional('El inquilino no es miembro de este consorcio', 400);
    if (mem.rol !== 'inquilino') {
      throw new ErrorOperacional('El usuario asignado como inquilino debe tener rol inquilino', 400);
    }
  }

  const sumaActual = await unidadModelo.sumaCoeficientes(consorcioId);
  if (sumaActual + coefNum > 100.0001) {
    throw new ErrorOperacional(
      `La suma de coeficientes superaría 100%. Suma actual: ${sumaActual.toFixed(4)}%`,
      400
    );
  }

  return unidadModelo.crear({
    nombre: nombre.trim().toUpperCase(),
    tipo,
    coeficiente: coefNum,
    propietarioId,
    inquilinoId,
    consorcioId,
  });
};

const actualizar = async (id, datos, consorcioId) => {
  await obtenerPorId(id, consorcioId);
  const { nombre, tipo, coeficiente, propietarioId, inquilinoId } = datos;

  if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
    throw new ErrorOperacional(`Tipo inválido. Debe ser: ${TIPOS_VALIDOS.join(', ')}`, 400);
  }
  const coefNum = coeficiente ? parseFloat(coeficiente) : undefined;
  if (coefNum !== undefined && (isNaN(coefNum) || coefNum <= 0)) {
    throw new ErrorOperacional('El coeficiente debe ser mayor a 0', 400);
  }

  return unidadModelo.actualizar(id, {
    nombre: nombre?.trim().toUpperCase(),
    tipo,
    coeficiente: coefNum,
    propietarioId,
    inquilinoId,
  });
};

const desactivar = async (id, consorcioId) => {
  await obtenerPorId(id, consorcioId);
  return unidadModelo.desactivar(id, consorcioId);
};

module.exports = { listar, listarPorUsuario, obtenerPorId, crear, actualizar, desactivar };
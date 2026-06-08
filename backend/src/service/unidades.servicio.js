// ============================================================
// unidades.servicio.js
// Lógica de negocio para gestión de unidades.
// ============================================================

const unidadModelo         = require('../models/unidad.modelo');
const usuarioModelo        = require('../models/usuario.modelo');
const { ErrorOperacional } = require('../middlewares/manejarErrores');

const TIPOS_VALIDOS = ['departamento', 'cochera'];

// ── Listar todas ───────────────────────────────────────────
const listar = async () => {
  return unidadModelo.listarTodas();
};

// ── Listar por usuario (propietario o inquilino) ───────────
const listarPorUsuario = async (usuarioId, rol) => {
  if (rol === 'propietario') {
    return unidadModelo.buscarPorPropietario(usuarioId);
  }
  if (rol === 'inquilino') {
    return unidadModelo.buscarPorInquilino(usuarioId);
  }
  return unidadModelo.listarTodas();
};

// ── Obtener una por ID ─────────────────────────────────────
const obtenerPorId = async (id) => {
  const unidad = await unidadModelo.buscarPorId(id);
  if (!unidad) {
    throw new ErrorOperacional('Unidad no encontrada', 404);
  }
  return unidad;
};

// ── Crear unidad ───────────────────────────────────────────
const crear = async ({ nombre, tipo, coeficiente, propietarioId, inquilinoId }) => {

  if (!nombre || !tipo || !coeficiente) {
    throw new ErrorOperacional('Nombre, tipo y coeficiente son requeridos', 400);
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw new ErrorOperacional(`Tipo inválido. Debe ser: ${TIPOS_VALIDOS.join(' o ')}`, 400);
  }

  const coeficienteNum = parseFloat(coeficiente);
  if (isNaN(coeficienteNum) || coeficienteNum <= 0 || coeficienteNum > 100) {
    throw new ErrorOperacional('El coeficiente debe ser un número entre 0 y 100', 400);
  }

  // Verificar que propietario e inquilino existen y tienen el rol correcto
  if (propietarioId) {
    const propietario = await usuarioModelo.buscarPorId(propietarioId);
    if (!propietario) throw new ErrorOperacional('Propietario no encontrado', 404);
    if (propietario.rol !== 'propietario') {
      throw new ErrorOperacional('El usuario asignado como propietario debe tener rol propietario', 400);
    }
  }

  if (inquilinoId) {
    const inquilino = await usuarioModelo.buscarPorId(inquilinoId);
    if (!inquilino) throw new ErrorOperacional('Inquilino no encontrado', 404);
    if (inquilino.rol !== 'inquilino') {
      throw new ErrorOperacional('El usuario asignado como inquilino debe tener rol inquilino', 400);
    }
  }

  // ⚠️ Advertencia: verificamos que la suma no supere 100
  // No bloqueamos la creación, pero avisamos al administrador.
  // En un consorcio real los coeficientes se definen al inicio
  // y deben sumar exactamente 100.
  const sumaActual = await unidadModelo.sumaCoeficientes();
  if (sumaActual + coeficienteNum > 100.0001) {
    throw new ErrorOperacional(
      `La suma de coeficientes superaría 100%. Suma actual: ${sumaActual.toFixed(4)}%`,
      400
    );
  }

  return unidadModelo.crear({
    nombre:       nombre.trim().toUpperCase(),
    tipo,
    coeficiente:  coeficienteNum,
    propietarioId,
    inquilinoId,
  });
};

// ── Actualizar unidad ──────────────────────────────────────
const actualizar = async (id, datos) => {
  await obtenerPorId(id);

  const { nombre, tipo, coeficiente, propietarioId, inquilinoId } = datos;

  if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
    throw new ErrorOperacional(`Tipo inválido. Debe ser: ${TIPOS_VALIDOS.join(' o ')}`, 400);
  }

  const coeficienteNum = coeficiente ? parseFloat(coeficiente) : undefined;
  if (coeficienteNum !== undefined && (isNaN(coeficienteNum) || coeficienteNum <= 0)) {
    throw new ErrorOperacional('El coeficiente debe ser un número mayor a 0', 400);
  }

  return unidadModelo.actualizar(id, {
    nombre:       nombre?.trim().toUpperCase(),
    tipo,
    coeficiente:  coeficienteNum,
    propietarioId,
    inquilinoId,
  });
};

// ── Desactivar unidad ──────────────────────────────────────
const desactivar = async (id) => {
  await obtenerPorId(id);
  return unidadModelo.desactivar(id);
};

module.exports = { listar, listarPorUsuario, obtenerPorId, crear, actualizar, desactivar };

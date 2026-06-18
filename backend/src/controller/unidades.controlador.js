// ============================================================
// unidades.controlador.js  —  multi-consorcio
// Ubicación: src/controller/unidades.controlador.js
// ============================================================

const unidadesServicio = require('../service/unidades.servicio');

const listar = async (req, res, next) => {
  try {
    const unidades = await unidadesServicio.listarPorUsuario(
      req.usuario.id,
      req.rolEnConsorcio,
      req.consorcioId
    );
    res.json({ exito: true, datos: unidades });
  } catch (e) { next(e); }
};

const obtenerUna = async (req, res, next) => {
  try {
    const unidad = await unidadesServicio.obtenerPorId(req.params.id, req.consorcioId);
    res.json({ exito: true, datos: unidad });
  } catch (e) { next(e); }
};

const crear = async (req, res, next) => {
  try {
    const { nombre, tipo, coeficiente, propietarioId, inquilinoId } = req.body;
    const unidad = await unidadesServicio.crear({
      nombre, tipo, coeficiente, propietarioId, inquilinoId,
      consorcioId: req.consorcioId,
    });
    res.status(201).json({ exito: true, mensaje: 'Unidad creada correctamente', datos: unidad });
  } catch (e) { next(e); }
};

const actualizar = async (req, res, next) => {
  try {
    const unidad = await unidadesServicio.actualizar(req.params.id, req.body, req.consorcioId);
    res.json({ exito: true, mensaje: 'Unidad actualizada correctamente', datos: unidad });
  } catch (e) { next(e); }
};

const desactivar = async (req, res, next) => {
  try {
    const unidad = await unidadesServicio.desactivar(req.params.id, req.consorcioId);
    res.json({ exito: true, mensaje: 'Unidad desactivada correctamente', datos: unidad });
  } catch (e) { next(e); }
};

module.exports = { listar, obtenerUna, crear, actualizar, desactivar };
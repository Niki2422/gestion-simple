// ============================================================
// unidades.controlador.js
// ============================================================

const unidadesServicio = require('../service/unidades.servicio');

// GET /api/unidades
// El administrador ve todas. Propietario e inquilino ven las suyas.
const listar = async (req, res, next) => {
  try {
    const { id, rol } = req.usuario;
    const unidades = await unidadesServicio.listarPorUsuario(id, rol);
    res.json({ exito: true, datos: unidades });
  } catch (error) {
    next(error);
  }
};

// GET /api/unidades/:id
const obtenerUna = async (req, res, next) => {
  try {
    const unidad = await unidadesServicio.obtenerPorId(req.params.id);
    res.json({ exito: true, datos: unidad });
  } catch (error) {
    next(error);
  }
};

// POST /api/unidades
const crear = async (req, res, next) => {
  try {
    const { nombre, tipo, coeficiente, propietarioId, inquilinoId } = req.body;
    const unidad = await unidadesServicio.crear({
      nombre, tipo, coeficiente, propietarioId, inquilinoId
    });
    res.status(201).json({
      exito:   true,
      mensaje: 'Unidad creada correctamente',
      datos:   unidad,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/unidades/:id
const actualizar = async (req, res, next) => {
  try {
    const unidad = await unidadesServicio.actualizar(req.params.id, req.body);
    res.json({
      exito:   true,
      mensaje: 'Unidad actualizada correctamente',
      datos:   unidad,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/unidades/:id
const desactivar = async (req, res, next) => {
  try {
    const unidad = await unidadesServicio.desactivar(req.params.id);
    res.json({
      exito:   true,
      mensaje: 'Unidad desactivada correctamente',
      datos:   unidad,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtenerUna, crear, actualizar, desactivar };

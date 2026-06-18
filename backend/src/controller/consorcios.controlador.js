// ============================================================
// consorcios.controlador.js
// Ubicación: src/controller/consorcios.controlador.js
// ============================================================

const ConsorcioModelo  = require('../models/consorcio.modelo');
const UsuarioModelo    = require('../models/usuario.modelo');
const { ErrorOperacional } = require('../middlewares/manejarErrores');

// GET /api/consorcios
// Devuelve los consorcios del usuario logueado:
//   - admin plataforma: los que creó
//   - usuario: los que integra como miembro
const listar = async (req, res, next) => {
  try {
    let lista;
    if (req.usuario.rol_plataforma === 'administrador') {
      lista = await ConsorcioModelo.listarDeAdmin(req.usuario.id);
    } else {
      lista = await ConsorcioModelo.listarDeMiembro(req.usuario.id);
    }
    res.json({ exito: true, datos: lista });
  } catch (e) { next(e); }
};

// GET /api/consorcios/:cid
const obtener = async (req, res, next) => {
  try {
    const consorcio = await ConsorcioModelo.buscarPorId(req.consorcioId);
    res.json({ exito: true, datos: { ...consorcio, mi_rol: req.rolEnConsorcio } });
  } catch (e) { next(e); }
};

// POST /api/consorcios  (solo admin plataforma)
const crear = async (req, res, next) => {
  try {
    const { nombre, direccion } = req.body;
    if (!nombre?.trim())    throw new ErrorOperacional('El nombre es requerido', 400);
    if (!direccion?.trim()) throw new ErrorOperacional('La dirección es requerida', 400);

    const nuevo = await ConsorcioModelo.crear({
      nombre:    nombre.trim(),
      direccion: direccion.trim(),
      creadoPor: req.usuario.id,
    });

    // El creador queda automáticamente como administrador del consorcio
    await UsuarioModelo.agregarAConsorcio(req.usuario.id, nuevo.id, 'administrador');

    res.status(201).json({ exito: true, datos: nuevo });
  } catch (e) { next(e); }
};

// PATCH /api/consorcios/:cid  (solo admin consorcio)
const actualizar = async (req, res, next) => {
  try {
    const { nombre, direccion } = req.body;
    const actualizado = await ConsorcioModelo.actualizar(req.consorcioId, {
      nombre:    nombre?.trim(),
      direccion: direccion?.trim(),
    });
    res.json({ exito: true, datos: actualizado });
  } catch (e) { next(e); }
};

module.exports = { listar, obtener, crear, actualizar };
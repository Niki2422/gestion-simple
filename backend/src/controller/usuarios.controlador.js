// ============================================================
// usuarios.controlador.js
// Ubicación: src/controller/usuarios.controlador.js
// ============================================================

const usuariosServicio = require('../service/usuarios.servicio');

const listar = async (req, res, next) => {
  try {
    const usuarios = await usuariosServicio.listar();
    res.json({ exito: true, datos: usuarios });
  } catch (error) { next(error); }
};

const obtenerUno = async (req, res, next) => {
  try {
    const usuario = await usuariosServicio.obtenerPorId(req.params.id);
    res.json({ exito: true, datos: usuario });
  } catch (error) { next(error); }
};

const crear = async (req, res, next) => {
  try {
    const { nombre, email, contrasena, rol } = req.body;
    const usuario = await usuariosServicio.crear({ nombre, email, contrasena, rol });
    res.status(201).json({ exito: true, mensaje: 'Usuario creado correctamente', datos: usuario });
  } catch (error) { next(error); }
};

const actualizar = async (req, res, next) => {
  try {
    const { nombre, email, rol } = req.body;
    const usuario = await usuariosServicio.actualizar(req.params.id, { nombre, email, rol });
    res.json({ exito: true, mensaje: 'Usuario actualizado correctamente', datos: usuario });
  } catch (error) { next(error); }
};

const desactivar = async (req, res, next) => {
  try {
    const usuario = await usuariosServicio.desactivar(req.params.id, req.usuario.id);
    res.json({ exito: true, mensaje: 'Usuario desactivado correctamente', datos: usuario });
  } catch (error) { next(error); }
};

// PATCH /api/usuarios/mi-contrasena — cualquier usuario autenticado
const cambiarContrasena = async (req, res, next) => {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;
    await usuariosServicio.cambiarContrasena(req.usuario.id, { contrasenaActual, contrasenaNueva });
    res.json({ exito: true, mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) { next(error); }
};

module.exports = { listar, obtenerUno, crear, actualizar, desactivar, cambiarContrasena };
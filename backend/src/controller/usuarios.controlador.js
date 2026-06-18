// ============================================================
// usuarios.controlador.js  —  multi-consorcio
// Ubicación: src/controller/usuarios.controlador.js
// ============================================================

const UsuarioModelo        = require('../models/usuario.modelo');
const bcrypt               = require('bcryptjs');
const { ErrorOperacional } = require('../middlewares/manejarErrores');

// GET /api/consorcios/:cid/usuarios
const listar = async (req, res, next) => {
  try {
    const usuarios = await UsuarioModelo.listarPorConsorcio(req.consorcioId);
    res.json({ exito: true, datos: usuarios });
  } catch (e) { next(e); }
};

// POST /api/consorcios/:cid/usuarios
// Crea el usuario en la plataforma y lo agrega al consorcio con el rol dado
const crear = async (req, res, next) => {
  try {
    const { nombre, email, contrasena, rol } = req.body;

    if (!nombre?.trim()) throw new ErrorOperacional('El nombre es requerido', 400);
    if (!email?.trim())  throw new ErrorOperacional('El email es requerido', 400);
    if (!contrasena || contrasena.length < 6)
      throw new ErrorOperacional('La contraseña debe tener al menos 6 caracteres', 400);
    if (!['propietario','inquilino','administrador'].includes(rol))
      throw new ErrorOperacional('El rol debe ser propietario, inquilino o administrador', 400);

    // Verificar si ya existe en la plataforma
    const existente = await UsuarioModelo.buscarPorEmail(email.trim().toLowerCase());

    let usuario;
    if (existente) {
      // Ya existe → solo agregar al consorcio
      usuario = existente;
    } else {
      // Crear en la plataforma
      const hash = await bcrypt.hash(contrasena, 10);
      usuario = await UsuarioModelo.crear({
        nombre:       nombre.trim(),
        email:        email.trim().toLowerCase(),
        contrasenaHash: hash,
      });
    }

    // Agregar al consorcio con el rol indicado
    await UsuarioModelo.agregarAConsorcio(usuario.id, req.consorcioId, rol);

    const { contrasena_hash, ...seguro } = usuario;
    res.status(201).json({
      exito: true,
      datos: { ...seguro, rol_consorcio: rol },
    });
  } catch (e) { next(e); }
};

// PATCH /api/consorcios/:cid/usuarios/:uid/rol
const actualizarRol = async (req, res, next) => {
  try {
    const { rol } = req.body;
    if (!['propietario','inquilino','administrador'].includes(rol))
      throw new ErrorOperacional('Rol inválido', 400);

    const actualizado = await UsuarioModelo.actualizarRolEnConsorcio(
      req.params.uid, req.consorcioId, rol
    );
    if (!actualizado) throw new ErrorOperacional('Membresía no encontrada', 404);
    res.json({ exito: true, datos: actualizado });
  } catch (e) { next(e); }
};

// DELETE /api/consorcios/:cid/usuarios/:uid
const quitar = async (req, res, next) => {
  try {
    const quitado = await UsuarioModelo.quitarDeConsorcio(req.params.uid, req.consorcioId);
    if (!quitado) throw new ErrorOperacional('Membresía no encontrada', 404);
    res.json({ exito: true, mensaje: 'Usuario removido del consorcio' });
  } catch (e) { next(e); }
};

// PATCH /api/usuarios/mi-contrasena  (usuario sobre sí mismo)
const cambiarContrasena = async (req, res, next) => {
  try {
    const { contrasenaActual, contrasenaNueva } = req.body;
    if (!contrasenaActual || !contrasenaNueva)
      throw new ErrorOperacional('Ambas contraseñas son requeridas', 400);
    if (contrasenaNueva.length < 6)
      throw new ErrorOperacional('La nueva contraseña debe tener al menos 6 caracteres', 400);

    const usuario = await UsuarioModelo.buscarPorEmail(req.usuario.email);
    const ok = await bcrypt.compare(contrasenaActual, usuario.contrasena_hash);
    if (!ok) throw new ErrorOperacional('La contraseña actual es incorrecta', 400);

    const hash = await bcrypt.hash(contrasenaNueva, 10);
    await UsuarioModelo.actualizarContrasena(req.usuario.id, hash);
    res.json({ exito: true, mensaje: 'Contraseña actualizada correctamente' });
  } catch (e) { next(e); }
};

module.exports = { listar, crear, actualizarRol, quitar, cambiarContrasena };
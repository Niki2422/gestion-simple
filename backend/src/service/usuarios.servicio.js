// ============================================================
// usuarios.servicio.js
// Ubicación: src/service/usuarios.servicio.js
// ============================================================

const usuarioModelo              = require('../models/usuario.modelo');
const { hashearContrasena }      = require('./autenticacion.servicio');
const bcrypt                     = require('bcryptjs');
const { ErrorOperacional }       = require('../middlewares/manejarErrores');

const ROLES_VALIDOS = ['administrador', 'propietario', 'inquilino'];

const listar = async () => usuarioModelo.listarTodos();

const obtenerPorId = async (id) => {
  const usuario = await usuarioModelo.buscarPorId(id);
  if (!usuario) throw new ErrorOperacional('Usuario no encontrado', 404);
  return usuario;
};

const crear = async ({ nombre, email, contrasena, rol }) => {
  if (!nombre || !email || !contrasena || !rol)
    throw new ErrorOperacional('Todos los campos son requeridos', 400);
  if (!ROLES_VALIDOS.includes(rol))
    throw new ErrorOperacional(`Rol inválido. Debe ser: ${ROLES_VALIDOS.join(', ')}`, 400);
  if (contrasena.length < 6)
    throw new ErrorOperacional('La contraseña debe tener al menos 6 caracteres', 400);
  const usuarioExistente = await usuarioModelo.buscarPorEmail(email);
  if (usuarioExistente)
    throw new ErrorOperacional('Ya existe un usuario con ese email', 409);
  const contrasenaHash = await hashearContrasena(contrasena);
  return usuarioModelo.crear({ nombre: nombre.trim(), email: email.toLowerCase().trim(), contrasenaHash, rol });
};

const actualizar = async (id, { nombre, email, rol }) => {
  await obtenerPorId(id);
  if (rol && !ROLES_VALIDOS.includes(rol))
    throw new ErrorOperacional(`Rol inválido. Debe ser: ${ROLES_VALIDOS.join(', ')}`, 400);
  if (email) {
    const usuarioConEseEmail = await usuarioModelo.buscarPorEmail(email);
    if (usuarioConEseEmail && usuarioConEseEmail.id !== id)
      throw new ErrorOperacional('Ya existe un usuario con ese email', 409);
  }
  return usuarioModelo.actualizar(id, { nombre: nombre?.trim(), email: email?.toLowerCase().trim(), rol });
};

const desactivar = async (id, idAdminActual) => {
  if (id === idAdminActual)
    throw new ErrorOperacional('No podés desactivar tu propio usuario', 400);
  await obtenerPorId(id);
  return usuarioModelo.desactivar(id);
};

const cambiarContrasena = async (id, { contrasenaActual, contrasenaNueva }) => {
  if (!contrasenaActual || !contrasenaNueva)
    throw new ErrorOperacional('Ambas contraseñas son requeridas', 400);
  if (contrasenaNueva.length < 6)
    throw new ErrorOperacional('La nueva contraseña debe tener al menos 6 caracteres', 400);

  // Buscar usuario con hash (buscarPorId no lo devuelve, usamos buscarPorEmail)
  const usuarioParcial = await obtenerPorId(id);
  const usuarioCompleto = await usuarioModelo.buscarPorEmail(usuarioParcial.email);

  const contrasenaCorrecta = await bcrypt.compare(contrasenaActual, usuarioCompleto.contrasena_hash);
  if (!contrasenaCorrecta)
    throw new ErrorOperacional('La contraseña actual es incorrecta', 401);

  const nuevoHash = await hashearContrasena(contrasenaNueva);
  await usuarioModelo.actualizarContrasena(id, nuevoHash);
};

module.exports = { listar, obtenerPorId, crear, actualizar, desactivar, cambiarContrasena };
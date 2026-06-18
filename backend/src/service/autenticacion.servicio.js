// ============================================================
// autenticacion.servicio.js  —  multi-consorcio
// Ubicación: src/service/autenticacion.servicio.js
// ============================================================

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const usuarioModelo        = require('../models/usuario.modelo');
const { ErrorOperacional } = require('../middlewares/manejarErrores');

const login = async (email, contrasena) => {
  const usuario = await usuarioModelo.buscarPorEmail(email);
  if (!usuario) throw new ErrorOperacional('Credenciales inválidas', 401);

  const ok = await bcrypt.compare(contrasena, usuario.contrasena_hash);
  if (!ok) throw new ErrorOperacional('Credenciales inválidas', 401);

  // Obtener los consorcios a los que pertenece
  const consorcios = await usuarioModelo.obtenerConsorcios(usuario.id);

  const payload = {
    id:             usuario.id,
    nombre:         usuario.nombre,
    email:          usuario.email,
    rol:            usuario.rol_plataforma,   // alias legacy
    rol_plataforma: usuario.rol_plataforma,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRETO, {
    expiresIn: process.env.JWT_EXPIRACION || '8h',
  });

  return {
    token,
    usuario: {
      id:             usuario.id,
      nombre:         usuario.nombre,
      email:          usuario.email,
      rol_plataforma: usuario.rol_plataforma,
      consorcios,     // el frontend decide a cuál entrar
    },
  };
};

const hashearContrasena = async (contrasena) => bcrypt.hash(contrasena, 10);

module.exports = { login, hashearContrasena };
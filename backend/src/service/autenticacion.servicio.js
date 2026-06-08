// ============================================================
// autenticacion.servicio.js
// Responsabilidad: lógica de negocio del login.
// El controlador llama a este servicio, no toca la DB directo.
// ============================================================

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

const usuarioModelo          = require('../models/usuario.modelo');
const { ErrorOperacional }   = require('../middlewares/manejarErrores');

// ── Login ──────────────────────────────────────────────────
const login = async (email, contrasena) => {

  // 1. Buscar el usuario por email
  const usuario = await usuarioModelo.buscarPorEmail(email);
  if (!usuario) {
    // Misma respuesta para email y contraseña incorrectos.
    // No dar pistas sobre qué campo falló (seguridad básica).
    throw new ErrorOperacional('Credenciales inválidas', 401);
  }

  // 2. Verificar contraseña con bcrypt
  const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.contrasena_hash);
  if (!contrasenaCorrecta) {
    throw new ErrorOperacional('Credenciales inválidas', 401);
  }

  // 3. Generar JWT con datos mínimos necesarios
  // No incluir datos sensibles en el token (contraseña, etc.)
  const payload = {
    id:     usuario.id,
    nombre: usuario.nombre,
    email:  usuario.email,
    rol:    usuario.rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRETO, {
    expiresIn: process.env.JWT_EXPIRACION || '8h',
  });

  // 4. Devolver token y datos del usuario (sin la contraseña)
  return {
    token,
    usuario: {
      id:     usuario.id,
      nombre: usuario.nombre,
      email:  usuario.email,
      rol:    usuario.rol,
    },
  };
};

// ── Hashear contraseña ─────────────────────────────────────
// Función utilitaria usada también al crear usuarios
const hashearContrasena = async (contrasena) => {
  const COSTO_BCRYPT = 10; // A mayor costo, más seguro pero más lento
  return bcrypt.hash(contrasena, COSTO_BCRYPT);
};

module.exports = { login, hashearContrasena };

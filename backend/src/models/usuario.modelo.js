// ============================================================
// usuario.modelo.js
// Responsabilidad: consultas SQL relacionadas a usuarios.
// No contiene lógica de negocio, solo acceso a datos.
// ============================================================

const { consultar } = require('../config/baseDatos');

// Buscar un usuario por email (usado en el login)
const buscarPorEmail = async (email) => {
  const resultado = await consultar(
    'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
    [email]
  );
  return resultado.rows[0] || null;
};

// Buscar un usuario por ID (usado en autenticar.js para refrescar datos)
const buscarPorId = async (id) => {
  const resultado = await consultar(
    `SELECT id, nombre, email, rol, activo, creado_en
     FROM usuarios WHERE id = $1 AND activo = true`,
    [id]
  );
  return resultado.rows[0] || null;
};

// Listar todos los usuarios (solo administrador)
const listarTodos = async () => {
  const resultado = await consultar(
    `SELECT id, nombre, email, rol, activo, creado_en
     FROM usuarios ORDER BY creado_en DESC`
  );
  return resultado.rows;
};

// Crear un usuario nuevo (el administrador crea todos los usuarios)
const crear = async ({ nombre, email, contrasenaHash, rol }) => {
  const resultado = await consultar(
    `INSERT INTO usuarios (nombre, email, contrasena_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, email, rol, activo, creado_en`,
    [nombre, email, contrasenaHash, rol]
  );
  return resultado.rows[0];
};

// Actualizar datos básicos de un usuario
const actualizar = async (id, { nombre, email, rol }) => {
  const resultado = await consultar(
    `UPDATE usuarios SET nombre = $1, email = $2, rol = $3
     WHERE id = $4
     RETURNING id, nombre, email, rol, activo`,
    [nombre, email, rol, id]
  );
  return resultado.rows[0] || null;
};

// Actualizar contraseña
const actualizarContrasena = async (id, contrasenaHash) => {
  await consultar(
    'UPDATE usuarios SET contrasena_hash = $1 WHERE id = $2',
    [contrasenaHash, id]
  );
};

// Desactivar usuario (soft delete)
const desactivar = async (id) => {
  const resultado = await consultar(
    `UPDATE usuarios SET activo = false
     WHERE id = $1
     RETURNING id, nombre, email, activo`,
    [id]
  );
  return resultado.rows[0] || null;
};

module.exports = {
  buscarPorEmail,
  buscarPorId,
  listarTodos,
  crear,
  actualizar,
  actualizarContrasena,
  desactivar,
};

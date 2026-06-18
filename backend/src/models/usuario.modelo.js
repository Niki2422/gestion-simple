// ============================================================
// usuario.modelo.js  —  multi-consorcio
// Ubicación: src/models/usuario.modelo.js
// ============================================================

const { consultar } = require('../config/baseDatos');

// Buscar por email (login) — devuelve rol_plataforma
const buscarPorEmail = async (email) => {
  const r = await consultar(
    'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
    [email]
  );
  return r.rows[0] || null;
};

// Buscar por ID — sin hash
const buscarPorId = async (id) => {
  const r = await consultar(
    `SELECT id, nombre, email, rol_plataforma, activo, creado_en
     FROM usuarios WHERE id = $1 AND activo = true`,
    [id]
  );
  return r.rows[0] || null;
};

// Listar todos los usuarios de un consorcio específico
const listarPorConsorcio = async (consorcioId) => {
  const r = await consultar(
    `SELECT u.id, u.nombre, u.email, u.rol_plataforma, u.activo, u.creado_en,
            cu.rol AS rol_consorcio, cu.id AS membresia_id
     FROM usuarios u
     JOIN consorcio_usuarios cu ON cu.usuario_id = u.id
     WHERE cu.consorcio_id = $1 AND cu.activo = true
     ORDER BY cu.rol, u.nombre`,
    [consorcioId]
  );
  return r.rows;
};

// Crear usuario nuevo en la plataforma
const crear = async ({ nombre, email, contrasenaHash }) => {
  const r = await consultar(
    `INSERT INTO usuarios (nombre, email, contrasena_hash, rol_plataforma)
     VALUES ($1, $2, $3, 'usuario')
     RETURNING id, nombre, email, rol_plataforma, activo, creado_en`,
    [nombre, email, contrasenaHash]
  );
  return r.rows[0];
};

// Agregar usuario a un consorcio con un rol específico
const agregarAConsorcio = async (usuarioId, consorcioId, rol) => {
  const r = await consultar(
    `INSERT INTO consorcio_usuarios (consorcio_id, usuario_id, rol)
     VALUES ($1, $2, $3)
     ON CONFLICT (consorcio_id, usuario_id)
       DO UPDATE SET rol = EXCLUDED.rol, activo = true
     RETURNING *`,
    [consorcioId, usuarioId, rol]
  );
  return r.rows[0];
};

// Actualizar datos básicos
const actualizar = async (id, { nombre, email }) => {
  const r = await consultar(
    `UPDATE usuarios SET nombre = $1, email = $2
     WHERE id = $3
     RETURNING id, nombre, email, rol_plataforma, activo`,
    [nombre, email, id]
  );
  return r.rows[0] || null;
};

// Actualizar rol dentro de un consorcio
const actualizarRolEnConsorcio = async (usuarioId, consorcioId, rol) => {
  const r = await consultar(
    `UPDATE consorcio_usuarios SET rol = $1
     WHERE usuario_id = $2 AND consorcio_id = $3
     RETURNING *`,
    [rol, usuarioId, consorcioId]
  );
  return r.rows[0] || null;
};

// Actualizar contraseña
const actualizarContrasena = async (id, contrasenaHash) => {
  await consultar(
    'UPDATE usuarios SET contrasena_hash = $1 WHERE id = $2',
    [contrasenaHash, id]
  );
};

// Quitar usuario de un consorcio (soft delete de membresía)
const quitarDeConsorcio = async (usuarioId, consorcioId) => {
  const r = await consultar(
    `UPDATE consorcio_usuarios SET activo = false
     WHERE usuario_id = $1 AND consorcio_id = $2
     RETURNING *`,
    [usuarioId, consorcioId]
  );
  return r.rows[0] || null;
};

// Obtener membresía de un usuario en un consorcio
const obtenerMembresia = async (usuarioId, consorcioId) => {
  const r = await consultar(
    `SELECT cu.*, u.nombre, u.email
     FROM consorcio_usuarios cu
     JOIN usuarios u ON u.id = cu.usuario_id
     WHERE cu.usuario_id = $1 AND cu.consorcio_id = $2 AND cu.activo = true`,
    [usuarioId, consorcioId]
  );
  return r.rows[0] || null;
};

// Consorcios a los que pertenece un usuario
const obtenerConsorcios = async (usuarioId) => {
  const r = await consultar(
    `SELECT c.*, cu.rol AS mi_rol
     FROM consorcios c
     JOIN consorcio_usuarios cu ON cu.consorcio_id = c.id
     WHERE cu.usuario_id = $1 AND cu.activo = true AND c.activo = true
     ORDER BY c.nombre`,
    [usuarioId]
  );
  return r.rows;
};

module.exports = {
  buscarPorEmail,
  buscarPorId,
  listarPorConsorcio,
  crear,
  agregarAConsorcio,
  actualizar,
  actualizarRolEnConsorcio,
  actualizarContrasena,
  quitarDeConsorcio,
  obtenerMembresia,
  obtenerConsorcios,
};
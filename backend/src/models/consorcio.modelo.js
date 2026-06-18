// ============================================================
// consorcio.modelo.js
// Ubicación: src/models/consorcio.modelo.js
// ============================================================

const { consultar } = require('../config/baseDatos');

// Listar consorcios donde el usuario es administrador
const listarDeAdmin = async (usuarioId) => {
  const r = await consultar(
    `SELECT c.*,
            COUNT(DISTINCT cu.id)::int AS total_miembros,
            COUNT(DISTINCT u.id)::int  AS total_unidades
     FROM consorcios c
     LEFT JOIN consorcio_usuarios cu ON cu.consorcio_id = c.id AND cu.activo = true
     LEFT JOIN unidades u ON u.consorcio_id = c.id AND u.activa = true
     WHERE c.creado_por = $1 AND c.activo = true
     GROUP BY c.id
     ORDER BY c.creado_en DESC`,
    [usuarioId]
  );
  return r.rows;
};

// Listar consorcios donde el usuario es miembro (propietario/inquilino)
const listarDeMiembro = async (usuarioId) => {
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

const buscarPorId = async (id) => {
  const r = await consultar(
    `SELECT c.*,
            u.nombre AS admin_nombre,
            u.email  AS admin_email
     FROM consorcios c
     JOIN usuarios u ON u.id = c.creado_por
     WHERE c.id = $1 AND c.activo = true`,
    [id]
  );
  return r.rows[0] || null;
};

const crear = async ({ nombre, direccion, creadoPor }) => {
  const r = await consultar(
    `INSERT INTO consorcios (nombre, direccion, creado_por)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [nombre, direccion, creadoPor]
  );
  return r.rows[0];
};

const actualizar = async (id, { nombre, direccion }) => {
  const r = await consultar(
    `UPDATE consorcios SET nombre = $1, direccion = $2
     WHERE id = $3
     RETURNING *`,
    [nombre, direccion, id]
  );
  return r.rows[0] || null;
};

// Verificar si un usuario es admin de un consorcio
const esAdmin = async (consorcioId, usuarioId) => {
  const r = await consultar(
    `SELECT 1 FROM consorcios
     WHERE id = $1 AND creado_por = $2 AND activo = true`,
    [consorcioId, usuarioId]
  );
  return r.rows.length > 0;
};

// Verificar si un usuario tiene acceso a un consorcio (cualquier rol)
const tieneAcceso = async (consorcioId, usuarioId) => {
  // Es admin creador
  const esCreador = await esAdmin(consorcioId, usuarioId);
  if (esCreador) return { acceso: true, rol: 'administrador' };

  // Es miembro
  const r = await consultar(
    `SELECT rol FROM consorcio_usuarios
     WHERE consorcio_id = $1 AND usuario_id = $2 AND activo = true`,
    [consorcioId, usuarioId]
  );
  if (r.rows.length > 0) return { acceso: true, rol: r.rows[0].rol };

  return { acceso: false, rol: null };
};

module.exports = {
  listarDeAdmin,
  listarDeMiembro,
  buscarPorId,
  crear,
  actualizar,
  esAdmin,
  tieneAcceso,
};
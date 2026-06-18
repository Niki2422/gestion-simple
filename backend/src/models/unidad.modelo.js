// ============================================================
// unidad.modelo.js  —  multi-consorcio
// Ubicación: src/models/unidad.modelo.js
// ============================================================

const { consultar } = require('../config/baseDatos');

const listarTodas = async (consorcioId) => {
  const r = await consultar(`
    SELECT
      u.id, u.nombre, u.tipo, u.coeficiente, u.activa, u.creado_en,
      p.id     AS propietario_id,    p.nombre AS propietario_nombre,    p.email AS propietario_email,
      i.id     AS inquilino_id,      i.nombre AS inquilino_nombre,      i.email AS inquilino_email
    FROM unidades u
    LEFT JOIN usuarios p ON u.propietario_id = p.id
    LEFT JOIN usuarios i ON u.inquilino_id   = i.id
    WHERE u.consorcio_id = $1
    ORDER BY u.nombre ASC
  `, [consorcioId]);
  return r.rows;
};

const buscarPorId = async (id, consorcioId) => {
  const r = await consultar(`
    SELECT
      u.id, u.nombre, u.tipo, u.coeficiente, u.activa, u.creado_en,
      p.id AS propietario_id, p.nombre AS propietario_nombre, p.email AS propietario_email,
      i.id AS inquilino_id,   i.nombre AS inquilino_nombre,   i.email AS inquilino_email
    FROM unidades u
    LEFT JOIN usuarios p ON u.propietario_id = p.id
    LEFT JOIN usuarios i ON u.inquilino_id   = i.id
    WHERE u.id = $1 AND u.consorcio_id = $2
  `, [id, consorcioId]);
  return r.rows[0] || null;
};

const buscarPorPropietario = async (propietarioId, consorcioId) => {
  const r = await consultar(`
    SELECT u.*, i.nombre AS inquilino_nombre, i.email AS inquilino_email
    FROM unidades u
    LEFT JOIN usuarios i ON u.inquilino_id = i.id
    WHERE u.propietario_id = $1 AND u.consorcio_id = $2 AND u.activa = true
    ORDER BY u.nombre ASC
  `, [propietarioId, consorcioId]);
  return r.rows;
};

const sumaCoeficientes = async (consorcioId) => {
  const r = await consultar(
    'SELECT COALESCE(SUM(coeficiente), 0) AS total FROM unidades WHERE consorcio_id = $1 AND activa = true',
    [consorcioId]
  );
  return parseFloat(r.rows[0].total);
};

const crear = async ({ nombre, tipo, coeficiente, propietarioId, inquilinoId, consorcioId }) => {
  const r = await consultar(`
    INSERT INTO unidades (nombre, tipo, coeficiente, propietario_id, inquilino_id, consorcio_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [nombre, tipo, coeficiente, propietarioId || null, inquilinoId || null, consorcioId]);
  return r.rows[0];
};

const actualizar = async (id, { nombre, tipo, coeficiente, propietarioId, inquilinoId }) => {
  const r = await consultar(`
    UPDATE unidades
    SET nombre = $1, tipo = $2, coeficiente = $3,
        propietario_id = $4, inquilino_id = $5
    WHERE id = $6
    RETURNING *
  `, [nombre, tipo, coeficiente, propietarioId || null, inquilinoId || null, id]);
  return r.rows[0] || null;
};

const desactivar = async (id, consorcioId) => {
  const r = await consultar(
    'UPDATE unidades SET activa = false WHERE id = $1 AND consorcio_id = $2 RETURNING id, nombre, activa',
    [id, consorcioId]
  );
  return r.rows[0] || null;
};

module.exports = {
  listarTodas,
  buscarPorId,
  buscarPorPropietario,
  sumaCoeficientes,
  crear,
  actualizar,
  desactivar,
};
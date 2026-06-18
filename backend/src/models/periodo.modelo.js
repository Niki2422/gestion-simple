// ============================================================
// periodo.modelo.js  —  multi-consorcio
// Ubicación: src/models/periodo.modelo.js
// ============================================================

const { consultar } = require('../config/baseDatos');

const listarTodos = async (consorcioId) => {
  const r = await consultar(
    `SELECT * FROM periodos WHERE consorcio_id = $1 ORDER BY periodo DESC`,
    [consorcioId]
  );
  return r.rows;
};

const buscarPorId = async (id, consorcioId) => {
  const r = await consultar(
    `SELECT * FROM periodos WHERE id = $1 AND consorcio_id = $2`,
    [id, consorcioId]
  );
  return r.rows[0] || null;
};

const buscarPorPeriodo = async (periodo, consorcioId) => {
  const r = await consultar(
    `SELECT * FROM periodos WHERE periodo = $1 AND consorcio_id = $2`,
    [periodo, consorcioId]
  );
  return r.rows[0] || null;
};

const crear = async (periodo, consorcioId) => {
  const r = await consultar(
    `INSERT INTO periodos (periodo, consorcio_id) VALUES ($1, $2) RETURNING *`,
    [periodo, consorcioId]
  );
  return r.rows[0];
};

const cerrar = async (id, { totalOrdinario, totalExtraordinario }) => {
  const r = await consultar(
    `UPDATE periodos
     SET cerrado = true, cerrado_en = NOW(),
         total_ordinario = $1, total_extraordinario = $2
     WHERE id = $3 RETURNING *`,
    [totalOrdinario, totalExtraordinario, id]
  );
  return r.rows[0];
};

const eliminar = async (id, consorcioId) => {
  const r = await consultar(
    `DELETE FROM periodos WHERE id = $1 AND consorcio_id = $2 RETURNING id, periodo`,
    [id, consorcioId]
  );
  return r.rows[0] || null;
};

module.exports = { listarTodos, buscarPorId, buscarPorPeriodo, crear, cerrar, eliminar };
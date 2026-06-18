// ============================================================
// gasto.modelo.js  —  multi-consorcio
// Ubicación: src/models/gasto.modelo.js
// ============================================================

const { consultar } = require('../config/baseDatos');

const listarPorPeriodo = async (periodoId) => {
  const r = await consultar(
    `SELECT g.id, g.descripcion, g.monto, g.tipo, g.fecha, g.creado_en
     FROM gastos g
     WHERE g.periodo_id = $1
     ORDER BY g.creado_en DESC`,
    [periodoId]
  );
  return r.rows;
};

const buscarPorId = async (id) => {
  const r = await consultar('SELECT * FROM gastos WHERE id = $1', [id]);
  return r.rows[0] || null;
};

const crear = async ({ descripcion, monto, tipo, periodoId, creadoPor }) => {
  const r = await consultar(
    `INSERT INTO gastos (descripcion, monto, tipo, periodo_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [descripcion, monto, tipo, periodoId]
  );
  return r.rows[0];
};

const eliminar = async (id) => {
  const r = await consultar(
    'DELETE FROM gastos WHERE id = $1 RETURNING id, descripcion, monto',
    [id]
  );
  return r.rows[0] || null;
};

const sumarPorTipo = async (periodoId) => {
  const r = await consultar(
    `SELECT
       COALESCE(SUM(CASE WHEN tipo = 'ordinario'      THEN monto ELSE 0 END), 0) AS total_ordinario,
       COALESCE(SUM(CASE WHEN tipo = 'extraordinario' THEN monto ELSE 0 END), 0) AS total_extraordinario
     FROM gastos WHERE periodo_id = $1`,
    [periodoId]
  );
  return r.rows[0];
};

module.exports = { listarPorPeriodo, buscarPorId, crear, eliminar, sumarPorTipo };
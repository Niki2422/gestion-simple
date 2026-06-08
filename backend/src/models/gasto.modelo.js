// ============================================================
// gasto.modelo.js
// Consultas SQL para gastos.
// ============================================================

const { consultar } = require('../config/baseDatos');

const listarPorPeriodo = async (periodoId) => {
  const resultado = await consultar(
    `SELECT
       g.id, g.descripcion, g.monto, g.tipo,
       g.comprobante_url, g.creado_en,
       u.nombre AS creado_por_nombre
     FROM gastos g
     JOIN usuarios u ON g.creado_por = u.id
     WHERE g.periodo_id = $1
     ORDER BY g.creado_en DESC`,
    [periodoId]
  );
  return resultado.rows;
};

const listarPorPeriodoYTipo = async (periodoId, tipo) => {
  const resultado = await consultar(
    `SELECT
       g.id, g.descripcion, g.monto, g.tipo,
       g.comprobante_url, g.creado_en,
       u.nombre AS creado_por_nombre
     FROM gastos g
     JOIN usuarios u ON g.creado_por = u.id
     WHERE g.periodo_id = $1 AND g.tipo = $2
     ORDER BY g.creado_en DESC`,
    [periodoId, tipo]
  );
  return resultado.rows;
};

const buscarPorId = async (id) => {
  const resultado = await consultar(
    'SELECT * FROM gastos WHERE id = $1',
    [id]
  );
  return resultado.rows[0] || null;
};

const crear = async ({ descripcion, monto, tipo, periodoId, creadoPor, comprobanteUrl }) => {
  const resultado = await consultar(
    `INSERT INTO gastos (descripcion, monto, tipo, periodo_id, creado_por, comprobante_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [descripcion, monto, tipo, periodoId, creadoPor, comprobanteUrl || null]
  );
  return resultado.rows[0];
};

const eliminar = async (id) => {
  const resultado = await consultar(
    'DELETE FROM gastos WHERE id = $1 RETURNING id, descripcion, monto',
    [id]
  );
  return resultado.rows[0] || null;
};

const sumarPorTipo = async (periodoId) => {
  const resultado = await consultar(
    `SELECT
       COALESCE(SUM(CASE WHEN tipo = 'ordinario'      THEN monto ELSE 0 END), 0) AS total_ordinario,
       COALESCE(SUM(CASE WHEN tipo = 'extraordinario' THEN monto ELSE 0 END), 0) AS total_extraordinario
     FROM gastos
     WHERE periodo_id = $1`,
    [periodoId]
  );
  return resultado.rows[0];
};

module.exports = {
  listarPorPeriodo,
  listarPorPeriodoYTipo,
  buscarPorId,
  crear,
  eliminar,
  sumarPorTipo,
};
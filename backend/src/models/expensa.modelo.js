// ============================================================
// expensa.modelo.js
// Ubicación: src/models/expensa.modelo.js
// ============================================================
 
const { consultar } = require('../config/baseDatos');
 
const listarPorPeriodo = async (periodoId) => {
  const resultado = await consultar(
    `SELECT
       eu.id, eu.monto_ordinario, eu.monto_extraordinario,
       eu.monto_total, eu.pagado, eu.pagado_en, eu.creado_en,
       u.id AS unidad_id, u.nombre AS unidad_nombre,
       u.tipo AS unidad_tipo, u.coeficiente,
       p.nombre AS propietario_nombre, p.email AS propietario_email,
       i.nombre AS inquilino_nombre,   i.email AS inquilino_email
     FROM expensas_unidad eu
     JOIN unidades u  ON eu.unidad_id = u.id
     LEFT JOIN usuarios p ON u.propietario_id = p.id
     LEFT JOIN usuarios i ON u.inquilino_id   = i.id
     WHERE eu.periodo_id = $1
     ORDER BY u.nombre ASC`,
    [periodoId]
  );
  return resultado.rows;
};
 
const listarPorUnidad = async (unidadId) => {
  const resultado = await consultar(
    `SELECT
       eu.id, eu.monto_ordinario, eu.monto_extraordinario,
       eu.monto_total, eu.pagado, eu.pagado_en,
       p.periodo, p.cerrado_en
     FROM expensas_unidad eu
     JOIN periodos p ON eu.periodo_id = p.id
     WHERE eu.unidad_id = $1
     ORDER BY p.periodo DESC`,
    [unidadId]
  );
  return resultado.rows;
};
 
const buscarPorId = async (id) => {
  const resultado = await consultar(
    'SELECT * FROM expensas_unidad WHERE id = $1',
    [id]
  );
  return resultado.rows[0] || null;
};
 
const crear = async ({ unidadId, periodoId, montoOrdinario, montoExtraordinario, montoTotal }) => {
  const resultado = await consultar(
    `INSERT INTO expensas_unidad
       (unidad_id, periodo_id, monto_ordinario, monto_extraordinario, monto_total)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [unidadId, periodoId, montoOrdinario, montoExtraordinario, montoTotal]
  );
  return resultado.rows[0];
};
 
const marcarPagada = async (id) => {
  const resultado = await consultar(
    `UPDATE expensas_unidad
     SET pagado = true, pagado_en = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return resultado.rows[0] || null;
};
 
const marcarPendiente = async (id) => {
  const resultado = await consultar(
    `UPDATE expensas_unidad
     SET pagado = false, pagado_en = NULL
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return resultado.rows[0] || null;
};
 
const eliminarPorPeriodo = async (periodoId) => {
  await consultar(
    'DELETE FROM expensas_unidad WHERE periodo_id = $1',
    [periodoId]
  );
};
 
const estadoDeudaPorUnidad = async () => {
  const resultado = await consultar(
    `SELECT
       u.id AS unidad_id,
       COUNT(eu.id) FILTER (WHERE eu.pagado = false) AS pendientes,
       COALESCE(SUM(eu.monto_total) FILTER (WHERE eu.pagado = false), 0) AS monto_pendiente
     FROM unidades u
     LEFT JOIN expensas_unidad eu ON eu.unidad_id = u.id
     WHERE u.activa = true
     GROUP BY u.id`
  );
  return resultado.rows;
};
 
module.exports = {
  listarPorPeriodo,
  listarPorUnidad,
  buscarPorId,
  crear,
  marcarPagada,
  marcarPendiente,
  eliminarPorPeriodo,
  estadoDeudaPorUnidad,
};
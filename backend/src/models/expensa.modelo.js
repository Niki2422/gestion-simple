// ============================================================
// expensa.modelo.js  —  multi-consorcio
// Ubicación: src/models/expensa.modelo.js
// Nota: la tabla ahora se llama "expensas" (no "expensas_unidad")
// ============================================================

const { consultar } = require('../config/baseDatos');

const listarPorPeriodo = async (periodoId) => {
  const r = await consultar(`
    SELECT
      e.id, e.monto_ordinario, e.monto_extraordinario,
      e.monto_total, e.pagado, e.pagado_en, e.creado_en,
      u.id   AS unidad_id,   u.nombre AS unidad_nombre,
      u.tipo AS unidad_tipo, u.coeficiente,
      p.nombre AS propietario_nombre, p.email AS propietario_email,
      i.nombre AS inquilino_nombre,   i.email AS inquilino_email
    FROM expensas e
    JOIN unidades u  ON e.unidad_id = u.id
    LEFT JOIN usuarios p ON u.propietario_id = p.id
    LEFT JOIN usuarios i ON u.inquilino_id   = i.id
    WHERE e.periodo_id = $1
    ORDER BY u.nombre ASC
  `, [periodoId]);
  return r.rows;
};

const listarPorUnidad = async (unidadId) => {
  const r = await consultar(`
    SELECT
      e.id, e.monto_ordinario, e.monto_extraordinario,
      e.monto_total, e.pagado, e.pagado_en,
      p.periodo, p.cerrado_en
    FROM expensas e
    JOIN periodos p ON e.periodo_id = p.id
    WHERE e.unidad_id = $1
    ORDER BY p.periodo DESC
  `, [unidadId]);
  return r.rows;
};

const buscarPorId = async (id) => {
  const r = await consultar('SELECT * FROM expensas WHERE id = $1', [id]);
  return r.rows[0] || null;
};

const marcarPagada = async (id) => {
  const r = await consultar(
    'UPDATE expensas SET pagado = true, pagado_en = NOW() WHERE id = $1 RETURNING *',
    [id]
  );
  return r.rows[0] || null;
};

const marcarPendiente = async (id) => {
  const r = await consultar(
    'UPDATE expensas SET pagado = false, pagado_en = NULL WHERE id = $1 RETURNING *',
    [id]
  );
  return r.rows[0] || null;
};

const eliminarPorPeriodo = async (periodoId) => {
  await consultar('DELETE FROM expensas WHERE periodo_id = $1', [periodoId]);
};

const estadoDeudaPorUnidad = async (consorcioId) => {
  const r = await consultar(`
    SELECT
      u.id AS unidad_id,
      COUNT(e.id) FILTER (WHERE e.pagado = false)::int AS pendientes,
      COALESCE(SUM(e.monto_total) FILTER (WHERE e.pagado = false), 0) AS monto_pendiente
    FROM unidades u
    LEFT JOIN expensas e ON e.unidad_id = u.id
    WHERE u.activa = true AND u.consorcio_id = $1
    GROUP BY u.id
  `, [consorcioId]);
  return r.rows;
};

module.exports = {
  listarPorPeriodo,
  listarPorUnidad,
  buscarPorId,
  marcarPagada,
  marcarPendiente,
  eliminarPorPeriodo,
  estadoDeudaPorUnidad,
};
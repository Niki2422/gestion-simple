// ============================================================
// presupuesto.modelo.js  —  multi-consorcio
// Ubicación: src/models/presupuesto.modelo.js
// ============================================================

const { consultar } = require('../config/baseDatos');

const listarLicitaciones = async (consorcioId) => {
  const r = await consultar(`
    SELECT l.*, u.nombre AS creado_por_nombre,
      COUNT(DISTINCT p.id)::int AS cantidad_presupuestos,
      COUNT(DISTINCT v.id)::int AS cantidad_votos
    FROM licitaciones l
    LEFT JOIN usuarios u ON l.creado_por = u.id
    LEFT JOIN presupuestos p ON p.licitacion_id = l.id
    LEFT JOIN votos_presupuesto v ON v.licitacion_id = l.id
    WHERE l.consorcio_id = $1
    GROUP BY l.id, u.nombre
    ORDER BY l.creado_en DESC
  `, [consorcioId]);
  return r.rows;
};

const buscarLicitacionPorId = async (id, consorcioId) => {
  const r = await consultar(`
    SELECT l.*, u.nombre AS creado_por_nombre
    FROM licitaciones l
    LEFT JOIN usuarios u ON l.creado_por = u.id
    WHERE l.id = $1 AND l.consorcio_id = $2
  `, [id, consorcioId]);
  return r.rows[0] || null;
};

const crearLicitacion = async ({ titulo, descripcion, periodo, caduca_en, creadoPor, consorcioId }) => {
  const r = await consultar(`
    INSERT INTO licitaciones (titulo, descripcion, periodo, caduca_en, creado_por, consorcio_id)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
  `, [titulo, descripcion || null, periodo, caduca_en || null, creadoPor, consorcioId]);
  return r.rows[0];
};

const actualizarEstadoLicitacion = async (id, estado, consorcioId) => {
  const r = await consultar(
    'UPDATE licitaciones SET estado = $1 WHERE id = $2 AND consorcio_id = $3 RETURNING *',
    [estado, id, consorcioId]
  );
  return r.rows[0] || null;
};

const eliminarLicitacion = async (id, consorcioId) => {
  const r = await consultar(
    'DELETE FROM licitaciones WHERE id = $1 AND consorcio_id = $2 RETURNING id',
    [id, consorcioId]
  );
  return r.rows[0] || null;
};

const listarPresupuestosDeLicitacion = async (licitacionId, usuarioId = null) => {
  const r = await consultar(`
    SELECT p.*, COUNT(v.id)::int AS votos, BOOL_OR(v.usuario_id = $2) AS yo_vote
    FROM presupuestos p
    LEFT JOIN votos_presupuesto v ON v.presupuesto_id = p.id
    WHERE p.licitacion_id = $1
    GROUP BY p.id ORDER BY p.creado_en ASC
  `, [licitacionId, usuarioId]);
  return r.rows;
};

const crearPresupuesto = async ({ licitacionId, proveedor, articulos, manoDeObra, tiempoEstimado, total, notas }) => {
  const r = await consultar(`
    INSERT INTO presupuestos (licitacion_id, proveedor, articulos, mano_de_obra, tiempo_estimado, total, notas)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
  `, [licitacionId, proveedor, articulos || null, manoDeObra || 0, tiempoEstimado || null, total, notas || null]);
  return r.rows[0];
};

const eliminarPresupuesto = async (id) => {
  const r = await consultar('DELETE FROM presupuestos WHERE id = $1 RETURNING id', [id]);
  return r.rows[0] || null;
};

const buscarVoto = async (licitacionId, usuarioId) => {
  const r = await consultar(
    'SELECT * FROM votos_presupuesto WHERE licitacion_id = $1 AND usuario_id = $2',
    [licitacionId, usuarioId]
  );
  return r.rows[0] || null;
};

const votar = async (licitacionId, presupuestoId, usuarioId) => {
  const r = await consultar(`
    INSERT INTO votos_presupuesto (licitacion_id, presupuesto_id, usuario_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (licitacion_id, usuario_id)
      DO UPDATE SET presupuesto_id = EXCLUDED.presupuesto_id, creado_en = NOW()
    RETURNING *
  `, [licitacionId, presupuestoId, usuarioId]);
  return r.rows[0];
};

const resultadoVotacion = async (licitacionId) => {
  const r = await consultar(`
    SELECT p.id, p.proveedor, p.total, COUNT(v.id)::int AS votos
    FROM presupuestos p
    LEFT JOIN votos_presupuesto v ON v.presupuesto_id = p.id
    WHERE p.licitacion_id = $1
    GROUP BY p.id ORDER BY votos DESC, p.total ASC
  `, [licitacionId]);
  return r.rows;
};

module.exports = {
  listarLicitaciones, buscarLicitacionPorId, crearLicitacion,
  actualizarEstadoLicitacion, eliminarLicitacion,
  listarPresupuestosDeLicitacion, crearPresupuesto, eliminarPresupuesto,
  buscarVoto, votar, resultadoVotacion,
};
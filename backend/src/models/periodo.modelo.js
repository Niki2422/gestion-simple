// ============================================================
// periodo.modelo.js
// Ubicación: src/models/periodo.modelo.js
// ============================================================
 
const { consultar } = require('../config/baseDatos');
 
const listarTodos = async () => {
  const resultado = await consultar(
    `SELECT * FROM periodos ORDER BY periodo DESC`
  );
  return resultado.rows;
};
 
const buscarPorId = async (id) => {
  const resultado = await consultar(
    'SELECT * FROM periodos WHERE id = $1',
    [id]
  );
  return resultado.rows[0] || null;
};
 
const buscarPorPeriodo = async (periodo) => {
  const resultado = await consultar(
    'SELECT * FROM periodos WHERE periodo = $1',
    [periodo]
  );
  return resultado.rows[0] || null;
};
 
const crear = async (periodo) => {
  const resultado = await consultar(
    `INSERT INTO periodos (periodo) VALUES ($1) RETURNING *`,
    [periodo]
  );
  return resultado.rows[0];
};
 
const cerrar = async (id, { totalOrdinario, totalExtraordinario }) => {
  const resultado = await consultar(
    `UPDATE periodos
     SET cerrado = true,
         cerrado_en = NOW(),
         total_ordinario = $1,
         total_extraordinario = $2
     WHERE id = $3
     RETURNING *`,
    [totalOrdinario, totalExtraordinario, id]
  );
  return resultado.rows[0];
};
 
const eliminar = async (id) => {
  const resultado = await consultar(
    `DELETE FROM periodos WHERE id = $1 RETURNING id, periodo`,
    [id]
  );
  return resultado.rows[0] || null;
};
 
module.exports = { listarTodos, buscarPorId, buscarPorPeriodo, crear, cerrar, eliminar };
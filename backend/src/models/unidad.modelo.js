// ============================================================
// unidad.modelo.js
// Consultas SQL relacionadas a unidades.
// ============================================================

const { consultar } = require('../config/baseDatos');

// Listar todas las unidades con datos de propietario e inquilino
const listarTodas = async () => {
  const resultado = await consultar(`
    SELECT
      u.id,
      u.nombre,
      u.tipo,
      u.coeficiente,
      u.activa,
      u.creado_en,
      -- Datos del propietario
      p.id    AS propietario_id,
      p.nombre AS propietario_nombre,
      p.email  AS propietario_email,
      -- Datos del inquilino
      i.id    AS inquilino_id,
      i.nombre AS inquilino_nombre,
      i.email  AS inquilino_email
    FROM unidades u
    LEFT JOIN usuarios p ON u.propietario_id = p.id
    LEFT JOIN usuarios i ON u.inquilino_id   = i.id
    ORDER BY u.nombre ASC
  `);
  return resultado.rows;
};

// Obtener una unidad por ID
const buscarPorId = async (id) => {
  const resultado = await consultar(`
    SELECT
      u.id, u.nombre, u.tipo, u.coeficiente, u.activa, u.creado_en,
      p.id AS propietario_id, p.nombre AS propietario_nombre, p.email AS propietario_email,
      i.id AS inquilino_id,   i.nombre AS inquilino_nombre,   i.email AS inquilino_email
    FROM unidades u
    LEFT JOIN usuarios p ON u.propietario_id = p.id
    LEFT JOIN usuarios i ON u.inquilino_id   = i.id
    WHERE u.id = $1
  `, [id]);
  return resultado.rows[0] || null;
};

// Obtener unidades de un propietario específico
const buscarPorPropietario = async (propietarioId) => {
  const resultado = await consultar(`
    SELECT u.*, i.nombre AS inquilino_nombre, i.email AS inquilino_email
    FROM unidades u
    LEFT JOIN usuarios i ON u.inquilino_id = i.id
    WHERE u.propietario_id = $1 AND u.activa = true
    ORDER BY u.nombre ASC
  `, [propietarioId]);
  return resultado.rows;
};

// Obtener unidades de un inquilino específico
const buscarPorInquilino = async (inquilinoId) => {
  const resultado = await consultar(`
    SELECT u.*, p.nombre AS propietario_nombre, p.email AS propietario_email
    FROM unidades u
    LEFT JOIN usuarios p ON u.propietario_id = p.id
    WHERE u.inquilino_id = $1 AND u.activa = true
    ORDER BY u.nombre ASC
  `, [inquilinoId]);
  return resultado.rows;
};

// Obtener la suma total de coeficientes (debe ser 100)
const sumaCoeficientes = async () => {
  const resultado = await consultar(
    'SELECT COALESCE(SUM(coeficiente), 0) AS total FROM unidades WHERE activa = true'
  );
  return parseFloat(resultado.rows[0].total);
};

// Crear una unidad
const crear = async ({ nombre, tipo, coeficiente, propietarioId, inquilinoId }) => {
  const resultado = await consultar(`
    INSERT INTO unidades (nombre, tipo, coeficiente, propietario_id, inquilino_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [nombre, tipo, coeficiente, propietarioId || null, inquilinoId || null]);
  return resultado.rows[0];
};

// Actualizar una unidad
const actualizar = async (id, { nombre, tipo, coeficiente, propietarioId, inquilinoId }) => {
  const resultado = await consultar(`
    UPDATE unidades
    SET nombre = $1, tipo = $2, coeficiente = $3,
        propietario_id = $4, inquilino_id = $5
    WHERE id = $6
    RETURNING *
  `, [nombre, tipo, coeficiente, propietarioId || null, inquilinoId || null, id]);
  return resultado.rows[0] || null;
};

// Desactivar unidad (soft delete)
const desactivar = async (id) => {
  const resultado = await consultar(
    'UPDATE unidades SET activa = false WHERE id = $1 RETURNING id, nombre, activa',
    [id]
  );
  return resultado.rows[0] || null;
};

module.exports = {
  listarTodas,
  buscarPorId,
  buscarPorPropietario,
  buscarPorInquilino,
  sumaCoeficientes,
  crear,
  actualizar,
  desactivar,
};

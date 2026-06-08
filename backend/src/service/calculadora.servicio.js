// ============================================================
// calculadora.servicio.js
// Motor de cálculo de expensas.
//
// LÓGICA DE NEGOCIO:
//   - Gastos ordinarios      -> los paga el INQUILINO
//   - Gastos extraordinarios -> los paga el PROPIETARIO
//
// FORMULA:
//   monto_unidad = total_gastos * (coeficiente_unidad / 100)
//
// Todo se ejecuta dentro de una transaccion SQL.
// Si algo falla, se revierten todos los cambios (ROLLBACK).
// ============================================================

const { pool }             = require('../config/baseDatos');
const gastoModelo          = require('../models/gasto.modelo');
const expensaModelo        = require('../models/expensa.modelo');
const periodoModelo        = require('../models/periodo.modelo');
const unidadModelo         = require('../models/unidad.modelo');
const { ErrorOperacional } = require('../middlewares/manejarErrores');

const calcularYCerrarPeriodo = async (periodoId) => {

  const periodo = await periodoModelo.buscarPorId(periodoId);
  if (!periodo) {
    throw new ErrorOperacional('Período no encontrado', 404);
  }
  if (periodo.cerrado) {
    throw new ErrorOperacional(
      `El período ${periodo.periodo} ya fue cerrado`,
      400
    );
  }

  const unidades = await unidadModelo.listarTodas();
  const unidadesActivas = unidades.filter((u) => u.activa);

  if (unidadesActivas.length === 0) {
    throw new ErrorOperacional('No hay unidades activas para calcular expensas', 400);
  }

  const totales = await gastoModelo.sumarPorTipo(periodoId);
  const ordinario      = parseFloat(totales.total_ordinario      || 0);
  const extraordinario = parseFloat(totales.total_extraordinario || 0);

  if (ordinario === 0 && extraordinario === 0) {
    throw new ErrorOperacional(
      'No hay gastos cargados en este período. Cargá al menos un gasto antes de cerrar.',
      400
    );
  }

  const cliente = await pool.connect();

  try {
    await cliente.query('BEGIN');

    await expensaModelo.eliminarPorPeriodo(periodoId);

    const expensasGeneradas = [];

    for (const unidad of unidadesActivas) {
      const coeficiente         = parseFloat(unidad.coeficiente);
      const montoOrdinario      = redondear(ordinario      * coeficiente / 100);
      const montoExtraordinario = redondear(extraordinario * coeficiente / 100);
      const montoTotal          = redondear(montoOrdinario + montoExtraordinario);

      await cliente.query(
        `INSERT INTO expensas_unidad
           (unidad_id, periodo_id, monto_ordinario, monto_extraordinario, monto_total)
         VALUES ($1, $2, $3, $4, $5)`,
        [unidad.id, periodoId, montoOrdinario, montoExtraordinario, montoTotal]
      );

      expensasGeneradas.push({
        unidad:               unidad.nombre,
        coeficiente:          coeficiente,
        monto_ordinario:      montoOrdinario,
        monto_extraordinario: montoExtraordinario,
        monto_total:          montoTotal,
      });
    }

    await cliente.query(
      `UPDATE periodos
       SET cerrado = true, cerrado_en = NOW(),
           total_ordinario = $1, total_extraordinario = $2
       WHERE id = $3`,
      [ordinario, extraordinario, periodoId]
    );

    await cliente.query('COMMIT');

    return {
      periodo:              periodo.periodo,
      total_ordinario:      ordinario,
      total_extraordinario: extraordinario,
      total_general:        redondear(ordinario + extraordinario),
      unidades_calculadas:  expensasGeneradas.length,
      detalle:              expensasGeneradas,
    };

  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};

const redondear = (numero) => {
  return Math.round((numero + Number.EPSILON) * 100) / 100;
};

module.exports = { calcularYCerrarPeriodo };
// ============================================================
// calculadora.servicio.js  —  multi-consorcio
// Ubicación: src/service/calculadora.servicio.js
// ============================================================

const { pool }             = require('../config/baseDatos');
const gastoModelo          = require('../models/gasto.modelo');
const expensaModelo        = require('../models/expensa.modelo');
const periodoModelo        = require('../models/periodo.modelo');
const unidadModelo         = require('../models/unidad.modelo');
const { ErrorOperacional } = require('../middlewares/manejarErrores');

const redondear = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const calcularYCerrarPeriodo = async (periodoId, consorcioId) => {

  const periodo = await periodoModelo.buscarPorId(periodoId, consorcioId);
  if (!periodo) throw new ErrorOperacional('Período no encontrado', 404);
  if (periodo.cerrado) {
    throw new ErrorOperacional(`El período ${periodo.periodo} ya fue cerrado`, 400);
  }

  const unidades = await unidadModelo.listarTodas(consorcioId);
  const activas  = unidades.filter(u => u.activa);
  if (activas.length === 0) {
    throw new ErrorOperacional('No hay unidades activas para calcular expensas', 400);
  }

  const totales      = await gastoModelo.sumarPorTipo(periodoId);
  const ordinario    = parseFloat(totales.total_ordinario      || 0);
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

    // Eliminar expensas previas del período (recalculo)
    await cliente.query('DELETE FROM expensas WHERE periodo_id = $1', [periodoId]);

    const detalle = [];
    for (const unidad of activas) {
      const coef  = parseFloat(unidad.coeficiente);
      const montoOrd  = redondear(ordinario      * coef / 100);
      const montoExt  = redondear(extraordinario * coef / 100);
      const montoTot  = redondear(montoOrd + montoExt);

      await cliente.query(
        `INSERT INTO expensas
           (unidad_id, periodo_id, monto_ordinario, monto_extraordinario, monto_total, unidad_nombre)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [unidad.id, periodoId, montoOrd, montoExt, montoTot, unidad.nombre]
      );

      detalle.push({
        unidad:               unidad.nombre,
        coeficiente:          coef,
        monto_ordinario:      montoOrd,
        monto_extraordinario: montoExt,
        monto_total:          montoTot,
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
      unidades_calculadas:  detalle.length,
      detalle,
    };
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release();
  }
};

module.exports = { calcularYCerrarPeriodo };
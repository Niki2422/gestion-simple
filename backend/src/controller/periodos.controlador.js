// ============================================================
// periodos.controlador.js  —  multi-consorcio
// Ubicación: src/controller/periodos.controlador.js
// ============================================================

const periodosServicio    = require('../service/periodos.servicio');
const calculadoraServicio = require('../service/calculadora.servicio');

const listar = async (req, res, next) => {
  try {
    const periodos = await periodosServicio.listar(req.consorcioId);
    res.json({ exito: true, datos: periodos });
  } catch (e) { next(e); }
};

const obtenerUno = async (req, res, next) => {
  try {
    const periodo = await periodosServicio.obtenerPorId(req.params.id, req.consorcioId);
    res.json({ exito: true, datos: periodo });
  } catch (e) { next(e); }
};

const crear = async (req, res, next) => {
  try {
    const { periodo } = req.body;
    const nuevo = await periodosServicio.crear(periodo, req.consorcioId);
    res.status(201).json({
      exito:   true,
      mensaje: `Período ${nuevo.periodo} creado correctamente`,
      datos:   nuevo,
    });
  } catch (e) { next(e); }
};

const cerrar = async (req, res, next) => {
  try {
    const resultado = await calculadoraServicio.calcularYCerrarPeriodo(
      req.params.id,
      req.consorcioId
    );
    res.json({
      exito:   true,
      mensaje: `Período ${resultado.periodo} cerrado y expensas generadas correctamente`,
      datos:   resultado,
    });
  } catch (e) { next(e); }
};

const eliminar = async (req, res, next) => {
  try {
    const eliminado = await periodosServicio.eliminar(req.params.id, req.consorcioId);
    res.json({
      exito:   true,
      mensaje: `Período ${eliminado.periodo} eliminado correctamente`,
      datos:   eliminado,
    });
  } catch (e) { next(e); }
};

module.exports = { listar, obtenerUno, crear, cerrar, eliminar };
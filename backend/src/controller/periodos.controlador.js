// ============================================================
// periodos.controlador.js
// Ubicación: src/controller/periodos.controlador.js
// ============================================================
 
const periodosServicio    = require('../service/periodos.servicio');
const calculadoraServicio = require('../service/calculadora.servicio');
 
const listar = async (req, res, next) => {
  try {
    const periodos = await periodosServicio.listar();
    res.json({ exito: true, datos: periodos });
  } catch (error) { next(error); }
};
 
const obtenerUno = async (req, res, next) => {
  try {
    const periodo = await periodosServicio.obtenerPorId(req.params.id);
    res.json({ exito: true, datos: periodo });
  } catch (error) { next(error); }
};
 
const crear = async (req, res, next) => {
  try {
    const { periodo } = req.body;
    const nuevo = await periodosServicio.crear(periodo);
    res.status(201).json({
      exito:   true,
      mensaje: `Período ${nuevo.periodo} creado correctamente`,
      datos:   nuevo,
    });
  } catch (error) { next(error); }
};
 
const cerrar = async (req, res, next) => {
  try {
    const resultado = await calculadoraServicio.calcularYCerrarPeriodo(req.params.id);
    res.json({
      exito:   true,
      mensaje: `Período ${resultado.periodo} cerrado y expensas generadas correctamente`,
      datos:   resultado,
    });
  } catch (error) { next(error); }
};
 
const eliminar = async (req, res, next) => {
  try {
    const eliminado = await periodosServicio.eliminar(req.params.id);
    res.json({
      exito:   true,
      mensaje: `Período ${eliminado.periodo} eliminado correctamente`,
      datos:   eliminado,
    });
  } catch (error) { next(error); }
};
 
module.exports = { listar, obtenerUno, crear, cerrar, eliminar };
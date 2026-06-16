// ============================================================
// presupuestos.controlador.js
// Ubicación: src/controller/presupuestos.controlador.js
// ============================================================

const Modelo = require('../models/presupuesto.modelo');

// ── Licitaciones ───────────────────────────────────────────

// GET /api/presupuestos
const listarLicitaciones = async (req, res, next) => {
  try {
    const lista = await Modelo.listarLicitaciones();
    res.json({ exito: true, datos: lista });
  } catch (e) { next(e); }
};

// GET /api/presupuestos/:id
const obtenerLicitacion = async (req, res, next) => {
  try {
    const licitacion = await Modelo.buscarLicitacionPorId(req.params.id);
    if (!licitacion) return res.status(404).json({ exito: false, mensaje: 'Licitación no encontrada' });

    const usuarioId  = req.usuario.id;
    const presupuestos = await Modelo.listarPresupuestosDeLicitacion(licitacion.id, usuarioId);
    const miVoto       = await Modelo.buscarVoto(licitacion.id, usuarioId);

    res.json({ exito: true, datos: { ...licitacion, presupuestos, miVoto: miVoto?.presupuesto_id || null } });
  } catch (e) { next(e); }
};

// POST /api/presupuestos
const crearLicitacion = async (req, res, next) => {
  try {
    const { titulo, descripcion, periodo, caduca_en } = req.body;
    if (!titulo?.trim()) return res.status(400).json({ exito: false, mensaje: 'El título es requerido' });
    if (!periodo)        return res.status(400).json({ exito: false, mensaje: 'El período es requerido' });

    const nueva = await Modelo.crearLicitacion({
      titulo: titulo.trim(),
      descripcion,
      periodo,
      caduca_en,
      creadoPor: req.usuario.id,
    });
    res.status(201).json({ exito: true, datos: nueva });
  } catch (e) { next(e); }
};

// PATCH /api/presupuestos/:id/estado
const cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const validos = ['abierta', 'votando', 'cerrada'];
    if (!validos.includes(estado)) {
      return res.status(400).json({ exito: false, mensaje: 'Estado inválido' });
    }
    const actualizada = await Modelo.actualizarEstadoLicitacion(req.params.id, estado);
    if (!actualizada) return res.status(404).json({ exito: false, mensaje: 'Licitación no encontrada' });
    res.json({ exito: true, datos: actualizada });
  } catch (e) { next(e); }
};

// DELETE /api/presupuestos/:id
const eliminarLicitacion = async (req, res, next) => {
  try {
    const eliminada = await Modelo.eliminarLicitacion(req.params.id);
    if (!eliminada) return res.status(404).json({ exito: false, mensaje: 'Licitación no encontrada' });
    res.json({ exito: true, mensaje: 'Licitación eliminada' });
  } catch (e) { next(e); }
};

// ── Presupuestos individuales ──────────────────────────────

// POST /api/presupuestos/:id/items
const agregarPresupuesto = async (req, res, next) => {
  try {
    const { proveedor, articulos, manoDeObra, tiempoEstimado, total, notas } = req.body;
    if (!proveedor?.trim()) return res.status(400).json({ exito: false, mensaje: 'El proveedor es requerido' });
    if (!total || isNaN(total)) return res.status(400).json({ exito: false, mensaje: 'El total es requerido' });

    const licitacion = await Modelo.buscarLicitacionPorId(req.params.id);
    if (!licitacion) return res.status(404).json({ exito: false, mensaje: 'Licitación no encontrada' });
    if (licitacion.estado !== 'abierta') {
      return res.status(400).json({ exito: false, mensaje: 'Solo se pueden agregar presupuestos a licitaciones abiertas' });
    }

    const nuevo = await Modelo.crearPresupuesto({
      licitacionId:   req.params.id,
      proveedor:      proveedor.trim(),
      articulos,
      manoDeObra:     parseFloat(manoDeObra) || 0,
      tiempoEstimado,
      total:          parseFloat(total),
      notas,
    });
    res.status(201).json({ exito: true, datos: nuevo });
  } catch (e) { next(e); }
};

// DELETE /api/presupuestos/:id/items/:itemId
const eliminarPresupuesto = async (req, res, next) => {
  try {
    const eliminado = await Modelo.eliminarPresupuesto(req.params.itemId);
    if (!eliminado) return res.status(404).json({ exito: false, mensaje: 'Presupuesto no encontrado' });
    res.json({ exito: true, mensaje: 'Presupuesto eliminado' });
  } catch (e) { next(e); }
};

// ── Votos ──────────────────────────────────────────────────

// POST /api/presupuestos/:id/votar
const votar = async (req, res, next) => {
  try {
    const { presupuestoId } = req.body;
    if (!presupuestoId) return res.status(400).json({ exito: false, mensaje: 'presupuestoId es requerido' });

    const licitacion = await Modelo.buscarLicitacionPorId(req.params.id);
    if (!licitacion) return res.status(404).json({ exito: false, mensaje: 'Licitación no encontrada' });
    if (licitacion.estado !== 'votando') {
      return res.status(400).json({ exito: false, mensaje: 'La votación no está activa' });
    }

    const voto = await Modelo.votar(req.params.id, presupuestoId, req.usuario.id);
    res.json({ exito: true, datos: voto });
  } catch (e) { next(e); }
};

// GET /api/presupuestos/:id/resultado
const resultado = async (req, res, next) => {
  try {
    const datos = await Modelo.resultadoVotacion(req.params.id);
    res.json({ exito: true, datos });
  } catch (e) { next(e); }
};

module.exports = {
  listarLicitaciones,
  obtenerLicitacion,
  crearLicitacion,
  cambiarEstado,
  eliminarLicitacion,
  agregarPresupuesto,
  eliminarPresupuesto,
  votar,
  resultado,
};
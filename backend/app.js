// ============================================================
// app.js — Configuración de Express
//
// Este archivo configura los middlewares globales y las rutas.
// No arranca el servidor (eso lo hace servidor.js).
// Separar la app del servidor facilita los tests en el futuro.
// ============================================================

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const { manejarErrores } = require('./src/middlewares/manejarErrores');

const app = express();

// ── Seguridad ──────────────────────────────────────────────
// helmet agrega headers HTTP de seguridad básicos
app.use(helmet());

// cors permite peticiones desde el frontend (localhost:5173 en desarrollo)
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.URL_FRONTEND   // En producción, solo el dominio real
    : 'http://localhost:5173',   // En desarrollo, Vite corre en este puerto
  credentials: true,
}));

// ── Parsers ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Logging ────────────────────────────────────────────────
// morgan loguea cada petición: método, ruta, código de estado, tiempo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Ruta de salud ──────────────────────────────────────────
// Útil para verificar que el servidor está corriendo
app.get('/api/salud', (req, res) => {
  res.json({
    exito:  true,
    mensaje: 'Servidor funcionando correctamente',
    entorno: process.env.NODE_ENV,
    fecha:   new Date().toISOString(),
  });
});

// ── Rutas de la aplicación ─────────────────────────────────
// Las iremos agregando en los bloques siguientes:
app.use('/api/auth',     require('./src/routes/autenticacion.rutas'));
app.use('/api/usuarios', require('./src/routes/usuarios.rutas'));
app.use('/api/unidades', require('./src/routes/unidades.rutas'));
app.use('/api/gastos',   require('./src/routes/gastos.rutas'));    
app.use('/api/periodos', require('./src/routes/periodos.rutas'));  
app.use('/api/expensas', require('./src/routes/expensas.rutas')); 
app.use('/api/presupuestos', require('./src/routes/presupuesto.rutas'));

// ── Ruta no encontrada ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    exito:   false,
    mensaje: `Ruta ${req.method} ${req.path} no encontrada`,
  });
});

// ── Manejo global de errores ───────────────────────────────
// IMPORTANTE: debe ir al final, después de todas las rutas
app.use(manejarErrores);

module.exports = app;

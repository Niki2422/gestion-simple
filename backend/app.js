// ============================================================
// app.js  —  multi-consorcio
// Ubicación: backend/app.js
// ============================================================

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const { manejarErrores } = require('./src/middlewares/manejarErrores');
const autenticar         = require('./src/middlewares/autenticar');
const { verificarAccesoConsorcio, soloAdminConsorcio } = require('./src/middlewares/verificarAccesoConsorcio');

const app = express();

// ── Seguridad ──────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.URL_FRONTEND
    : 'http://localhost:5173',
  credentials: true,
}));

// ── Parsers ────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Logging ────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ── Ruta de salud ──────────────────────────────────────────
app.get('/api/salud', (req, res) => {
  res.json({ exito: true, mensaje: 'Servidor funcionando correctamente' });
});

// ── Rutas públicas ─────────────────────────────────────────
app.use('/api/auth', require('./src/routes/autenticacion.rutas'));

// ── Rutas globales (requieren solo autenticación) ──────────
// Consorcios propios del usuario
app.use('/api/consorcios', require('./src/routes/consorcios.rutas'));

// Cambiar contraseña propia (no depende de consorcio)
app.use('/api/usuarios', require('./src/routes/usuarios.rutas'));

// ── Rutas con scope de consorcio ───────────────────────────
// Todas las rutas bajo /api/consorcios/:cid/* requieren:
//   1. Token válido (autenticar)
//   2. Acceso al consorcio (verificarAccesoConsorcio)
//      → inyecta req.consorcioId y req.rolEnConsorcio

const routerConsorcio = express.Router({ mergeParams: true });
routerConsorcio.use(autenticar, verificarAccesoConsorcio);

routerConsorcio.use('/usuarios',     require('./src/routes/consorcio_usuarios.rutas'));
routerConsorcio.use('/unidades',     require('./src/routes/unidades.rutas'));
routerConsorcio.use('/periodos',     require('./src/routes/periodos.rutas'));
routerConsorcio.use('/gastos',       require('./src/routes/gastos.rutas'));
routerConsorcio.use('/expensas',     require('./src/routes/expensas.rutas'));
routerConsorcio.use('/presupuestos', require('./src/routes/presupuestos.rutas'));

app.use('/api/consorcios/:cid', routerConsorcio);

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ exito: false, mensaje: `Ruta ${req.method} ${req.path} no encontrada` });
});

// ── Errores ────────────────────────────────────────────────
app.use(manejarErrores);

module.exports = app;
// ============================================================
// servidor.js — Punto de entrada
//
// Carga las variables de entorno, importa la app configurada
// y arranca el servidor en el puerto definido.
// ============================================================

require('dotenv').config();

// Verificar variables de entorno críticas antes de arrancar
const variablesRequeridas = [
  'DB_HOST', 'DB_PUERTO', 'DB_NOMBRE',
  'DB_USUARIO', 'DB_CONTRASENA', 'JWT_SECRETO'
];

variablesRequeridas.forEach((variable) => {
  if (!process.env[variable]) {
    console.error(`❌ Falta la variable de entorno: ${variable}`);
    process.exit(1);
  }
});

// Importar la app DESPUÉS de cargar dotenv
const app = require('./app');

// Importar la conexión a la base de datos para verificarla al inicio
require('./src/config/baseDatos');

const PUERTO = process.env.PUERTO || 3000;

const servidor = app.listen(PUERTO, () => {
  console.log('─────────────────────────────────────────');
  console.log(`🚀 Servidor corriendo en http://localhost:${PUERTO}`);
  console.log(`📋 Entorno: ${process.env.NODE_ENV}`);
  console.log(`🏥 Salud: http://localhost:${PUERTO}/api/salud`);
  console.log('─────────────────────────────────────────');
});

// Manejo de cierre elegante del servidor
// Si el proceso recibe SIGTERM (ej: Ctrl+C), cerramos limpiamente
process.on('SIGTERM', () => {
  console.log('⚠️  Cerrando servidor...');
  servidor.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

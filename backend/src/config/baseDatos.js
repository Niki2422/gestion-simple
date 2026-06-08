// ============================================================
// Conexión a PostgreSQL usando un Pool de conexiones.
//
// ¿Por qué Pool y no una conexión directa?
// Un pool mantiene varias conexiones abiertas y las reutiliza.
// Esto evita abrir y cerrar una conexión en cada petición HTTP,
// lo cual sería lento y costoso para la base de datos.
// ============================================================

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PUERTO),
  database: process.env.DB_NOMBRE,
  user:     process.env.DB_USUARIO,
  password: process.env.DB_CONTRASENA,
});

// Verificar la conexión al iniciar la aplicación
pool.connect((error, cliente, liberar) => {
  if (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    process.exit(1); // Detenemos el servidor si no hay conexión
  }
  liberar();
  console.log('✅ Conexión a PostgreSQL establecida correctamente');
});

// Función auxiliar para ejecutar consultas.
// Todos los modelos usarán esta función en lugar de pool.query directamente,
// lo que nos permite agregar logging o métricas en un solo lugar a futuro.
const consultar = async (texto, parametros) => {
  const inicio = Date.now();
  const resultado = await pool.query(texto, parametros);
  const duracion = Date.now() - inicio;

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔍 Query ejecutada en ${duracion}ms`);
  }

  return resultado;
};

module.exports = { pool, consultar };

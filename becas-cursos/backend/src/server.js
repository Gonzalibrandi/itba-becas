require('dotenv').config({ quiet: true });
const { crearApp } = require('./app');
const { conectarDB, desconectarDB } = require('./config/db');

const PORT = Number(process.env.PORT) || 3001;

async function iniciar() {
  await conectarDB(process.env.MONGODB_URI);

  const app = crearApp();
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`API escuchando en el puerto ${PORT}`);
  });

  // Cierre ordenado cuando la plataforma reinicia o detiene el contenedor.
  const cerrar = (senal) => {
    console.log(`${senal} recibido, cerrando...`);
    server.close(async () => {
      await desconectarDB();
      process.exit(0);
    });
  };
  process.on('SIGTERM', cerrar);
  process.on('SIGINT', cerrar);
}

iniciar().catch((err) => {
  console.error('No se pudo iniciar la API:', err.message);
  process.exit(1);
});

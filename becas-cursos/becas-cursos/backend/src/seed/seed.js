require('dotenv').config({ quiet: true });
const { conectarDB, desconectarDB } = require('../config/db');
const { Publicacion } = require('../models/Publicacion');
const crearDatos = require('./datos');

// Borra todas las publicaciones y carga los datos de ejemplo.
async function seed() {
  await conectarDB(process.env.MONGODB_URI);

  const { deletedCount } = await Publicacion.deleteMany({});
  const creadas = await Publicacion.insertMany(crearDatos());

  console.log(`Se borraron ${deletedCount} publicaciones y se cargaron ${creadas.length} de ejemplo.`);
  await desconectarDB();
}

seed().catch(async (err) => {
  console.error('Error al cargar los datos:', err.message);
  await desconectarDB().catch(() => {});
  process.exit(1);
});

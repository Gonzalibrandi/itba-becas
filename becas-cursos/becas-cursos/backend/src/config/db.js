const mongoose = require('mongoose');

async function conectarDB(uri) {
  if (!uri) {
    throw new Error('Falta la variable de entorno MONGODB_URI');
  }

  mongoose.connection.on('disconnected', () => console.warn('MongoDB desconectado'));
  mongoose.connection.on('reconnected', () => console.log('MongoDB reconectado'));

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB conectado (base: ${mongoose.connection.name})`);
}

async function desconectarDB() {
  await mongoose.disconnect();
}

module.exports = { conectarDB, desconectarDB };

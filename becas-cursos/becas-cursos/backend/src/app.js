const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const publicacionesRouter = require('./routes/publicaciones');
const { rutaNoEncontrada, manejarErrores } = require('./middleware/errores');

// CORS_ORIGIN acepta una lista separada por comas. Se puede usar * como
// comodín de subdominio, por ejemplo: https://*.mi-proyecto.pages.dev
// (sirve para las vistas previas de Cloudflare Pages).
// Si no está definida, se permite cualquier origen (cómodo para desarrollo).
function crearOpcionesCors(valor) {
  if (!valor || valor.trim() === '*') return { origin: true };

  const permitidos = valor
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean)
    .map((o) => {
      const patron = o.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[a-z0-9-]+');
      return new RegExp(`^${patron}$`, 'i');
    });

  return {
    origin(origen, callback) {
      // Peticiones sin Origin (curl, healthchecks) se permiten.
      if (!origen || permitidos.some((re) => re.test(origen))) return callback(null, true);
      callback(new Error('Origen no permitido por CORS'));
    },
  };
}

function crearApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(cors(crearOpcionesCors(process.env.CORS_ORIGIN)));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => {
    const conectada = mongoose.connection.readyState === 1;
    res.status(conectada ? 200 : 503).json({ ok: conectada, db: conectada ? 'conectada' : 'desconectada' });
  });

  app.use('/api/publicaciones', publicacionesRouter);

  app.use(rutaNoEncontrada);
  app.use(manejarErrores);

  return app;
}

module.exports = { crearApp, crearOpcionesCors };

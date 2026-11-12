const mongoose = require('mongoose');

function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function manejarErrores(err, req, res, next) {
  if (err instanceof mongoose.Error.ValidationError) {
    const campos = {};
    for (const [campo, detalle] of Object.entries(err.errors)) {
      campos[campo] = detalle.message;
    }
    return res.status(400).json({ error: 'Hay datos inválidos', campos });
  }

  if (err instanceof mongoose.Error.CastError) {
    return res
      .status(400)
      .json({ error: 'Hay datos inválidos', campos: { [err.path]: `Valor inválido para ${err.path}` } });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
  }

  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ error: err.message });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? 'Error interno del servidor' : err.message });
}

module.exports = { rutaNoEncontrada, manejarErrores };

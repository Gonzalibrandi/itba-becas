const { Router } = require('express');
const controller = require('../controllers/publicacionesController');

// Express 5 captura los errores de las funciones async y los manda
// al middleware de errores, así que no hace falta try/catch acá.
const router = Router();

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;

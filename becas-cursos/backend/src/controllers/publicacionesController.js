const mongoose = require('mongoose');
const { Publicacion } = require('../models/Publicacion');

// Solo estos campos se pueden escribir desde la API (evita que el cliente
// mande _id, creadoEn, etc.).
const CAMPOS_EDITABLES = [
  'tipo',
  'titulo',
  'descripcion',
  'institucion',
  'imagenUrl',
  'enlace',
  'categorias',
  'fechaCierre',
  'detalles',
  'publicado',
];

function tomarCampos(body = {}) {
  const datos = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (body[campo] !== undefined) datos[campo] = body[campo];
  }
  // Strings vacíos en campos opcionales se guardan como "sin valor".
  for (const campo of ['imagenUrl', 'enlace', 'fechaCierre']) {
    if (datos[campo] === '') datos[campo] = null;
  }
  return datos;
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function errorNoEncontrada() {
  const error = new Error('Publicación no encontrada');
  error.status = 404;
  return error;
}

function validarId(id) {
  if (!mongoose.isValidObjectId(id)) throw errorNoEncontrada();
}

// GET /api/publicaciones?tipo=beca&q=texto&categoria=x&incluirOcultas=true
async function listar(req, res) {
  const { tipo, q, categoria, incluirOcultas } = req.query;
  const filtro = {};

  if (incluirOcultas !== 'true') filtro.publicado = true;
  if (tipo === 'curso' || tipo === 'beca') filtro.tipo = tipo;
  if (typeof categoria === 'string' && categoria.trim()) {
    filtro.categorias = categoria.trim().toLowerCase();
  }
  if (typeof q === 'string' && q.trim()) {
    const regex = new RegExp(escaparRegex(q.trim()), 'i');
    filtro.$or = [{ titulo: regex }, { institucion: regex }, { descripcion: regex }];
  }

  const publicaciones = await Publicacion.find(filtro).sort({ creadoEn: -1 });
  res.json(publicaciones);
}

// GET /api/publicaciones/:id
async function obtener(req, res) {
  validarId(req.params.id);
  const publicacion = await Publicacion.findById(req.params.id);
  if (!publicacion) throw errorNoEncontrada();
  res.json(publicacion);
}

// POST /api/publicaciones
async function crear(req, res) {
  const publicacion = await Publicacion.create(tomarCampos(req.body));
  res.status(201).json(publicacion);
}

// PUT /api/publicaciones/:id
async function actualizar(req, res) {
  validarId(req.params.id);
  const publicacion = await Publicacion.findById(req.params.id);
  if (!publicacion) throw errorNoEncontrada();

  publicacion.set(tomarCampos(req.body));
  await publicacion.save(); // save() corre todas las validaciones del schema
  res.json(publicacion);
}

// DELETE /api/publicaciones/:id
async function eliminar(req, res) {
  validarId(req.params.id);
  const publicacion = await Publicacion.findByIdAndDelete(req.params.id);
  if (!publicacion) throw errorNoEncontrada();
  res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };

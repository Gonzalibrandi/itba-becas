// Tests de integración de la API. Necesitan una base MongoDB de prueba:
//   MONGODB_URI_TEST=mongodb://localhost:27017/becas-cursos-test npm test
// ¡Ojo! Los tests borran la colección "publicaciones" de esa base.
require('dotenv').config({ quiet: true });
const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { crearApp, crearOpcionesCors } = require('../src/app');
const { conectarDB, desconectarDB } = require('../src/config/db');
const { Publicacion } = require('../src/models/Publicacion');

const URI = process.env.MONGODB_URI_TEST;

const cursoValido = {
  tipo: 'curso',
  titulo: 'Curso de prueba',
  descripcion: 'Descripción del curso',
  institucion: 'Instituto de prueba',
  categorias: ['Programación'],
  detalles: { modalidad: 'virtual', duracion: '4 semanas' },
};

describe('CORS', () => {
  test('acepta comodines de subdominio', async () => {
    const { origin } = crearOpcionesCors('https://app.pages.dev,https://*.app.pages.dev');
    const permite = (o) => new Promise((resolve) => origin(o, (err, ok) => resolve(!err && ok)));
    assert.equal(await permite('https://app.pages.dev'), true);
    assert.equal(await permite('https://abc123.app.pages.dev'), true);
    assert.equal(await permite('https://otro-sitio.com'), false);
    assert.equal(await permite(undefined), true);
  });
});

describe('API /api/publicaciones', { skip: !URI && 'definí MONGODB_URI_TEST para correr estos tests' }, () => {
  const app = crearApp();

  before(async () => {
    await conectarDB(URI);
  });

  after(async () => {
    await Publicacion.deleteMany({});
    await desconectarDB();
  });

  beforeEach(async () => {
    await Publicacion.deleteMany({});
  });

  test('GET /api/health responde ok', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.equal(res.body.ok, true);
  });

  test('crea una publicación y la devuelve con id', async () => {
    const res = await request(app).post('/api/publicaciones').send(cursoValido).expect(201);
    assert.ok(res.body.id);
    assert.equal(res.body._id, undefined);
    assert.equal(res.body.titulo, 'Curso de prueba');
    assert.deepEqual(res.body.categorias, ['programación']);
    assert.equal(res.body.publicado, true);
    assert.ok(res.body.creadoEn);
  });

  test('rechaza datos inválidos con mensajes por campo', async () => {
    const res = await request(app)
      .post('/api/publicaciones')
      .send({ tipo: 'taller', titulo: '', enlace: 'no-es-url' })
      .expect(400);
    assert.ok(res.body.campos.tipo);
    assert.ok(res.body.campos.titulo);
    assert.ok(res.body.campos.descripcion);
    assert.ok(res.body.campos.enlace);
  });

  test('ignora campos que no son editables', async () => {
    const res = await request(app)
      .post('/api/publicaciones')
      .send({ ...cursoValido, _id: '507f1f77bcf86cd799439011', creadoEn: '2000-01-01' })
      .expect(201);
    assert.notEqual(res.body.id, '507f1f77bcf86cd799439011');
    assert.notEqual(new Date(res.body.creadoEn).getFullYear(), 2000);
  });

  test('lista solo publicadas por defecto y todas con incluirOcultas', async () => {
    await Publicacion.create([
      cursoValido,
      { ...cursoValido, titulo: 'Oculto', publicado: false },
      { ...cursoValido, tipo: 'beca', titulo: 'Beca X', detalles: { monto: 1000 } },
    ]);

    const publicas = await request(app).get('/api/publicaciones').expect(200);
    assert.equal(publicas.body.length, 2);

    const todas = await request(app).get('/api/publicaciones?incluirOcultas=true').expect(200);
    assert.equal(todas.body.length, 3);

    const becas = await request(app).get('/api/publicaciones?tipo=beca').expect(200);
    assert.equal(becas.body.length, 1);
    assert.equal(becas.body[0].titulo, 'Beca X');
  });

  test('busca por texto sin romperse con caracteres especiales', async () => {
    await Publicacion.create([cursoValido, { ...cursoValido, titulo: 'Python (avanzado)' }]);

    const res = await request(app).get('/api/publicaciones').query({ q: 'python (' }).expect(200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].titulo, 'Python (avanzado)');
  });

  test('filtra por categoría', async () => {
    await Publicacion.create([cursoValido, { ...cursoValido, titulo: 'Otro', categorias: ['idiomas'] }]);
    const res = await request(app).get('/api/publicaciones?categoria=Idiomas').expect(200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].titulo, 'Otro');
  });

  test('obtiene, actualiza y elimina una publicación', async () => {
    const creada = await request(app).post('/api/publicaciones').send(cursoValido).expect(201);
    const id = creada.body.id;

    const obtenida = await request(app).get(`/api/publicaciones/${id}`).expect(200);
    assert.equal(obtenida.body.titulo, 'Curso de prueba');

    const actualizada = await request(app)
      .put(`/api/publicaciones/${id}`)
      .send({ titulo: 'Título nuevo', publicado: false })
      .expect(200);
    assert.equal(actualizada.body.titulo, 'Título nuevo');
    assert.equal(actualizada.body.publicado, false);
    assert.equal(actualizada.body.institucion, 'Instituto de prueba');

    await request(app).put(`/api/publicaciones/${id}`).send({ tipo: 'otro' }).expect(400);

    await request(app).delete(`/api/publicaciones/${id}`).expect(204);
    await request(app).get(`/api/publicaciones/${id}`).expect(404);
  });

  test('devuelve 404 para ids inexistentes o mal formados', async () => {
    await request(app).get('/api/publicaciones/507f1f77bcf86cd799439011').expect(404);
    await request(app).get('/api/publicaciones/no-es-un-id').expect(404);
    await request(app).delete('/api/publicaciones/no-es-un-id').expect(404);
  });

  test('devuelve 400 si el JSON está mal formado y 404 en rutas desconocidas', async () => {
    await request(app)
      .post('/api/publicaciones')
      .set('Content-Type', 'application/json')
      .send('{"titulo": ')
      .expect(400);
    await request(app).get('/api/no-existe').expect(404);
  });
});

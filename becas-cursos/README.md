# Cursos y becas

Galería de cursos y becas para estudiantes, con un CRUD básico. Tiene dos vistas que se cambian con el interruptor **Modo administrador** del encabezado:

- **Usuario:** ve solo las publicaciones visibles, filtra por tipo y categoría, busca por texto y entra al detalle.
- **Administrador:** además ve las ocultas y puede crear, editar, ocultar/publicar y eliminar.

> El interruptor es solo de interfaz, no es un login: cualquiera que abra la página puede activarlo. Para el alcance del proyecto está bien, pero conviene mencionarlo en la presentación.

## Tecnologías

| Parte | Stack | Dónde se despliega |
|---|---|---|
| Frontend (`client/`) | React 19, Vite, React Router 7, Vitest + Testing Library | Cloudflare Pages |
| Backend (`backend/`) | Node.js 20.19+ (CommonJS), Express 5, Mongoose 9, dotenv, cors | Northflank (servicio) |
| Base de datos | MongoDB | Northflank (addon) |

## Estructura

```
becas-cursos/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express: CORS, JSON, rutas, errores
│   │   ├── server.js               # Conecta a Mongo y levanta el servidor
│   │   ├── config/db.js
│   │   ├── models/Publicacion.js   # Schema con validaciones en español
│   │   ├── controllers/publicacionesController.js
│   │   ├── routes/publicaciones.js
│   │   ├── middleware/errores.js
│   │   └── seed/                   # npm run seed (datos de ejemplo)
│   ├── test/                       # Tests de la API (node:test + supertest)
│   ├── Dockerfile                  # Lo usa Northflank para construir la imagen
│   └── .env.example
└── client/
    ├── src/
    │   ├── api/publicaciones.js    # Llamadas a la API
    │   ├── context/ModoContext.jsx # Modo usuario/administrador
    │   ├── components/             # Encabezado, Tarjeta, Cierre
    │   ├── pages/                  # Galeria, Detalle, EditorPublicacion, NoEncontrada
    │   ├── utils/formato.js        # Fechas, montos, días hasta el cierre
    │   └── test/
    ├── vite.config.js              # Proxy /api -> localhost:3001 y config de tests
    └── .env.example
```

## La API

Base: `/api`

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/health` | Estado de la API y de la conexión a Mongo |
| GET | `/publicaciones` | Lista las visibles. Filtros: `tipo=beca\|curso`, `q=texto`, `categoria=x`, `incluirOcultas=true` |
| GET | `/publicaciones/:id` | Una publicación |
| POST | `/publicaciones` | Crea (201) |
| PUT | `/publicaciones/:id` | Actualiza los campos enviados |
| DELETE | `/publicaciones/:id` | Elimina (204) |

Los errores de validación vuelven con status 400 y un mensaje por campo:

```json
{ "error": "Hay datos inválidos", "campos": { "titulo": "El título es obligatorio" } }
```

Ejemplo de documento:

```json
{
  "id": "6650f1c2a1b2c3d4e5f60718",
  "tipo": "beca",
  "titulo": "Beca de Conectividad",
  "descripcion": "Ayuda económica mensual para cubrir internet...",
  "institucion": "Fundación Horizonte",
  "imagenUrl": "https://...",
  "enlace": "https://...",
  "categorias": ["ayuda económica", "tecnología"],
  "fechaCierre": "2026-12-02T00:00:00.000Z",
  "detalles": { "monto": 45000, "requisitos": ["Ser alumno regular"] },
  "publicado": true,
  "creadoEn": "2026-11-12T22:08:18.322Z",
  "actualizadoEn": "2026-11-12T22:08:18.322Z"
}
```

En un curso, `detalles` lleva `modalidad` (`presencial`, `virtual` o `hibrida`) y `duracion`.

---

## Desarrollo local

Necesitan Node.js 20.19 o superior y una base MongoDB. Para la base tienen tres opciones:

- **Mongo local con Docker:** `docker run -d -p 27017:27017 --name mongo mongo:8`
- **El addon de Northflank reenviado a su máquina** (ver más abajo, sección "Cargar los datos de ejemplo").
- **Cualquier otra base Mongo** a la que tengan acceso: solo cambia la URI.

### Backend

```bash
cd backend
cp .env.example .env        # y ajustar MONGODB_URI si hace falta
npm install
npm run seed                # carga 8 publicaciones de ejemplo (borra las existentes)
npm run dev                 # http://localhost:3001
```

### Frontend

En otra terminal:

```bash
cd client
npm install
npm run dev                 # http://localhost:3000
```

En desarrollo `VITE_API_URL` queda vacía: Vite redirige `/api` al backend (es el equivalente al `"proxy"` de CRA).

### Tests

```bash
# Backend: necesita una base de prueba (los tests BORRAN la colección "publicaciones" de esa base)
cd backend
MONGODB_URI_TEST=mongodb://localhost:27017/becas-cursos-test npm test

# Frontend: no necesita backend, la API está simulada
cd client
npm test
```

---

## Despliegue

El orden importa: primero la base, después el backend (para tener su URL) y al final el frontend.

### 0. Subir el código a GitHub

Un solo repositorio con las carpetas `backend/` y `client/` en la raíz. Verifiquen que `.env` **no** se suba (ya está en `.gitignore`).

### 1. Base de datos en Northflank

1. Creen una cuenta en [northflank.com](https://northflank.com) (plan Sandbox, gratis) y un **proyecto** nuevo. Elijan la región más cercana a sus usuarios.
2. Dentro del proyecto: **Create new → Addon → MongoDB**.
3. Nombre: `mongo`. Recursos: los mínimos (el almacenamiento se puede agrandar después, pero **no achicar**).
4. Si quieren poder conectarse desde su máquina sin el CLI, activen TLS. Para el uso normal no hace falta exponerla públicamente: el backend la alcanza por la red interna del proyecto.
5. Créenla y esperen a que esté en estado *Running*.

### 2. Backend en Northflank

1. **Create new → Service → Combined service** (construye y despliega desde el repo).
2. Conecten su cuenta de GitHub y elijan el repositorio y la rama `main`.
3. **Build options:** tipo **Dockerfile**.
   - Build context: `/backend`
   - Dockerfile location: `/backend/Dockerfile`
4. **Networking:** agreguen el puerto `3001`, protocolo HTTP y márquenlo como **público**. Northflank les da una URL del estilo `https://p01--api--xxxx.code.run`.
5. **Health check** (opcional pero recomendado): HTTP, ruta `/api/health`, puerto `3001`.
6. Creen el servicio. Va a fallar hasta que tenga la conexión a la base, eso es lo siguiente.

### 3. Conectar la base al backend (secret group)

1. **Create new → Secret group**, tipo *Runtime*.
2. En la sección de addons (*Show addons*), elijan `mongo` y la clave de conexión **`mongoSrv`** (o `MONGO_SRV`, según cómo la muestre la interfaz). Pónganle el alias **`MONGODB_URI`**, que es el nombre que espera el backend.
3. Restrinjan el grupo al servicio del backend (y al job de seed del paso 5).
4. Guarden. En la pestaña *Environment* del servicio deberían ver `MONGODB_URI` heredada.
5. Reinicien o vuelvan a desplegar el servicio. En los logs tiene que aparecer `MongoDB conectado` y `API escuchando en el puerto 3001`.
6. Prueben `https://SU-URL.code.run/api/health`: tiene que responder `{"ok":true,"db":"conectada"}`.

### 4. Frontend en Cloudflare Pages

1. En el panel de Cloudflare: **Workers & Pages → Create → Pages → Connect to Git** y elijan el repositorio.
2. Configuración del build:
   - Framework preset: **React (Vite)** (o *None*)
   - Root directory: `client`
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Variables de entorno** (Production y Preview): `VITE_API_URL` = la URL pública del backend, **sin barra al final**. Ej: `https://p01--api--xxxx.code.run`
4. Desplieguen. Les queda una URL tipo `https://becas-cursos.pages.dev`.

No hace falta ningún archivo de redirecciones: como el proyecto no tiene `404.html`, Cloudflare Pages lo trata como SPA y todas las rutas (`/publicaciones/:id`, `/admin/nueva`) cargan la app.

> `VITE_API_URL` se "hornea" en el build. Si cambia la URL del backend, hay que volver a desplegar el frontend.

### 5. Cerrar CORS y cargar los datos de ejemplo

**CORS.** En el servicio del backend agreguen la variable `CORS_ORIGIN` con el dominio de Pages (el `*` cubre las vistas previas de cada commit):

```
CORS_ORIGIN=https://becas-cursos.pages.dev,https://*.becas-cursos.pages.dev
```

Si la dejan vacía se acepta cualquier origen (útil para probar, no recomendado para la entrega).

**Datos de ejemplo.** Dos formas:

- **Con un job de Northflank (sin instalar nada).** El Sandbox incluye 2 jobs gratis. *Create new → Job → Manual job*, mismo repo y mismo Dockerfile que el backend, y en *Advanced → Custom command* pongan `node src/seed/seed.js`. Agreguen el job al secret group del paso 3 y ejecútenlo con *Run*. En los logs tiene que decir `Se borraron 0 publicaciones y se cargaron 8 de ejemplo`.
- **Desde su máquina con el CLI.** `npm i -g @northflank/cli`, `northflank login`, y después `sudo northflank forward addon --projectId SU-PROYECTO --addonId mongo` (pide `sudo` porque agrega el host de la base a su máquina). Con el reenvío activo, copien la URI de conexión del addon en `backend/.env` y corran `npm run seed`.

`npm run seed` **borra todas las publicaciones** antes de cargar las de ejemplo. Úsenlo para arrancar o para resetear la demo antes de presentar.

---

## Problemas comunes

| Síntoma | Causa probable |
|---|---|
| La página dice "No se pudo conectar con el servidor" | `VITE_API_URL` vacía o mal escrita en Pages, o el backend está caído. Abran `/api/health` del backend. |
| En la consola del navegador aparece un error de CORS | `CORS_ORIGIN` no incluye el dominio exacto de Pages (con `https://` y sin barra final). |
| El backend se reinicia con `Falta la variable de entorno MONGODB_URI` | El secret group no está aplicado al servicio o el alias no es exactamente `MONGODB_URI`. |
| `/api/health` responde `"db":"desconectada"` | El addon está pausado o reiniciándose. Revisen su estado en Northflank. |
| Al refrescar una ruta como `/publicaciones/123` aparece 404 | Se agregó un `404.html` en `client/public`. Bórrenlo, o agreguen `client/public/_redirects` con `/* /index.html 200`. |

## Limitaciones conocidas (para la presentación)

- El modo administrador no tiene autenticación: es un interruptor de interfaz. Con más tiempo, el siguiente paso sería proteger `POST`, `PUT` y `DELETE` con login (por ejemplo, JWT) y validar el rol en el backend.
- El plan Sandbox de Northflank está pensado para pruebas: el cómputo es limitado y no hay SLA.
- Hay una sola base de datos, sin entornos separados de desarrollo y producción.
- Las imágenes se cargan por URL; no hay subida de archivos.

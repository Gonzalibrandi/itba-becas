const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export class ErrorApi extends Error {
  constructor(mensaje, status, campos) {
    super(mensaje);
    this.status = status;
    this.campos = campos || {};
  }
}

async function pedir(ruta, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${BASE}/api${ruta}`, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', ...opciones.headers },
    });
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor. Revisá tu conexión o si la API está activa.', 0);
  }

  if (respuesta.status === 204) return null;

  const datos = await respuesta.json().catch(() => null);
  if (!respuesta.ok) {
    throw new ErrorApi(datos?.error || `Error ${respuesta.status}`, respuesta.status, datos?.campos);
  }
  return datos;
}

export function listarPublicaciones({ tipo, q, categoria, incluirOcultas } = {}) {
  const params = new URLSearchParams();
  if (tipo) params.set('tipo', tipo);
  if (q) params.set('q', q);
  if (categoria) params.set('categoria', categoria);
  if (incluirOcultas) params.set('incluirOcultas', 'true');
  const query = params.toString();
  return pedir(`/publicaciones${query ? `?${query}` : ''}`);
}

export function obtenerPublicacion(id) {
  return pedir(`/publicaciones/${encodeURIComponent(id)}`);
}

export function crearPublicacion(datos) {
  return pedir('/publicaciones', { method: 'POST', body: JSON.stringify(datos) });
}

export function actualizarPublicacion(id, datos) {
  return pedir(`/publicaciones/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(datos) });
}

export function eliminarPublicacion(id) {
  return pedir(`/publicaciones/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

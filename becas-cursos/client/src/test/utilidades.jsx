import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import App from '../App.jsx';
import { ModoProvider } from '../context/ModoContext.jsx';

export const becaEjemplo = {
  id: 'b1',
  tipo: 'beca',
  titulo: 'Beca de Conectividad',
  descripcion: 'Ayuda para internet',
  institucion: 'Fundación Horizonte',
  categorias: ['tecnología'],
  fechaCierre: '2099-01-10T00:00:00.000Z',
  detalles: { monto: 45000, requisitos: ['Ser alumno regular'] },
  publicado: true,
};

export const cursoOculto = {
  id: 'c1',
  tipo: 'curso',
  titulo: 'Curso de JavaScript',
  descripcion: 'Desde cero',
  institucion: 'Academia Código Abierto',
  categorias: ['programación'],
  detalles: { modalidad: 'virtual', duracion: '8 semanas' },
  publicado: false,
};

function respuesta(status, cuerpo) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(cuerpo),
  });
}

// Reemplaza fetch por un mock que responde según método y URL.
// "rutas" es una función (method, url, body) => [status, cuerpo]
export function mockearApi(rutas) {
  const fetchMock = vi.fn((url, opciones = {}) => {
    const metodo = opciones.method || 'GET';
    const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined;
    const [status, datos] = rutas(metodo, url, cuerpo);
    return respuesta(status, datos);
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export function renderizarApp({ ruta = '/', modo = 'usuario' } = {}) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <ModoProvider modoInicial={modo}>
        <App />
      </ModoProvider>
    </MemoryRouter>
  );
}

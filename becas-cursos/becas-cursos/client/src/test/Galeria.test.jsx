import { describe, expect, test } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { becaEjemplo, cursoOculto, mockearApi, renderizarApp } from './utilidades.jsx';

describe('Galería', () => {
  test('en modo usuario muestra las publicaciones sin acciones de edición', async () => {
    const fetchMock = mockearApi(() => [200, [becaEjemplo]]);
    renderizarApp();

    expect(await screen.findByRole('link', { name: 'Beca de Conectividad' })).toBeInTheDocument();
    expect(screen.getByText('Monto: $ 45.000')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Nueva publicación' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe('/api/publicaciones');
  });

  test('el interruptor pasa a modo administrador y pide también las ocultas', async () => {
    const usuario = userEvent.setup();
    const fetchMock = mockearApi((_m, url) => [200, url.includes('incluirOcultas') ? [becaEjemplo, cursoOculto] : [becaEjemplo]]);
    renderizarApp();
    await screen.findByText('Beca de Conectividad');

    await usuario.click(screen.getByRole('switch', { name: 'Modo administrador' }));

    expect(await screen.findByText('Curso de JavaScript')).toBeInTheDocument();
    expect(screen.getByText('Oculta')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nueva publicación' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith('/api/publicaciones?incluirOcultas=true', expect.anything());
  });

  test('filtra por tipo con los botones', async () => {
    const usuario = userEvent.setup();
    const fetchMock = mockearApi(() => [200, [becaEjemplo]]);
    renderizarApp();
    await screen.findByText('Beca de Conectividad');

    await usuario.click(screen.getByRole('button', { name: 'Cursos' }));
    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith('/api/publicaciones?tipo=curso', expect.anything()));
    expect(screen.getByRole('button', { name: 'Cursos' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('elimina una publicación después de confirmar', async () => {
    const usuario = userEvent.setup();
    const fetchMock = mockearApi((metodo) => (metodo === 'DELETE' ? [204, null] : [200, [becaEjemplo]]));
    renderizarApp({ modo: 'admin' });

    const tarjeta = (await screen.findByText('Beca de Conectividad')).closest('article');
    await usuario.click(within(tarjeta).getByRole('button', { name: 'Eliminar Beca de Conectividad' }));
    expect(within(tarjeta).getByText('¿Eliminar esta publicación?')).toBeInTheDocument();
    await usuario.click(within(tarjeta).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(screen.queryByText('Beca de Conectividad')).not.toBeInTheDocument());
    expect(screen.getByText('Publicación eliminada')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/publicaciones/b1', expect.objectContaining({ method: 'DELETE' }));
  });

  test('muestra el error y permite reintentar si la API no responde', async () => {
    const usuario = userEvent.setup();
    let fallar = true;
    mockearApi(() => (fallar ? [500, { error: 'Error interno del servidor' }] : [200, [becaEjemplo]]));
    renderizarApp();

    expect(await screen.findByText('Error interno del servidor')).toBeInTheDocument();
    fallar = false;
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Beca de Conectividad')).toBeInTheDocument();
  });

  test('las rutas de administración redirigen a la galería en modo usuario', async () => {
    mockearApi(() => [200, [becaEjemplo]]);
    renderizarApp({ ruta: '/admin/nueva' });
    expect(await screen.findByRole('heading', { name: /becas y cursos abiertos/i })).toBeInTheDocument();
  });
});

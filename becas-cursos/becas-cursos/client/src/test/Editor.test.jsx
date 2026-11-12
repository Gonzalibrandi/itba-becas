import { describe, expect, test } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { aPublicacion } from '../pages/EditorPublicacion.jsx';
import { becaEjemplo, mockearApi, renderizarApp } from './utilidades.jsx';

describe('Editor de publicaciones', () => {
  test('valida los campos obligatorios antes de enviar', async () => {
    const usuario = userEvent.setup();
    const fetchMock = mockearApi(() => [200, []]);
    renderizarApp({ ruta: '/admin/nueva', modo: 'admin' });

    await usuario.click(await screen.findByRole('button', { name: 'Crear publicación' }));

    expect(screen.getByText('Escribí un título')).toBeInTheDocument();
    expect(screen.getByText('Indicá qué institución la ofrece')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Título')).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('crea un curso y vuelve a la galería con un mensaje', async () => {
    const usuario = userEvent.setup();
    let enviado;
    mockearApi((metodo, _url, cuerpo) => {
      if (metodo === 'POST') {
        enviado = cuerpo;
        return [201, { ...cuerpo, id: 'n1' }];
      }
      return [200, []];
    });
    renderizarApp({ ruta: '/admin/nueva', modo: 'admin' });

    await usuario.click(await screen.findByLabelText('Curso'));
    await usuario.type(screen.getByLabelText('Título'), 'Curso de Git');
    await usuario.type(screen.getByLabelText('Institución'), 'Academia');
    await usuario.type(screen.getByLabelText('Descripción'), 'Control de versiones');
    await usuario.selectOptions(screen.getByLabelText('Modalidad (opcional)'), 'virtual');
    await usuario.type(screen.getByLabelText('Categorías (opcional)'), 'Programación, herramientas');
    await usuario.click(screen.getByRole('button', { name: 'Crear publicación' }));

    expect(await screen.findByText('Publicación creada')).toBeInTheDocument();
    expect(enviado).toMatchObject({
      tipo: 'curso',
      titulo: 'Curso de Git',
      categorias: ['programación', 'herramientas'],
      detalles: { modalidad: 'virtual' },
      publicado: true,
    });
  });

  test('carga los datos al editar y muestra los errores que devuelve la API', async () => {
    const usuario = userEvent.setup();
    mockearApi((metodo) =>
      metodo === 'PUT'
        ? [400, { error: 'Hay datos inválidos', campos: { 'detalles.monto': 'El monto no puede ser negativo' } }]
        : [200, becaEjemplo]
    );
    renderizarApp({ ruta: '/admin/editar/b1', modo: 'admin' });

    expect(await screen.findByLabelText('Título')).toHaveValue('Beca de Conectividad');
    expect(screen.getByLabelText('Requisitos (opcional)')).toHaveValue('Ser alumno regular');

    await usuario.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Hay datos inválidos');
    await waitFor(() => expect(screen.getByText('El monto no puede ser negativo')).toBeInTheDocument());
  });

  test('aPublicacion solo envía los detalles del tipo elegido', () => {
    const base = {
      tipo: 'beca',
      titulo: ' Beca ',
      institucion: 'X',
      descripcion: 'Y',
      categorias: '',
      fechaCierre: '',
      enlace: '',
      imagenUrl: '',
      modalidad: 'virtual',
      duracion: '4 semanas',
      monto: '1500',
      requisitos: 'Uno\n\n Dos ',
      publicado: false,
    };
    expect(aPublicacion(base).detalles).toEqual({ monto: 1500, requisitos: ['Uno', 'Dos'] });
    expect(aPublicacion(base).titulo).toBe('Beca');
    expect(aPublicacion({ ...base, tipo: 'curso' }).detalles).toEqual({ modalidad: 'virtual', duracion: '4 semanas' });
  });
});

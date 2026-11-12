import { describe, expect, test } from 'vitest';
import { diasHastaCierre, fechaParaInput, formatearFecha, textoCierre } from '../utils/formato.js';

describe('formato de fechas', () => {
  test('muestra el día guardado aunque la zona horaria sea UTC-3', () => {
    expect(formatearFecha('2027-03-15T00:00:00.000Z')).toBe('15 de marzo de 2027');
    expect(fechaParaInput('2027-03-15T00:00:00.000Z')).toBe('2027-03-15');
  });

  test('calcula los días hasta el cierre por fecha calendario', () => {
    const hoy = new Date(2027, 2, 10, 23, 30); // 10/03 a las 23:30 hora local
    expect(diasHastaCierre('2027-03-15T00:00:00.000Z', hoy)).toBe(5);
    expect(textoCierre('2027-03-10T00:00:00.000Z', hoy)).toBe('Cierra hoy');
    expect(textoCierre('2027-03-11T00:00:00.000Z', hoy)).toBe('Cierra mañana');
    expect(textoCierre('2027-03-01T00:00:00.000Z', hoy)).toBe('Inscripción cerrada');
    expect(textoCierre(null, hoy)).toBe('Inscripción abierta todo el año');
  });
});

// Las fechas de cierre se guardan como medianoche UTC ("2027-03-15T00:00:00Z").
// Se formatean en UTC para que en Argentina (UTC-3) no aparezca el día anterior.
const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const formatoMonto = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export const MODALIDADES = {
  presencial: 'Presencial',
  virtual: 'Virtual',
  hibrida: 'Híbrida',
};

export function formatearFecha(fechaIso) {
  if (!fechaIso) return '';
  return formatoFecha.format(new Date(fechaIso));
}

export function formatearMonto(monto) {
  if (monto === undefined || monto === null || monto === '') return '';
  return formatoMonto.format(monto);
}

// Fecha ISO -> "YYYY-MM-DD" para <input type="date">
export function fechaParaInput(fechaIso) {
  return fechaIso ? new Date(fechaIso).toISOString().slice(0, 10) : '';
}

// Días que faltan hasta el cierre (comparando fechas calendario, no horas).
export function diasHastaCierre(fechaIso, hoy = new Date()) {
  if (!fechaIso) return null;
  const cierre = new Date(fechaIso);
  const inicioHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const inicioCierre = Date.UTC(cierre.getUTCFullYear(), cierre.getUTCMonth(), cierre.getUTCDate());
  return Math.round((inicioCierre - inicioHoy) / 86_400_000);
}

export function textoCierre(fechaIso, hoy) {
  const dias = diasHastaCierre(fechaIso, hoy);
  if (dias === null) return 'Inscripción abierta todo el año';
  if (dias < 0) return 'Inscripción cerrada';
  if (dias === 0) return 'Cierra hoy';
  if (dias === 1) return 'Cierra mañana';
  return `Cierra en ${dias} días`;
}

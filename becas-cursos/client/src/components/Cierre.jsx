import { diasHastaCierre, formatearFecha, textoCierre } from '../utils/formato.js';

// Fecha de cierre marcada con "resaltador": amarillo normal,
// rosado si faltan 7 días o menos, gris si ya cerró.
export default function Cierre({ fecha, conFecha = false }) {
  const dias = diasHastaCierre(fecha);
  let variante = 'normal';
  if (dias !== null && dias < 0) variante = 'cerrada';
  else if (dias !== null && dias <= 7) variante = 'urgente';

  return (
    <p className={`cierre cierre--${variante}`}>
      <span className="cierre__marca">{textoCierre(fecha)}</span>
      {conFecha && fecha && <span className="cierre__fecha"> (hasta el {formatearFecha(fecha)})</span>}
    </p>
  );
}

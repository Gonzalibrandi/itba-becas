import { useState } from 'react';
import { Link } from 'react-router-dom';
import Cierre from './Cierre.jsx';
import { MODALIDADES, formatearMonto } from '../utils/formato.js';

function DatoPrincipal({ publicacion }) {
  const { tipo, detalles = {} } = publicacion;
  if (tipo === 'beca' && detalles.monto) {
    return <p className="tarjeta__dato">Monto: {formatearMonto(detalles.monto)}</p>;
  }
  if (tipo === 'curso' && (detalles.modalidad || detalles.duracion)) {
    const partes = [MODALIDADES[detalles.modalidad], detalles.duracion].filter(Boolean);
    return <p className="tarjeta__dato">{partes.join(', ')}</p>;
  }
  return null;
}

export default function Tarjeta({ publicacion, esAdmin, onAlternarVisible, onEliminar }) {
  const [confirmando, setConfirmando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const { id, tipo, titulo, institucion, descripcion, imagenUrl, fechaCierre, publicado } = publicacion;
  const [imagenRota, setImagenRota] = useState(false);

  async function ejecutar(accion) {
    setOcupado(true);
    try {
      await accion();
    } finally {
      setOcupado(false);
    }
  }

  return (
    <article className={`tarjeta tarjeta--${tipo}${publicado ? '' : ' tarjeta--oculta'}`}>
      {imagenUrl && !imagenRota && (
        <img className="tarjeta__imagen" src={imagenUrl} alt="" loading="lazy" onError={() => setImagenRota(true)} />
      )}

      <div className="tarjeta__cuerpo">
        <div className="tarjeta__etiquetas">
          <span className={`etiqueta etiqueta--${tipo}`}>{tipo === 'beca' ? 'Beca' : 'Curso'}</span>
          {!publicado && <span className="etiqueta etiqueta--oculta">Oculta</span>}
        </div>

        <h2 className="tarjeta__titulo">
          <Link to={`/publicaciones/${id}`} className="tarjeta__enlace">
            {titulo}
          </Link>
        </h2>
        <p className="tarjeta__institucion">{institucion}</p>
        <p className="tarjeta__descripcion">{descripcion}</p>
        <DatoPrincipal publicacion={publicacion} />
        <Cierre fecha={fechaCierre} />
      </div>

      {esAdmin && (
        <div className="tarjeta__acciones">
          {confirmando ? (
            <>
              <span className="tarjeta__pregunta">¿Eliminar esta publicación?</span>
              <button
                type="button"
                className="boton boton--peligro boton--chico"
                disabled={ocupado}
                onClick={() => ejecutar(() => onEliminar(id))}
              >
                Eliminar
              </button>
              <button type="button" className="boton boton--chico" onClick={() => setConfirmando(false)}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <Link to={`/admin/editar/${id}`} className="boton boton--chico">
                Editar
              </Link>
              <button
                type="button"
                className="boton boton--chico"
                disabled={ocupado}
                onClick={() => ejecutar(() => onAlternarVisible(publicacion))}
              >
                {publicado ? 'Ocultar' : 'Publicar'}
              </button>
              <button
                type="button"
                className="boton boton--chico boton--texto-peligro"
                aria-label={`Eliminar ${titulo}`}
                onClick={() => setConfirmando(true)}
              >
                Eliminar
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}

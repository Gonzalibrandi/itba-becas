import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Cierre from '../components/Cierre.jsx';
import { useModo } from '../context/ModoContext.jsx';
import { obtenerPublicacion } from '../api/publicaciones.js';
import { MODALIDADES, formatearMonto } from '../utils/formato.js';

export default function Detalle() {
  const { id } = useParams();
  const { esAdmin } = useModo();
  const [publicacion, setPublicacion] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    setPublicacion(null);
    setError(null);
    obtenerPublicacion(id)
      .then((p) => vigente && setPublicacion(p))
      .catch((err) => vigente && setError(err));
    return () => {
      vigente = false;
    };
  }, [id]);

  const volver = (
    <Link to="/" className="volver">
      Volver a la galería
    </Link>
  );

  // Una publicación oculta no se muestra en modo usuario.
  const noDisponible = error?.status === 404 || (publicacion && !publicacion.publicado && !esAdmin);

  if (noDisponible) {
    return (
      <div className="estado">
        <p>Esta publicación no existe o ya no está disponible.</p>
        {volver}
      </div>
    );
  }
  if (error) {
    return (
      <div className="estado">
        <p>{error.message}</p>
        {volver}
      </div>
    );
  }
  if (!publicacion) return <p className="estado">Cargando…</p>;

  const { tipo, titulo, institucion, descripcion, imagenUrl, enlace, categorias, fechaCierre, detalles = {} } =
    publicacion;

  return (
    <article className={`detalle detalle--${tipo}`}>
      {volver}

      <div className="tarjeta__etiquetas">
        <span className={`etiqueta etiqueta--${tipo}`}>{tipo === 'beca' ? 'Beca' : 'Curso'}</span>
        {!publicacion.publicado && <span className="etiqueta etiqueta--oculta">Oculta</span>}
      </div>
      <h1 className="detalle__titulo">{titulo}</h1>
      <p className="detalle__institucion">{institucion}</p>
      <Cierre fecha={fechaCierre} conFecha />

      {imagenUrl && <img className="detalle__imagen" src={imagenUrl} alt="" />}

      <p className="detalle__descripcion">{descripcion}</p>

      <dl className="ficha">
        {tipo === 'beca' && detalles.monto ? (
          <div>
            <dt>Monto</dt>
            <dd>{formatearMonto(detalles.monto)}</dd>
          </div>
        ) : null}
        {tipo === 'curso' && detalles.modalidad && (
          <div>
            <dt>Modalidad</dt>
            <dd>{MODALIDADES[detalles.modalidad]}</dd>
          </div>
        )}
        {tipo === 'curso' && detalles.duracion && (
          <div>
            <dt>Duración</dt>
            <dd>{detalles.duracion}</dd>
          </div>
        )}
        {categorias?.length > 0 && (
          <div>
            <dt>Categorías</dt>
            <dd>{categorias.join(', ')}</dd>
          </div>
        )}
      </dl>

      {tipo === 'beca' && detalles.requisitos?.length > 0 && (
        <section className="requisitos">
          <h2>Requisitos</h2>
          <ul>
            {detalles.requisitos.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="detalle__acciones">
        {enlace && (
          <a className="boton boton--principal" href={enlace} target="_blank" rel="noopener noreferrer">
            {tipo === 'beca' ? 'Ver la convocatoria' : 'Ver el curso'}
            <span className="visualmente-oculto"> (se abre en otra pestaña)</span>
          </a>
        )}
        {esAdmin && (
          <Link to={`/admin/editar/${publicacion.id}`} className="boton">
            Editar publicación
          </Link>
        )}
      </div>
    </article>
  );
}

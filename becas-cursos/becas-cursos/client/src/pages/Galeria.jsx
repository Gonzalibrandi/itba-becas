import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Tarjeta from '../components/Tarjeta.jsx';
import { useModo } from '../context/ModoContext.jsx';
import { actualizarPublicacion, eliminarPublicacion, listarPublicaciones } from '../api/publicaciones.js';

const TIPOS = [
  { valor: '', texto: 'Todo' },
  { valor: 'beca', texto: 'Becas' },
  { valor: 'curso', texto: 'Cursos' },
];

function useDemorado(valor, ms = 300) {
  const [demorado, setDemorado] = useState(valor);
  useEffect(() => {
    const t = setTimeout(() => setDemorado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);
  return demorado;
}

export default function Galeria() {
  const { esAdmin } = useModo();
  const location = useLocation();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const q = useDemorado(busqueda.trim());

  const [publicaciones, setPublicaciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [intento, setIntento] = useState(0);
  const [mensaje, setMensaje] = useState(location.state?.mensaje ?? null);

  // Mensaje que deja el editor al guardar ("Publicación creada", etc.)
  useEffect(() => {
    if (location.state?.mensaje) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(() => setMensaje(null), 4000);
    return () => clearTimeout(t);
  }, [mensaje]);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    listarPublicaciones({ tipo, q, categoria, incluirOcultas: esAdmin })
      .then((datos) => {
        if (!vigente) return;
        setPublicaciones(datos);
        // Las categorías se toman del listado sin filtro de categoría,
        // así los botones no desaparecen al elegir una.
        if (!categoria) {
          setCategorias([...new Set(datos.flatMap((p) => p.categorias))].sort((a, b) => a.localeCompare(b, 'es')));
        }
      })
      .catch((err) => vigente && setError(err.message))
      .finally(() => vigente && setCargando(false));

    return () => {
      vigente = false;
    };
  }, [tipo, q, categoria, esAdmin, intento]);

  const hayFiltros = Boolean(tipo || busqueda || categoria);

  function limpiarFiltros() {
    setTipo('');
    setBusqueda('');
    setCategoria('');
  }

  async function alternarVisible(publicacion) {
    try {
      const actualizada = await actualizarPublicacion(publicacion.id, { publicado: !publicacion.publicado });
      setPublicaciones((lista) => lista.map((p) => (p.id === actualizada.id ? actualizada : p)));
      setMensaje(actualizada.publicado ? 'Publicación visible para estudiantes' : 'Publicación oculta');
    } catch (err) {
      setMensaje(`No se pudo cambiar la visibilidad: ${err.message}`);
    }
  }

  async function eliminar(id) {
    try {
      await eliminarPublicacion(id);
      setPublicaciones((lista) => lista.filter((p) => p.id !== id));
      setMensaje('Publicación eliminada');
    } catch (err) {
      setMensaje(`No se pudo eliminar: ${err.message}`);
    }
  }

  return (
    <>
      <section className="portada">
        <h1 className="portada__titulo">Becas y cursos abiertos para estudiantes</h1>
        <p className="portada__bajada">
          Ayudas económicas y cursos para seguir formándote. Filtrá por tipo o buscá por tema o institución.
        </p>

        <div className="buscador">
          <label htmlFor="busqueda" className="visualmente-oculto">
            Buscar publicaciones
          </label>
          <input
            id="busqueda"
            type="search"
            className="buscador__campo"
            placeholder="Buscar por tema o institución"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </section>

      <div className="barra">
        <div className="segmentos" role="group" aria-label="Tipo de publicación">
          {TIPOS.map((t) => (
            <button
              key={t.valor || 'todo'}
              type="button"
              className="segmentos__opcion"
              aria-pressed={tipo === t.valor}
              onClick={() => setTipo(t.valor)}
            >
              {t.texto}
            </button>
          ))}
        </div>

        {esAdmin && (
          <Link to="/admin/nueva" className="boton boton--principal">
            Nueva publicación
          </Link>
        )}
      </div>

      {categorias.length > 0 && (
        <div className="categorias" role="group" aria-label="Categorías">
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              className="categoria"
              aria-pressed={categoria === c}
              onClick={() => setCategoria(categoria === c ? '' : c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {mensaje && (
        <p className="mensaje" role="status">
          {mensaje}
        </p>
      )}

      {error ? (
        <div className="estado">
          <p>{error}</p>
          <button type="button" className="boton" onClick={() => setIntento((n) => n + 1)}>
            Reintentar
          </button>
        </div>
      ) : cargando && publicaciones.length === 0 ? (
        <p className="estado" aria-live="polite">
          Cargando publicaciones…
        </p>
      ) : publicaciones.length === 0 ? (
        <div className="estado">
          {hayFiltros ? (
            <>
              <p>Ninguna publicación coincide con estos filtros.</p>
              <button type="button" className="boton" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </>
          ) : esAdmin ? (
            <>
              <p>Todavía no hay publicaciones.</p>
              <Link to="/admin/nueva" className="boton boton--principal">
                Crear la primera
              </Link>
            </>
          ) : (
            <p>Por ahora no hay becas ni cursos publicados. Volvé a mirar en unos días.</p>
          )}
        </div>
      ) : (
        <>
          <p className="conteo" aria-live="polite">
            {publicaciones.length === 1 ? '1 publicación' : `${publicaciones.length} publicaciones`}
          </p>
          <div className={`grilla${cargando ? ' grilla--cargando' : ''}`}>
            {publicaciones.map((p) => (
              <Tarjeta
                key={p.id}
                publicacion={p}
                esAdmin={esAdmin}
                onAlternarVisible={alternarVisible}
                onEliminar={eliminar}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

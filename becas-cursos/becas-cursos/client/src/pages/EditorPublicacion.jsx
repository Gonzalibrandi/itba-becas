import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { actualizarPublicacion, crearPublicacion, obtenerPublicacion } from '../api/publicaciones.js';
import { MODALIDADES, fechaParaInput } from '../utils/formato.js';

const VACIO = {
  tipo: 'beca',
  titulo: '',
  institucion: '',
  descripcion: '',
  categorias: '',
  fechaCierre: '',
  enlace: '',
  imagenUrl: '',
  modalidad: '',
  duracion: '',
  monto: '',
  requisitos: '',
  publicado: true,
};

// Documento de la API -> valores del formulario (todo como texto)
function aFormulario(p) {
  return {
    tipo: p.tipo,
    titulo: p.titulo ?? '',
    institucion: p.institucion ?? '',
    descripcion: p.descripcion ?? '',
    categorias: (p.categorias ?? []).join(', '),
    fechaCierre: fechaParaInput(p.fechaCierre),
    enlace: p.enlace ?? '',
    imagenUrl: p.imagenUrl ?? '',
    modalidad: p.detalles?.modalidad ?? '',
    duracion: p.detalles?.duracion ?? '',
    monto: p.detalles?.monto ?? '',
    requisitos: (p.detalles?.requisitos ?? []).join('\n'),
    publicado: p.publicado ?? true,
  };
}

// Valores del formulario -> cuerpo para la API.
// "detalles" solo lleva los campos del tipo elegido.
export function aPublicacion(f) {
  const detalles =
    f.tipo === 'curso'
      ? { modalidad: f.modalidad || undefined, duracion: f.duracion.trim() || undefined }
      : {
          monto: f.monto === '' ? undefined : Number(f.monto),
          requisitos: f.requisitos
            .split('\n')
            .map((r) => r.trim())
            .filter(Boolean),
        };

  return {
    tipo: f.tipo,
    titulo: f.titulo.trim(),
    institucion: f.institucion.trim(),
    descripcion: f.descripcion.trim(),
    categorias: f.categorias
      .split(',')
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean),
    fechaCierre: f.fechaCierre,
    enlace: f.enlace.trim(),
    imagenUrl: f.imagenUrl.trim(),
    detalles,
    publicado: f.publicado,
  };
}

function validar(f) {
  const errores = {};
  if (!f.titulo.trim()) errores.titulo = 'Escribí un título';
  if (!f.institucion.trim()) errores.institucion = 'Indicá qué institución la ofrece';
  if (!f.descripcion.trim()) errores.descripcion = 'Escribí una descripción';
  for (const campo of ['enlace', 'imagenUrl']) {
    if (f[campo].trim() && !/^https?:\/\/\S+$/i.test(f[campo].trim())) {
      errores[campo] = 'Tiene que empezar con http:// o https://';
    }
  }
  if (f.tipo === 'beca' && f.monto !== '' && Number(f.monto) < 0) errores.monto = 'El monto no puede ser negativo';
  return errores;
}

// La API devuelve errores con rutas como "detalles.monto"; acá se usa "monto".
function erroresDeApi(campos = {}) {
  return Object.fromEntries(Object.entries(campos).map(([k, v]) => [k.replace(/^detalles\./, ''), v]));
}

function Campo({ id, etiqueta, error, ayuda, children }) {
  const descripciones = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`campo${error ? ' campo--error' : ''}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': descripciones })}
      {ayuda && (
        <p id={`${id}-ayuda`} className="campo__ayuda">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="campo__error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EditorPublicacion() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [cargando, setCargando] = useState(editando);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    let vigente = true;
    obtenerPublicacion(id)
      .then((p) => vigente && setForm(aFormulario(p)))
      .catch((err) => vigente && setErrorGeneral(err.status === 404 ? 'Esta publicación ya no existe.' : err.message))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [id, editando]);

  function cambiar(e) {
    const { name, type, value, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (errores[name]) setErrores(({ [name]: _quitado, ...resto }) => resto);
  }

  async function guardar(e) {
    e.preventDefault();
    const encontrados = validar(form);
    setErrores(encontrados);
    setErrorGeneral(null);
    if (Object.keys(encontrados).length > 0) {
      document.getElementById(Object.keys(encontrados)[0])?.focus();
      return;
    }

    setGuardando(true);
    try {
      const datos = aPublicacion(form);
      if (editando) await actualizarPublicacion(id, datos);
      else await crearPublicacion(datos);
      navigate('/', { state: { mensaje: editando ? 'Cambios guardados' : 'Publicación creada' } });
    } catch (err) {
      setErrores(erroresDeApi(err.campos));
      setErrorGeneral(err.message);
      setGuardando(false);
    }
  }

  if (cargando) return <p className="estado">Cargando…</p>;

  const esBeca = form.tipo === 'beca';

  return (
    <section className="editor">
      <Link to="/" className="volver">
        Volver a la galería
      </Link>
      <h1 className="editor__titulo">{editando ? 'Editar publicación' : 'Nueva publicación'}</h1>

      {errorGeneral && (
        <p className="alerta" role="alert">
          {errorGeneral}
        </p>
      )}

      <form className="formulario" onSubmit={guardar} noValidate>
        <fieldset className="campo">
          <legend>Tipo</legend>
          <div className="segmentos">
            {['beca', 'curso'].map((t) => (
              <label key={t} className="segmentos__opcion segmentos__opcion--radio">
                <input type="radio" name="tipo" value={t} checked={form.tipo === t} onChange={cambiar} />
                {t === 'beca' ? 'Beca' : 'Curso'}
              </label>
            ))}
          </div>
        </fieldset>

        <Campo id="titulo" etiqueta="Título" error={errores.titulo}>
          {(props) => <input {...props} name="titulo" maxLength={120} value={form.titulo} onChange={cambiar} />}
        </Campo>

        <Campo id="institucion" etiqueta="Institución" error={errores.institucion}>
          {(props) => (
            <input {...props} name="institucion" maxLength={120} value={form.institucion} onChange={cambiar} />
          )}
        </Campo>

        <Campo
          id="descripcion"
          etiqueta="Descripción"
          error={errores.descripcion}
          ayuda={`${form.descripcion.length} de 2000 caracteres`}
        >
          {(props) => (
            <textarea
              {...props}
              name="descripcion"
              rows={5}
              maxLength={2000}
              value={form.descripcion}
              onChange={cambiar}
            />
          )}
        </Campo>

        {esBeca ? (
          <div className="formulario__par">
            <Campo id="monto" etiqueta="Monto en pesos (opcional)" error={errores.monto}>
              {(props) => (
                <input
                  {...props}
                  name="monto"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.monto}
                  onChange={cambiar}
                />
              )}
            </Campo>
            <Campo
              id="requisitos"
              etiqueta="Requisitos (opcional)"
              error={errores.requisitos}
              ayuda="Uno por línea"
            >
              {(props) => (
                <textarea {...props} name="requisitos" rows={4} value={form.requisitos} onChange={cambiar} />
              )}
            </Campo>
          </div>
        ) : (
          <div className="formulario__par">
            <Campo id="modalidad" etiqueta="Modalidad (opcional)" error={errores.modalidad}>
              {(props) => (
                <select {...props} name="modalidad" value={form.modalidad} onChange={cambiar}>
                  <option value="">Sin especificar</option>
                  {Object.entries(MODALIDADES).map(([valor, texto]) => (
                    <option key={valor} value={valor}>
                      {texto}
                    </option>
                  ))}
                </select>
              )}
            </Campo>
            <Campo id="duracion" etiqueta="Duración (opcional)" error={errores.duracion} ayuda="Por ejemplo: 8 semanas">
              {(props) => (
                <input {...props} name="duracion" maxLength={60} value={form.duracion} onChange={cambiar} />
              )}
            </Campo>
          </div>
        )}

        <div className="formulario__par">
          <Campo
            id="fechaCierre"
            etiqueta="Cierre de inscripción (opcional)"
            error={errores.fechaCierre}
            ayuda="Si la dejás vacía, se muestra como abierta todo el año"
          >
            {(props) => (
              <input {...props} name="fechaCierre" type="date" value={form.fechaCierre} onChange={cambiar} />
            )}
          </Campo>
          <Campo
            id="categorias"
            etiqueta="Categorías (opcional)"
            error={errores.categorias}
            ayuda="Separadas por coma, por ejemplo: grado, ingeniería"
          >
            {(props) => <input {...props} name="categorias" value={form.categorias} onChange={cambiar} />}
          </Campo>
        </div>

        <Campo id="enlace" etiqueta="Enlace a la convocatoria (opcional)" error={errores.enlace}>
          {(props) => (
            <input
              {...props}
              name="enlace"
              type="url"
              placeholder="https://"
              value={form.enlace}
              onChange={cambiar}
            />
          )}
        </Campo>

        <Campo id="imagenUrl" etiqueta="URL de una imagen (opcional)" error={errores.imagenUrl}>
          {(props) => (
            <input
              {...props}
              name="imagenUrl"
              type="url"
              placeholder="https://"
              value={form.imagenUrl}
              onChange={cambiar}
            />
          )}
        </Campo>

        <label className="casilla">
          <input type="checkbox" name="publicado" checked={form.publicado} onChange={cambiar} />
          Visible para estudiantes
        </label>

        <div className="formulario__acciones">
          <button type="submit" className="boton boton--principal" disabled={guardando}>
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear publicación'}
          </button>
          <Link to="/" className="boton">
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}

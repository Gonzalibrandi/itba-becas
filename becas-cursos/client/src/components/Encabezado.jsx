import { Link } from 'react-router-dom';
import { useModo } from '../context/ModoContext.jsx';

export default function Encabezado() {
  const { esAdmin, alternarModo } = useModo();

  return (
    <header className={`encabezado${esAdmin ? ' encabezado--admin' : ''}`}>
      <div className="contenedor encabezado__fila">
        <Link to="/" className="marca">
          <span className="marca__resaltado">Cursos y becas</span>
        </Link>

        <label className="interruptor">
          <span className="interruptor__texto" aria-hidden="true">
            <span className="solo-ancho">Modo administrador</span>
            <span className="solo-angosto">Admin</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={esAdmin}
            aria-label="Modo administrador"
            className="interruptor__control"
            onClick={alternarModo}
          >
            <span className="interruptor__perilla" />
          </button>
        </label>
      </div>

      {esAdmin && (
        <p className="aviso-admin" role="status">
          <span className="contenedor">
            Estás editando: podés crear, ocultar, modificar y eliminar publicaciones. Apagá el modo administrador
            para ver la página como la ve un estudiante.
          </span>
        </p>
      )}
    </header>
  );
}

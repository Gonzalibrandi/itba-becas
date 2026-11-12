import { Link } from 'react-router-dom';

export default function NoEncontrada() {
  return (
    <div className="estado">
      <h1 className="estado__titulo">Esta página no existe</h1>
      <p>Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <Link to="/" className="boton boton--principal">
        Ir a la galería
      </Link>
    </div>
  );
}

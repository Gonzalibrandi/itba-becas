import { Navigate, Route, Routes } from 'react-router-dom';
import Encabezado from './components/Encabezado.jsx';
import Galeria from './pages/Galeria.jsx';
import Detalle from './pages/Detalle.jsx';
import EditorPublicacion from './pages/EditorPublicacion.jsx';
import NoEncontrada from './pages/NoEncontrada.jsx';
import { useModo } from './context/ModoContext.jsx';

// Las pantallas de edición solo existen en modo administrador.
// Si alguien pasa a modo usuario estando en una, vuelve a la galería.
function SoloAdmin({ children }) {
  const { esAdmin } = useModo();
  return esAdmin ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <Encabezado />
      <main id="contenido" className="contenedor">
        <Routes>
          <Route path="/" element={<Galeria />} />
          <Route path="/publicaciones/:id" element={<Detalle />} />
          <Route
            path="/admin/nueva"
            element={
              <SoloAdmin>
                <EditorPublicacion />
              </SoloAdmin>
            }
          />
          <Route
            path="/admin/editar/:id"
            element={
              <SoloAdmin>
                <EditorPublicacion />
              </SoloAdmin>
            }
          />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
      <footer className="pie contenedor">
        <p>Proyecto académico. Las publicaciones de ejemplo son ficticias.</p>
      </footer>
    </>
  );
}

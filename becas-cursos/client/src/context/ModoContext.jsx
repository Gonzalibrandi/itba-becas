import { createContext, useContext, useEffect, useState } from 'react';

// Modo de vista: "usuario" (solo lectura) o "admin" (CRUD).
// No es autenticación: es un interruptor de interfaz para el proyecto.
const ModoContext = createContext(null);
const CLAVE = 'becas-cursos:modo';

function leerModoGuardado() {
  try {
    return localStorage.getItem(CLAVE) === 'admin' ? 'admin' : 'usuario';
  } catch {
    return 'usuario';
  }
}

export function ModoProvider({ children, modoInicial }) {
  const [modo, setModo] = useState(() => modoInicial ?? leerModoGuardado());

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, modo);
    } catch {
      // Sin localStorage (modo privado, etc.): el modo dura hasta recargar.
    }
  }, [modo]);

  const valor = {
    modo,
    esAdmin: modo === 'admin',
    alternarModo: () => setModo((m) => (m === 'admin' ? 'usuario' : 'admin')),
  };

  return <ModoContext.Provider value={valor}>{children}</ModoContext.Provider>;
}

export function useModo() {
  const contexto = useContext(ModoContext);
  if (!contexto) throw new Error('useModo debe usarse dentro de <ModoProvider>');
  return contexto;
}

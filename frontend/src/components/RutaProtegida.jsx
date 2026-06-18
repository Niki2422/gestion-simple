// ============================================================
// RutaProtegida.jsx  —  multi-consorcio
// Ubicación: src/components/RutaProtegida.jsx
//
// Además de validar sesión y rol_plataforma, valida que el
// :cid de la URL coincida con un consorcio al que el usuario
// tiene acceso. Esto evita que alguien edite la URL a mano
// y entre a un consorcio ajeno (la API igual lo bloquearía,
// pero esto da una redirección amigable en el frontend).
//
// Uso:
//   <RutaProtegida><DashboardPage /></RutaProtegida>
//   <RutaProtegida rolesPlataforma={['administrador']}>...</RutaProtegida>
// ============================================================

import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RutaProtegida = ({ children, rolesPlataforma }) => {
  const { usuario, cargando, consorcioActual } = useAuth();
  const location = useLocation();
  const { cid }   = useParams();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-6 h-6 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (rolesPlataforma && !rolesPlataforma.includes(usuario.rol_plataforma)) {
    return <Navigate to="/consorcios" replace />;
  }

  // Si la ruta tiene :cid, debe coincidir con el consorcio activo guardado.
  // Si no hay consorcio activo o no coincide, mandamos al selector.
  // (La verificación real de pertenencia ya la hace el backend en cada request;
  //  esto es solo para que el sidebar/links del frontend no queden inconsistentes)
  if (cid && (!consorcioActual || String(consorcioActual.id) !== String(cid))) {
    return <Navigate to="/consorcios" replace />;
  }

  return children;
};

export default RutaProtegida;
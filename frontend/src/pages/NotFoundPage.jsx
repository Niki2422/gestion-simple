// ============================================================
// NotFoundPage.jsx
// Ubicación: src/pages/NotFoundPage.jsx
// ============================================================

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icon = ({ path, size = 20, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none"
    stroke="currentColor" viewBox="0 0 24 24" style={{ minWidth: size, minHeight: size }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

const ICONS = {
  atras:   'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
  home:    'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  edificio:'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
};

export default function NotFoundPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[hsl(222,47%,7%)] p-6">

      {/* Número 404 decorativo */}
      <div className="relative mb-8 select-none">
        <span className="text-[160px] font-bold leading-none text-white/[0.03]">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-400/10 border border-emerald-400/20
                          flex items-center justify-center">
            <Icon path={ICONS.edificio} size={36} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Mensaje */}
      <div className="text-center space-y-2 mb-8 max-w-sm">
        <h1 className="text-white text-2xl font-semibold">Página no encontrada</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          La ruta <span className="text-slate-400 font-mono text-xs bg-slate-800 px-2 py-0.5 rounded">
            {location.pathname}
          </span> no existe.
        </p>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 border border-white/[0.08] text-slate-400
                     hover:text-white hover:border-white/[0.15] px-5 py-2.5 rounded-lg
                     text-sm transition-all duration-150">
          <Icon path={ICONS.atras} size={16} />
          Volver atrás
        </button>
        <button onClick={() => navigate(usuario ? '/dashboard' : '/login')}
          className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300
                     text-slate-900 font-semibold px-5 py-2.5 rounded-lg
                     text-sm transition-all duration-150">
          <Icon path={ICONS.home} size={16} />
          {usuario ? 'Ir al dashboard' : 'Ir al login'}
        </button>
      </div>

      {/* Línea decorativa superior */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400/0 via-emerald-400/50 to-emerald-400/0" />
    </div>
  );
}
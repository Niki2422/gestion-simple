// ============================================================
// Layout.jsx — Sidebar compartido entre todas las páginas
// Ubicación: src/components/Layout.jsx
// ============================================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const Icon = ({ path, size = 18, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none"
    stroke="currentColor" viewBox="0 0 24 24" style={{ minWidth: size, minHeight: size }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

const ICONS = {
  edificio:     'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  dashboard:    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  calendario:   'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  gasto:        'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  expensa:      'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  usuarios:     'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  presupuesto:  'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  logout:       'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75',
  hamburger:    'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
  x:            'M6 18L18 6M6 6l12 12',
  llave:        'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z',
  check:        'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  ojo:          'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  ojoCerrado:   'M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88',
};

// Ítems base (todos los roles)
const NAV_BASE = [
  { path: '/dashboard',    icon: 'dashboard',    label: 'Dashboard' },
  { path: '/expensas',     icon: 'expensa',      label: 'Expensas' },
  { path: '/presupuestos', icon: 'presupuesto',  label: 'Presupuestos' },
  { path: '/unidades',     icon: 'edificio',     label: 'Unidades' },
  { path: '/periodos',     icon: 'calendario',   label: 'Períodos' },
];

// Ítems extra solo para admin
const NAV_ADMIN = [
  { path: '/gastos',   icon: 'gasto',    label: 'Gastos' },
  { path: '/usuarios', icon: 'usuarios', label: 'Usuarios' },
];

// ── Input contraseña reutilizable ──────────────────────────
const InputPass = ({ label, value, ver, onVer, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-slate-400 text-xs uppercase tracking-wider">{label}</label>
    <div className="relative flex items-center">
      <input type={ver ? 'text' : 'password'} value={value} onChange={onChange}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-4 pr-10 py-2.5
                   text-white text-sm placeholder:text-slate-600
                   focus:outline-none focus:border-emerald-400/50 transition-all" />
      <button type="button" onClick={onVer}
        className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors">
        <Icon path={ver ? ICONS.ojo : ICONS.ojoCerrado} size={15} />
      </button>
    </div>
  </div>
);

// ── Modal cambiar contraseña ───────────────────────────────
function ModalContrasena({ onCerrar }) {
  const [form, setForm]           = useState({ actual: '', nueva: '', confirmar: '' });
  const [verActual, setVerActual] = useState(false);
  const [verNueva, setVerNueva]   = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');
  const [exito, setExito]         = useState(false);

  const handleGuardar = async () => {
    setError('');
    if (!form.actual || !form.nueva || !form.confirmar) {
      setError('Completá todos los campos'); return;
    }
    if (form.nueva.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres'); return;
    }
    if (form.nueva !== form.confirmar) {
      setError('Las contraseñas nuevas no coinciden'); return;
    }
    setGuardando(true);
    try {
      await api.patch('/usuarios/mi-contrasena', {
        contrasenaActual: form.actual,
        contrasenaNueva:  form.nueva,
      });
      setExito(true);
      setTimeout(() => onCerrar(), 1500);
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al cambiar la contraseña');
    } finally { setGuardando(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-[hsl(222,47%,10%)] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Cambiar contraseña</h3>
          <button onClick={onCerrar} className="text-slate-500 hover:text-white transition-colors">
            <Icon path={ICONS.x} size={18} />
          </button>
        </div>

        {exito ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
              <Icon path={ICONS.check} size={22} className="text-emerald-400" />
            </div>
            <p className="text-emerald-400 text-sm font-medium">Contraseña actualizada</p>
          </div>
        ) : (
          <div className="space-y-3">
            <InputPass label="Contraseña actual" value={form.actual} ver={verActual}
              onVer={() => setVerActual(!verActual)}
              onChange={e => { setForm({...form, actual: e.target.value}); setError(''); }} />
            <InputPass label="Nueva contraseña" value={form.nueva} ver={verNueva}
              onVer={() => setVerNueva(!verNueva)}
              onChange={e => { setForm({...form, nueva: e.target.value}); setError(''); }} />
            <InputPass label="Confirmar nueva contraseña" value={form.confirmar} ver={verNueva}
              onVer={() => setVerNueva(!verNueva)}
              onChange={e => { setForm({...form, confirmar: e.target.value}); setError(''); }} />

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button onClick={onCerrar}
                className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white
                           rounded-lg py-2.5 text-sm transition-all">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando}
                className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold
                           rounded-lg py-2.5 text-sm transition-all disabled:opacity-50
                           flex items-center justify-center gap-2">
                {guardando && <div className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />}
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────
export default function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const esAdmin   = usuario?.rol === 'administrador';
  const [abierto, setAbierto]         = useState(false);
  const [modalPass, setModalPass]     = useState(false);
  const [modalLogout, setModalLogout] = useState(false);

  const navItems = esAdmin ? [...NAV_BASE, ...NAV_ADMIN] : NAV_BASE;

  const irA = (path) => { navigate(path); setAbierto(false); };

  const SidebarContenido = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/30
                        flex items-center justify-center shrink-0">
          <Icon path={ICONS.edificio} size={16} className="text-emerald-400" />
        </div>
        <span className="text-white text-sm font-semibold tracking-wide">Consorcio</span>
      </div>

      {/* Nav */}
      {navItems.map(item => {
        const active = location.pathname === item.path;
        return (
          <button key={item.path} onClick={() => irA(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
              ${active
                ? 'bg-emerald-400/10 text-emerald-400 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
            <Icon path={ICONS[item.icon]} size={18} className="shrink-0" />
            {item.label}
          </button>
        );
      })}

      {/* Usuario + acciones */}
      <div className="mt-auto border-t border-white/[0.06] pt-4">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
            <span className="text-emerald-400 text-xs font-semibold">
              {usuario?.nombre?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{usuario?.nombre ?? 'Usuario'}</p>
            <p className="text-slate-500 text-xs capitalize">{usuario?.rol ?? ''}</p>
          </div>
        </div>

        <button onClick={() => { setModalPass(true); setAbierto(false); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500
                     hover:text-slate-300 hover:bg-white/[0.04] text-sm transition-all duration-150">
          <Icon path={ICONS.llave} size={16} className="shrink-0" />
          Cambiar contraseña
        </button>

        <button onClick={() => { setModalLogout(true); setAbierto(false); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500
                     hover:text-red-400 hover:bg-red-400/[0.06] text-sm transition-all duration-150">
          <Icon path={ICONS.logout} size={16} className="shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-[hsl(222,47%,7%)]">

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-white/[0.06] p-4 gap-1">
        <SidebarContenido />
      </aside>

      {/* Drawer mobile */}
      {abierto && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAbierto(false)} />
          <div className="relative z-50 w-72 bg-[hsl(222,47%,8%)] border-r border-white/[0.06]
                          flex flex-col p-4 gap-1 animate-fade-in">
            <button onClick={() => setAbierto(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
              <Icon path={ICONS.x} size={20} />
            </button>
            <SidebarContenido />
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra mobile */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3
                        border-b border-white/[0.06] bg-[hsl(222,47%,7%)] sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-400/10 border border-emerald-400/30
                            flex items-center justify-center shrink-0">
              <Icon path={ICONS.edificio} size={14} className="text-emerald-400" />
            </div>
            <span className="text-white text-sm font-semibold">Consorcio</span>
          </div>
          <button onClick={() => setAbierto(true)}
            className="text-slate-400 hover:text-white transition-colors p-1">
            <Icon path={ICONS.hamburger} size={22} />
          </button>
        </div>

        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>

      {/* Modal cambiar contraseña */}
      {modalPass && <ModalContrasena onCerrar={() => setModalPass(false)} />}

      {modalLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-[hsl(222,47%,10%)] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20
                            flex items-center justify-center mx-auto">
              <Icon path={ICONS.logout} size={22} className="text-red-400" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-white font-semibold">Cerrar sesión</h3>
              <p className="text-slate-400 text-sm">¿Estás seguro que querés salir?</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalLogout(false)}
                className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white
                           rounded-lg py-2.5 text-sm transition-all">
                Cancelar
              </button>
              <button onClick={() => { logout(); navigate('/login'); }}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold
                           rounded-lg py-2.5 text-sm transition-all">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
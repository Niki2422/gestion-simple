// ============================================================
// ConsorciosPage.jsx
// Ubicación: src/pages/ConsorciosPage.jsx
//
// Pantalla intermedia entre login y dashboard.
//   - admin plataforma: ve los consorcios que administra, puede crear
//   - propietario/inquilino: ve los consorcios donde es miembro
//
// Al elegir uno, guarda el consorcio activo en AuthContext
// y navega a /consorcios/:cid/dashboard
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate }  from 'react-router-dom';
import { useAuth }      from '../context/AuthContext';
import EmptyState       from '../components/EmptyState';
import api              from '../lib/api';

const Icon = ({ path, size = 18, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none"
    stroke="currentColor" viewBox="0 0 24 24" style={{ minWidth: size, minHeight: size }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

const ICONS = {
  edificio:  'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  mas:       'M12 4.5v15m7.5-7.5h-15',
  usuarios:  'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  flecha:    'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3',
  logout:    'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75',
  x:         'M6 18L18 6M6 6l12 12',
  ubicacion: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
};

const Spinner = ({ size = 5 }) => (
  <div className={`w-${size} h-${size} rounded-full border-2 border-emerald-400 border-t-transparent animate-spin`} />
);

const ROL_LABEL = {
  administrador: 'Administrador',
  propietario:   'Propietario',
  inquilino:     'Inquilino',
};

export default function ConsorciosPage() {
  const { usuario, logout, setConsorcioActual } = useAuth();
  const navigate   = useNavigate();
  const esAdminPlataforma = usuario?.rol_plataforma === 'administrador';

  const [lista,      setLista]      = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState('');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [form,       setForm]       = useState({ nombre: '', direccion: '' });
  const [guardando,  setGuardando]  = useState(false);
  const [errorForm,  setErrorForm]  = useState('');

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await api.get('/consorcios');
      setLista(r.data.datos);
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al cargar consorcios');
    } finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleEntrar = (consorcio) => {
    setConsorcioActual(consorcio);
    navigate(`/consorcios/${consorcio.id}/dashboard`);
  };

  const handleCrear = async () => {
    setErrorForm('');
    if (!form.nombre.trim())    return setErrorForm('El nombre es requerido');
    if (!form.direccion.trim()) return setErrorForm('La dirección es requerida');
    setGuardando(true);
    try {
      await api.post('/consorcios', form);
      setModalNuevo(false);
      setForm({ nombre: '', direccion: '' });
      cargar();
    } catch (e) {
      setErrorForm(e.response?.data?.mensaje || 'Error al crear el consorcio');
    } finally { setGuardando(false); }
  };

  return (
    <div className="min-h-screen bg-[hsl(222,47%,7%)] flex flex-col">

      {/* Header simple */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/30
                          flex items-center justify-center shrink-0">
            <Icon path={ICONS.edificio} size={16} className="text-emerald-400" />
          </div>
          <span className="text-white text-sm font-semibold tracking-wide">Consorcio</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-400/20 flex items-center justify-center shrink-0">
              <span className="text-emerald-400 text-xs font-semibold">
                {usuario?.nombre?.charAt(0)?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <span className="text-slate-400 text-sm hidden sm:inline">{usuario?.nombre}</span>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="text-slate-500 hover:text-red-400 transition-colors p-1.5">
            <Icon path={ICONS.logout} size={18} />
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-xl font-semibold">
              {esAdminPlataforma ? 'Tus consorcios' : 'Consorcios donde participás'}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {esAdminPlataforma
                ? 'Elegí un consorcio para gestionar o creá uno nuevo.'
                : 'Elegí el consorcio al que querés ingresar.'}
            </p>
          </div>
          {esAdminPlataforma && (
            <button onClick={() => setModalNuevo(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg shrink-0
                         bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/20
                         hover:border-emerald-400/40 text-emerald-400 text-sm font-medium transition-all">
              <Icon path={ICONS.mas} size={15} />
              Nuevo consorcio
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-32"><Spinner size={8} /></div>
        ) : lista.length === 0 ? (
          <EmptyState
            icon={ICONS.edificio}
            titulo={esAdminPlataforma ? 'Todavía no creaste ningún consorcio' : 'No participás de ningún consorcio'}
            descripcion={esAdminPlataforma
              ? 'Creá tu primer consorcio para empezar a gestionar unidades, gastos y expensas.'
              : 'Pedile al administrador de tu edificio que te agregue como propietario o inquilino.'}
            accion={esAdminPlataforma ? 'Crear primer consorcio' : undefined}
            onAccion={esAdminPlataforma ? () => setModalNuevo(true) : undefined}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {lista.map(c => (
              <button key={c.id} onClick={() => handleEntrar(c)}
                className="bg-slate-900/60 border border-white/[0.06] hover:border-emerald-400/30
                           rounded-xl p-5 text-left transition-all group space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-400/10 border border-emerald-400/20
                                  flex items-center justify-center shrink-0">
                    <Icon path={ICONS.edificio} size={18} className="text-emerald-400" />
                  </div>
                  <Icon path={ICONS.flecha} size={16}
                    className="text-slate-600 group-hover:text-emerald-400 transition-colors mt-2" />
                </div>
                <div>
                  <p className="text-white font-medium">{c.nombre}</p>
                  <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                    <Icon path={ICONS.ubicacion} size={12} />
                    {c.direccion}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-white/[0.06]">
                  <span className="text-emerald-400/80 font-medium">
                    {ROL_LABEL[c.mi_rol] || 'Administrador'}
                  </span>
                  {c.total_miembros !== undefined && (
                    <span className="flex items-center gap-1">
                      <Icon path={ICONS.usuarios} size={11} />
                      {c.total_miembros} miembro{c.total_miembros !== 1 ? 's' : ''}
                    </span>
                  )}
                  {c.total_unidades !== undefined && (
                    <span>{c.total_unidades} unidad{c.total_unidades !== 1 ? 'es' : ''}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Modal nuevo consorcio */}
      {modalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="bg-[hsl(222,47%,10%)] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">Nuevo consorcio</h3>
              <button onClick={() => { setModalNuevo(false); setErrorForm(''); }}
                className="text-slate-500 hover:text-white transition-colors">
                <Icon path={ICONS.x} size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Nombre *</label>
                <input value={form.nombre}
                  onChange={e => { setForm({ ...form, nombre: e.target.value }); setErrorForm(''); }}
                  placeholder="Ej: Edificio Lemos"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                             text-white text-sm placeholder:text-slate-600
                             focus:outline-none focus:border-emerald-400/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Dirección *</label>
                <input value={form.direccion}
                  onChange={e => { setForm({ ...form, direccion: e.target.value }); setErrorForm(''); }}
                  placeholder="Ej: Humberto Primo 366"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                             text-white text-sm placeholder:text-slate-600
                             focus:outline-none focus:border-emerald-400/50 transition-all" />
              </div>

              {errorForm && <p className="text-red-400 text-xs">{errorForm}</p>}

              <div className="flex gap-3 pt-1">
                <button onClick={() => { setModalNuevo(false); setErrorForm(''); }}
                  className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white rounded-lg py-2.5 text-sm transition-all">
                  Cancelar
                </button>
                <button onClick={handleCrear} disabled={guardando}
                  className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold
                             rounded-lg py-2.5 text-sm transition-all disabled:opacity-50
                             flex items-center justify-center gap-2">
                  {guardando && <Spinner size={4} />}
                  {guardando ? 'Creando…' : 'Crear consorcio'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ============================================================
// PresupuestosPage.jsx
// Ubicación: src/pages/PresupuestosPage.jsx
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { useAuth }   from '../context/AuthContext';
import Layout        from '../components/Layout';
import EmptyState    from '../components/EmptyState';
import api           from '../lib/api';

// ── Primitivos ─────────────────────────────────────────────
const Icon = ({ path, size = 18, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none"
    stroke="currentColor" viewBox="0 0 24 24" style={{ minWidth: size, minHeight: size }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

const ICONS = {
  mas:        'M12 4.5v15m7.5-7.5h-15',
  basura:     'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
  alerta:     'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  check:      'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  x:          'M6 18L18 6M6 6l12 12',
  atras:      'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
  presupuesto:'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  voto:       'M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z',
  reloj:      'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  candado:    'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  trofeo:     'M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0',
  calendario: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  flecha:     'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3',
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const formatPeriodo = (p) => {
  if (!p) return '—';
  const [a, m] = p.split('-');
  return `${MESES[parseInt(m) - 1]} ${a}`;
};
const fmt = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;
const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-AR') : '—';

const Spinner = ({ size = 5 }) => (
  <div className={`w-${size} h-${size} rounded-full border-2 border-emerald-400 border-t-transparent animate-spin`} />
);

const Modal = ({ titulo, onCerrar, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-[hsl(222,47%,10%)] border border-white/[0.08] rounded-2xl p-6 w-full max-w-lg space-y-5
                    max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{titulo}</h3>
        {onCerrar && (
          <button onClick={onCerrar} className="text-slate-500 hover:text-white transition-colors">
            <Icon path={ICONS.x} size={18} />
          </button>
        )}
      </div>
      {children}
    </div>
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const estilos = {
    default:  'bg-slate-700/50 text-slate-300',
    success:  'bg-emerald-400/15 text-emerald-400 border border-emerald-400/20',
    warning:  'bg-amber-400/15 text-amber-400 border border-amber-400/20',
    info:     'bg-sky-400/15 text-sky-400 border border-sky-400/20',
    muted:    'bg-slate-700/30 text-slate-500',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${estilos[variant]}`}>
      {children}
    </span>
  );
};

const BADGE_ESTADO = {
  abierta: { label: 'Cargando presupuestos', variant: 'info' },
  votando: { label: 'Votación activa',       variant: 'warning' },
  cerrada: { label: 'Cerrada',               variant: 'muted' },
};

// ── Meses disponibles para selector ───────────────────────
const mesesDisponibles = () => {
  const meses = [];
  const hoy = new Date();
  for (let i = -1; i <= 11; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    meses.push({ val, label: formatPeriodo(val) });
  }
  return meses;
};

// ── Barra de votos ─────────────────────────────────────────
const BarraVotos = ({ votos, totalVotos, ganador }) => {
  const pct = totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500">{votos} voto{votos !== 1 ? 's' : ''}</span>
        <span className={ganador ? 'text-emerald-400 font-semibold' : 'text-slate-600'}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${ganador ? 'bg-emerald-400' : 'bg-slate-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────
// Vista de detalle de una licitación
// ──────────────────────────────────────────────────────────
function DetalleLicitacion({ licitacionId, esAdmin, onVolver, onActualizar }) {
  const [datos,       setDatos]       = useState(null);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState('');
  const [votando,     setVotando]     = useState(false);
  const [modalItem,   setModalItem]   = useState(false);
  const [formItem,    setFormItem]    = useState({ proveedor: '', articulos: '', manoDeObra: '', tiempoEstimado: '', total: '', notas: '' });
  const [guardando,   setGuardando]   = useState(false);
  const [errorForm,   setErrorForm]   = useState('');
  const [toast,       setToast]       = useState('');

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const r = await api.get(`/presupuestos/${licitacionId}`);
      setDatos(r.data.datos);
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al cargar');
    } finally { setCargando(false); }
  }, [licitacionId]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleVotar = async (presupuestoId) => {
    setVotando(presupuestoId);
    try {
      await api.post(`/presupuestos/${licitacionId}/votar`, { presupuestoId });
      mostrarToast('¡Voto registrado!');
      cargar();
      onActualizar?.();
    } catch (e) {
      mostrarToast(e.response?.data?.mensaje || 'Error al votar');
    } finally { setVotando(false); }
  };

  const handleCambiarEstado = async (estado) => {
    try {
      await api.patch(`/presupuestos/${licitacionId}/estado`, { estado });
      mostrarToast(estado === 'votando' ? 'Votación iniciada' : estado === 'cerrada' ? 'Votación cerrada' : 'Estado actualizado');
      cargar();
      onActualizar?.();
    } catch (e) {
      mostrarToast(e.response?.data?.mensaje || 'Error al cambiar estado');
    }
  };

  const handleEliminarItem = async (itemId) => {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    try {
      await api.delete(`/presupuestos/${licitacionId}/items/${itemId}`);
      mostrarToast('Presupuesto eliminado');
      cargar();
    } catch (e) {
      mostrarToast(e.response?.data?.mensaje || 'Error al eliminar');
    }
  };

  const handleGuardarItem = async () => {
    setErrorForm('');
    if (!formItem.proveedor.trim()) return setErrorForm('El proveedor es requerido');
    if (!formItem.total || isNaN(formItem.total)) return setErrorForm('El total es requerido');
    setGuardando(true);
    try {
      await api.post(`/presupuestos/${licitacionId}/items`, {
        ...formItem,
        manoDeObra: parseFloat(formItem.manoDeObra) || 0,
        total:      parseFloat(formItem.total),
      });
      setModalItem(false);
      setFormItem({ proveedor: '', articulos: '', manoDeObra: '', tiempoEstimado: '', total: '', notas: '' });
      mostrarToast('Presupuesto agregado');
      cargar();
    } catch (e) {
      setErrorForm(e.response?.data?.mensaje || 'Error al guardar');
    } finally { setGuardando(false); }
  };

  if (cargando) return (
    <div className="flex items-center justify-center py-32"><Spinner size={8} /></div>
  );
  if (error || !datos) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <p className="text-red-400 text-sm">{error || 'No encontrado'}</p>
      <button onClick={onVolver} className="text-emerald-400 text-sm hover:underline">← Volver</button>
    </div>
  );

  const { presupuestos = [], miVoto, estado } = datos;
  const totalVotos = presupuestos.reduce((s, p) => s + (p.votos || 0), 0);
  const maxVotos   = Math.max(...presupuestos.map(p => p.votos || 0), 0);
  const badge      = BADGE_ESTADO[estado] || BADGE_ESTADO.abierta;
  const puedevotar = estado === 'votando';
  const cerrada    = estado === 'cerrada';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-page-in">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 border border-white/[0.1] rounded-xl px-4 py-3
                        text-slate-200 text-sm shadow-xl flex items-center gap-2 animate-fade-in">
          <Icon path={ICONS.check} size={16} className="text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={onVolver}
          className="text-slate-500 hover:text-white transition-colors mt-0.5 shrink-0">
          <Icon path={ICONS.atras} size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            <Badge variant="default">{formatPeriodo(datos.periodo)}</Badge>
            {datos.caduca_en && (
              <span className="flex items-center gap-1 text-slate-500 text-xs">
                <Icon path={ICONS.reloj} size={12} />
                Caduca {formatFecha(datos.caduca_en)}
              </span>
            )}
          </div>
          <h1 className="text-white text-xl font-semibold">{datos.titulo}</h1>
          {datos.descripcion && <p className="text-slate-400 text-sm mt-1">{datos.descripcion}</p>}
        </div>
      </div>

      {/* Acciones de estado — solo admin */}
      {esAdmin && (
        <div className="flex flex-wrap gap-2">
          {estado === 'abierta' && (
            <button onClick={() => handleCambiarEstado('votando')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20
                         hover:bg-amber-500/20 text-amber-400 text-sm font-medium transition-all">
              <Icon path={ICONS.voto} size={15} />
              Iniciar votación
            </button>
          )}
          {estado === 'votando' && (
            <button onClick={() => handleCambiarEstado('cerrada')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20
                         hover:bg-red-500/20 text-red-400 text-sm font-medium transition-all">
              <Icon path={ICONS.candado} size={15} />
              Cerrar votación
            </button>
          )}
          {estado === 'abierta' && (
            <button onClick={() => setModalItem(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20
                         hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium transition-all ml-auto">
              <Icon path={ICONS.mas} size={15} />
              Agregar presupuesto
            </button>
          )}
        </div>
      )}

      {/* Info de votación para propietario */}
      {!esAdmin && puedevotar && (
        <div className="bg-amber-400/5 border border-amber-400/15 rounded-xl px-4 py-3 flex items-center gap-3">
          <Icon path={ICONS.voto} size={18} className="text-amber-400 shrink-0" />
          <p className="text-amber-300 text-sm">
            {miVoto ? 'Ya votaste. Podés cambiar tu voto hasta que se cierre la votación.' : 'La votación está abierta. Elegí el presupuesto que te parezca mejor.'}
          </p>
        </div>
      )}

      {/* Presupuestos */}
      {presupuestos.length === 0 ? (
        <EmptyState
          icon={ICONS.presupuesto}
          titulo="Sin presupuestos cargados"
          descripcion={esAdmin ? 'Agregá al menos un presupuesto para poder iniciar la votación.' : 'El administrador aún no cargó presupuestos.'}
          accion={esAdmin && estado === 'abierta' ? 'Agregar primer presupuesto' : undefined}
          onAccion={esAdmin && estado === 'abierta' ? () => setModalItem(true) : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {presupuestos.map((p, idx) => {
            const esGanador    = cerrada && p.votos === maxVotos && maxVotos > 0;
            const esMiVoto     = miVoto === p.id;
            return (
              <div key={p.id}
                className={`bg-slate-900/60 border rounded-xl p-5 space-y-4 transition-all
                  ${esGanador  ? 'border-emerald-400/40 shadow-[0_0_24px_-4px_rgba(52,211,153,0.15)]' : ''}
                  ${esMiVoto && !cerrada ? 'border-amber-400/30' : ''}
                  ${!esGanador && !esMiVoto ? 'border-white/[0.06]' : ''}`}>

                {/* Encabezado */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-slate-500 text-xs">#{idx + 1}</span>
                      {esGanador && <Icon path={ICONS.trofeo} size={14} className="text-emerald-400" />}
                      {esMiVoto && !cerrada && <Icon path={ICONS.voto} size={14} className="text-amber-400" />}
                    </div>
                    <p className="text-white text-sm font-semibold leading-tight">{p.proveedor}</p>
                  </div>
                  {esAdmin && estado === 'abierta' && (
                    <button onClick={() => handleEliminarItem(p.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                      <Icon path={ICONS.basura} size={15} />
                    </button>
                  )}
                </div>

                {/* Detalle */}
                <div className="space-y-2 text-xs">
                  {p.articulos && (
                    <div>
                      <p className="text-slate-500 uppercase tracking-wider mb-0.5">Materiales</p>
                      <p className="text-slate-300 leading-relaxed">{p.articulos}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                    <div>
                      <p className="text-slate-500 uppercase tracking-wider mb-0.5">Mano de obra</p>
                      <p className="text-slate-300">{fmt(p.mano_de_obra)}</p>
                    </div>
                    {p.tiempo_estimado && (
                      <div>
                        <p className="text-slate-500 uppercase tracking-wider mb-0.5">Tiempo estimado</p>
                        <p className="text-slate-300">{p.tiempo_estimado}</p>
                      </div>
                    )}
                  </div>
                  {p.notas && (
                    <div>
                      <p className="text-slate-500 uppercase tracking-wider mb-0.5">Notas</p>
                      <p className="text-slate-400 italic">{p.notas}</p>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-slate-500 text-xs uppercase tracking-wider">Total</span>
                  <span className="text-white font-semibold">{fmt(p.total)}</span>
                </div>

                {/* Votos (visible en votando o cerrada) */}
                {(estado === 'votando' || cerrada) && (
                  <BarraVotos votos={p.votos || 0} totalVotos={totalVotos} ganador={esGanador} />
                )}

                {/* Botón votar */}
                {puedevotar && (
                  <button
                    onClick={() => handleVotar(p.id)}
                    disabled={votando === p.id}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5
                      ${esMiVoto
                        ? 'bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/20'
                        : 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20'}`}>
                    {votando === p.id
                      ? <Spinner size={4} />
                      : <Icon path={esMiVoto ? ICONS.check : ICONS.voto} size={15} />}
                    {esMiVoto ? 'Tu voto ✓' : 'Votar por este'}
                  </button>
                )}

                {/* Ganador cerrado */}
                {cerrada && esGanador && (
                  <div className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg
                                  bg-emerald-400/10 border border-emerald-400/20">
                    <Icon path={ICONS.trofeo} size={14} className="text-emerald-400" />
                    <span className="text-emerald-400 text-xs font-semibold">Ganador</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resumen de votos si hay votos */}
      {totalVotos > 0 && (
        <p className="text-slate-600 text-xs text-center">
          {totalVotos} voto{totalVotos !== 1 ? 's' : ''} emitido{totalVotos !== 1 ? 's' : ''}
        </p>
      )}

      {/* Modal agregar presupuesto */}
      {modalItem && (
        <Modal titulo="Agregar presupuesto" onCerrar={() => { setModalItem(false); setErrorForm(''); }}>
          <div className="space-y-3">
            {[
              { key: 'proveedor',      label: 'Nombre del proveedor / empresa *', placeholder: 'Ej: Juan García Pinturas' },
              { key: 'articulos',      label: 'Artículos / materiales',           placeholder: 'Pintura látex, sellador, rodillos…', multi: true },
              { key: 'manoDeObra',     label: 'Mano de obra ($)',                 placeholder: '0' },
              { key: 'tiempoEstimado', label: 'Tiempo estimado',                  placeholder: 'Ej: 2 semanas' },
              { key: 'total',          label: 'Total ($) *',                      placeholder: '0' },
              { key: 'notas',          label: 'Notas adicionales',                placeholder: 'Observaciones, condiciones…', multi: true },
            ].map(({ key, label, placeholder, multi }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">{label}</label>
                {multi ? (
                  <textarea value={formItem[key]} rows={2}
                    onChange={e => { setFormItem({ ...formItem, [key]: e.target.value }); setErrorForm(''); }}
                    placeholder={placeholder}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                               text-white text-sm placeholder:text-slate-600 resize-none
                               focus:outline-none focus:border-emerald-400/50 transition-all" />
                ) : (
                  <input
                    type={['manoDeObra','total'].includes(key) ? 'number' : 'text'}
                    value={formItem[key]}
                    onChange={e => { setFormItem({ ...formItem, [key]: e.target.value }); setErrorForm(''); }}
                    placeholder={placeholder}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                               text-white text-sm placeholder:text-slate-600
                               focus:outline-none focus:border-emerald-400/50 transition-all" />
                )}
              </div>
            ))}

            {errorForm && (
              <div className="flex items-center gap-2">
                <Icon path={ICONS.alerta} size={14} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-xs">{errorForm}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={() => { setModalItem(false); setErrorForm(''); }}
                className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white rounded-lg py-2.5 text-sm transition-all">
                Cancelar
              </button>
              <button onClick={handleGuardarItem} disabled={guardando}
                className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold
                           rounded-lg py-2.5 text-sm transition-all disabled:opacity-50
                           flex items-center justify-center gap-2">
                {guardando && <Spinner size={4} />}
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// Vista de lista de licitaciones
// ──────────────────────────────────────────────────────────
export default function PresupuestosPage() {
  const { usuario } = useAuth();
  const esAdmin     = usuario?.rol === 'administrador';

  const [lista,       setLista]       = useState([]);
  const [cargando,    setCargando]    = useState(true);
  const [error,       setError]       = useState('');
  const [detalle,     setDetalle]     = useState(null); // id de licitación abierta
  const [modalNueva,  setModalNueva]  = useState(false);
  const [form,        setForm]        = useState({ titulo: '', descripcion: '', periodo: '', caduca_en: '' });
  const [guardando,   setGuardando]   = useState(false);
  const [errorForm,   setErrorForm]   = useState('');
  const [toast,       setToast]       = useState('');

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const cargarLista = useCallback(async () => {
    setCargando(true);
    try {
      const r = await api.get('/presupuestos');
      setLista(r.data.datos);
    } catch (e) {
      setError(e.response?.data?.mensaje || 'Error al cargar');
    } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarLista(); }, [cargarLista]);

  const handleCrear = async () => {
    setErrorForm('');
    if (!form.titulo.trim()) return setErrorForm('El título es requerido');
    if (!form.periodo)       return setErrorForm('Seleccioná un período');
    setGuardando(true);
    try {
      const r = await api.post('/presupuestos', form);
      setModalNueva(false);
      setForm({ titulo: '', descripcion: '', periodo: '', caduca_en: '' });
      mostrarToast('Licitación creada');
      setLista(prev => [r.data.datos, ...prev]);
    } catch (e) {
      setErrorForm(e.response?.data?.mensaje || 'Error al crear');
    } finally { setGuardando(false); }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta licitación y todos sus presupuestos?')) return;
    try {
      await api.delete(`/presupuestos/${id}`);
      setLista(prev => prev.filter(l => l.id !== id));
      mostrarToast('Licitación eliminada');
    } catch (e) {
      mostrarToast(e.response?.data?.mensaje || 'Error al eliminar');
    }
  };

  // Si hay un detalle abierto, mostramos la vista de detalle
  if (detalle !== null) {
    return (
      <Layout>
        <DetalleLicitacion
          licitacionId={detalle}
          esAdmin={esAdmin}
          onVolver={() => setDetalle(null)}
          onActualizar={cargarLista}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-page-in">

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-800 border border-white/[0.1] rounded-xl px-4 py-3
                          text-slate-200 text-sm shadow-xl flex items-center gap-2 animate-fade-in">
            <Icon path={ICONS.check} size={16} className="text-emerald-400 shrink-0" />
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-white text-xl font-semibold">Presupuestos</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {esAdmin
                ? 'Cargá presupuestos de proveedores y abrí la votación a los propietarios.'
                : 'Votá por el presupuesto que te parezca mejor para cada trabajo.'}
            </p>
          </div>
          {esAdmin && (
            <button onClick={() => setModalNueva(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg shrink-0
                         bg-emerald-400/10 hover:bg-emerald-400/20 border border-emerald-400/20
                         hover:border-emerald-400/40 text-emerald-400 text-sm font-medium transition-all">
              <Icon path={ICONS.mas} size={15} />
              Nueva licitación
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <Icon path={ICONS.alerta} size={16} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Lista */}
        {cargando ? (
          <div className="flex items-center justify-center py-32"><Spinner size={8} /></div>
        ) : lista.length === 0 ? (
          <EmptyState
            icon={ICONS.presupuesto}
            titulo="Sin licitaciones todavía"
            descripcion={esAdmin
              ? 'Creá una licitación, cargá los presupuestos y abrí la votación.'
              : 'El administrador aún no creó ninguna licitación.'}
            accion={esAdmin ? 'Crear primera licitación' : undefined}
            onAccion={esAdmin ? () => setModalNueva(true) : undefined}
          />
        ) : (
          <div className="space-y-3">
            {lista.map(l => {
              const badge = BADGE_ESTADO[l.estado] || BADGE_ESTADO.abierta;
              return (
                <div key={l.id}
                  className="bg-slate-900/60 border border-white/[0.06] hover:border-white/[0.12]
                             rounded-xl p-5 transition-all group cursor-pointer"
                  onClick={() => setDetalle(l.id)}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                        <Badge variant="default">{formatPeriodo(l.periodo)}</Badge>
                      </div>
                      <p className="text-white font-medium">{l.titulo}</p>
                      {l.descripcion && (
                        <p className="text-slate-500 text-sm line-clamp-2">{l.descripcion}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1">
                        <span>{l.cantidad_presupuestos} presupuesto{l.cantidad_presupuestos !== 1 ? 's' : ''}</span>
                        <span>{l.cantidad_votos} voto{l.cantidad_votos !== 1 ? 's' : ''}</span>
                        {l.caduca_en && (
                          <span className="flex items-center gap-1">
                            <Icon path={ICONS.reloj} size={11} />
                            Caduca {formatFecha(l.caduca_en)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {esAdmin && (
                        <button
                          onClick={e => { e.stopPropagation(); handleEliminar(l.id); }}
                          className="text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-lg opacity-0 group-hover:opacity-100">
                          <Icon path={ICONS.basura} size={15} />
                        </button>
                      )}
                      <Icon path={ICONS.flecha} size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal nueva licitación */}
        {modalNueva && (
          <Modal titulo="Nueva licitación" onCerrar={() => { setModalNueva(false); setErrorForm(''); }}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Título *</label>
                <input value={form.titulo} onChange={e => { setForm({ ...form, titulo: e.target.value }); setErrorForm(''); }}
                  placeholder="Ej: Pintura del frente del edificio"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                             text-white text-sm placeholder:text-slate-600
                             focus:outline-none focus:border-emerald-400/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Descripción</label>
                <textarea value={form.descripcion} rows={2}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Detalle del trabajo a realizar…"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                             text-white text-sm placeholder:text-slate-600 resize-none
                             focus:outline-none focus:border-emerald-400/50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs uppercase tracking-wider">Período *</label>
                  <select value={form.periodo} onChange={e => { setForm({ ...form, periodo: e.target.value }); setErrorForm(''); }}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                               text-white text-sm focus:outline-none focus:border-emerald-400/50 transition-all">
                    <option value="">Seleccioná</option>
                    {mesesDisponibles().map(m => (
                      <option key={m.val} value={m.val}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs uppercase tracking-wider">Caduca el</label>
                  <input type="date" value={form.caduca_en}
                    onChange={e => setForm({ ...form, caduca_en: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                               text-white text-sm focus:outline-none focus:border-emerald-400/50 transition-all
                               [color-scheme:dark]" />
                </div>
              </div>

              {errorForm && (
                <div className="flex items-center gap-2">
                  <Icon path={ICONS.alerta} size={14} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-xs">{errorForm}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => { setModalNueva(false); setErrorForm(''); }}
                  className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white rounded-lg py-2.5 text-sm transition-all">
                  Cancelar
                </button>
                <button onClick={handleCrear} disabled={guardando}
                  className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold
                             rounded-lg py-2.5 text-sm transition-all disabled:opacity-50
                             flex items-center justify-center gap-2">
                  {guardando && <Spinner size={4} />}
                  {guardando ? 'Creando…' : 'Crear licitación'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
}
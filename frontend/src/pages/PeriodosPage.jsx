// ============================================================
// PeriodosPage.jsx
// Ubicación: src/pages/PeriodosPage.jsx
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { apiConsorcio } from '../lib/api';

const Icon = ({ path, size = 18, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none"
    stroke="currentColor" viewBox="0 0 24 24" style={{ minWidth: size, minHeight: size }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

const ICONS = {
  calendario: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  gasto:      'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  expensa:    'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  mas:        'M12 4.5v15m7.5-7.5h-15',
  cerrar:     'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  basura:     'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
  alerta:     'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  check:      'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  atras:      'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const formatearPeriodo = (periodo) => {
  if (!periodo) return '—';
  const [anio, mes] = periodo.split('-');
  return `${MESES[parseInt(mes) - 1]} ${anio}`;
};
const fmt = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;

const Badge = ({ children, variant = 'default' }) => {
  const v = { default: 'bg-slate-700/50 text-slate-300', success: 'bg-emerald-400/15 text-emerald-400', muted: 'bg-slate-700/30 text-slate-500', warning: 'bg-amber-400/15 text-amber-400' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${v[variant]}`}>{children}</span>;
};

const Spinner = ({ size = 5 }) => (
  <div className={`w-${size} h-${size} rounded-full border-2 border-emerald-400 border-t-transparent animate-spin`} />
);

const ModalCerrar = ({ periodo, onConfirmar, onCancelar, cargando }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-[hsl(222,47%,10%)] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm space-y-4">
      <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto">
        <Icon path={ICONS.alerta} size={22} className="text-amber-400" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-white font-semibold">Cerrar período</h3>
        <p className="text-slate-400 text-sm">¿Cerrar <span className="text-white font-medium">{formatearPeriodo(periodo?.periodo)}</span>?</p>
        <p className="text-slate-500 text-xs mt-2">Se calcularán y generarán las expensas para todas las unidades. Esta acción no se puede deshacer.</p>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancelar} disabled={cargando}
          className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white rounded-lg py-2.5 text-sm transition-all disabled:opacity-50">
          Cancelar
        </button>
        <button onClick={onConfirmar} disabled={cargando}
          className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold rounded-lg py-2.5 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {cargando ? <Spinner size={4} /> : <Icon path={ICONS.cerrar} size={16} />}
          {cargando ? 'Cerrando…' : 'Cerrar período'}
        </button>
      </div>
    </div>
  </div>
);

const ModalEliminar = ({ periodo, onConfirmar, onCancelar, cargando }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-[hsl(222,47%,10%)] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm space-y-4">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
        <Icon path={ICONS.basura} size={22} className="text-red-400" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-white font-semibold">Eliminar período</h3>
        <p className="text-slate-400 text-sm">¿Eliminar <span className="text-white font-medium">{formatearPeriodo(periodo?.periodo)}</span>?</p>
        <p className="text-slate-500 text-xs mt-2">Se eliminarán también todos los gastos y expensas asociados. Esta acción no se puede deshacer.</p>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancelar} disabled={cargando}
          className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white rounded-lg py-2.5 text-sm transition-all disabled:opacity-50">
          Cancelar
        </button>
        <button onClick={onConfirmar} disabled={cargando}
          className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold rounded-lg py-2.5 text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {cargando ? <Spinner size={4} /> : <Icon path={ICONS.basura} size={16} />}
          {cargando ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </div>
  </div>
);

// ── Card de período con totales expandibles ────────────────
function CardPeriodo({ p, esAdmin, navigate, cid, onCerrar, onEliminar }) {
  const api = apiConsorcio(cid);
  const [expandido,  setExpandido]  = useState(false);
  const [expensas,   setExpensas]   = useState([]);
  const [cargando,   setCargando]   = useState(false);
  const [cargado,    setCargado]    = useState(false);

  const totalExpensas  = Number(p.total_ordinario || 0) + Number(p.total_extraordinario || 0);
  const totalCobrado   = expensas.filter(e => e.pagado).reduce((s, e) => s + Number(e.monto_total || 0), 0);
  const totalPendiente = expensas.filter(e => !e.pagado).reduce((s, e) => s + Number(e.monto_total || 0), 0);
  const porcentajeCobrado = totalExpensas > 0 ? Math.round((totalCobrado / totalExpensas) * 100) : 0;

  const toggleExpandir = async () => {
    if (!p.cerrado) return;
    setExpandido(v => !v);
    if (!cargado) {
      setCargando(true);
      try {
        const r = await api.get(`/expensas?periodoId=${p.id}`);
        setExpensas(r.data.datos ?? r.data);
        setCargado(true);
      } catch { }
      finally { setCargando(false); }
    }
  };

  return (
    <div className={`bg-slate-900/60 border rounded-xl overflow-hidden transition-all
      ${p.cerrado === false ? 'border-emerald-400/20' : 'border-white/[0.06]'}`}>

      {/* Fila principal */}
      <div className="p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
            ${p.cerrado === false ? 'bg-emerald-400/10 border border-emerald-400/20' : 'bg-slate-800 border border-white/[0.06]'}`}>
            <Icon path={ICONS.calendario} size={18} className={p.cerrado === false ? 'text-emerald-400' : 'text-slate-500'} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-medium">{formatearPeriodo(p.periodo)}</span>
              <Badge variant={p.cerrado === false ? 'success' : 'muted'}>
                {p.cerrado === false ? 'Abierto' : 'Cerrado'}
              </Badge>
              {/* Totales inline para períodos cerrados */}
              {p.cerrado === true && totalExpensas > 0 && (
                <span className="text-slate-500 text-xs">
                  Total: <span className="text-white">{fmt(totalExpensas)}</span>
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs mt-0.5">{p.periodo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <button onClick={() => navigate(`/consorcios/${cid}/gastos?periodoId=${p.id}`)}
            className="text-slate-500 hover:text-white text-xs flex items-center gap-1.5
                       border border-white/[0.06] hover:border-white/[0.12] px-3 py-1.5 rounded-lg transition-all">
            <Icon path={ICONS.gasto} size={14} />
            Gastos
          </button>
          {p.cerrado === true && (
            <button onClick={() => navigate(`/consorcios/${cid}/expensas?periodoId=${p.id}`)}
              className="text-slate-500 hover:text-white text-xs flex items-center gap-1.5
                         border border-white/[0.06] hover:border-white/[0.12] px-3 py-1.5 rounded-lg transition-all">
              <Icon path={ICONS.expensa} size={14} />
              Expensas
            </button>
          )}
          {/* Botón expandir totales — solo períodos cerrados */}
          {p.cerrado === true && esAdmin && (
            <button onClick={toggleExpandir}
              className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border
                ${expandido
                  ? 'border-emerald-400/30 text-emerald-400 bg-emerald-400/[0.06]'
                  : 'border-white/[0.06] text-slate-500 hover:text-white hover:border-white/[0.12]'}`}>
              {cargando ? <Spinner size={3} /> : null}
              {expandido ? 'Ocultar' : 'Ver totales'}
            </button>
          )}
          {esAdmin && p.cerrado === false && (
            <button onClick={() => onCerrar(p)}
              className="flex items-center gap-1.5 border border-amber-400/30 text-amber-400
                         hover:bg-amber-400/10 text-xs px-3 py-1.5 rounded-lg transition-all">
              <Icon path={ICONS.cerrar} size={14} />
              Cerrar
            </button>
          )}
          {esAdmin && (
            <button onClick={() => onEliminar(p)}
              className="flex items-center gap-1.5 border border-red-500/20 text-red-400
                         hover:bg-red-500/10 text-xs px-3 py-1.5 rounded-lg transition-all">
              <Icon path={ICONS.basura} size={14} />
              Eliminar
            </button>
          )}
        </div>
      </div>

      {/* Panel de totales expandido */}
      {expandido && p.cerrado === true && (
        <div className="border-t border-white/[0.06] px-5 py-4 bg-slate-950/30">
          {cargando ? (
            <div className="flex justify-center py-2"><Spinner size={4} /></div>
          ) : (
            <div className="space-y-3">
              {/* Barra de progreso */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Recaudación</span>
                  <span className="text-slate-300">{porcentajeCobrado}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeCobrado}%` }}
                  />
                </div>
              </div>

              {/* Totales en grilla */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-slate-500 text-xs mb-1">Total período</p>
                  <p className="text-white text-sm font-semibold">{fmt(totalExpensas)}</p>
                </div>
                <div className="bg-emerald-400/[0.06] border border-emerald-400/10 rounded-lg p-3">
                  <p className="text-emerald-400 text-xs mb-1">Cobrado</p>
                  <p className="text-white text-sm font-semibold">{fmt(totalCobrado)}</p>
                  <p className="text-slate-600 text-xs">{expensas.filter(e => e.pagado).length} expensas</p>
                </div>
                <div className={`rounded-lg p-3 ${totalPendiente > 0 ? 'bg-amber-400/[0.06] border border-amber-400/10' : 'bg-slate-800/50'}`}>
                  <p className={`text-xs mb-1 ${totalPendiente > 0 ? 'text-amber-400' : 'text-slate-500'}`}>Pendiente</p>
                  <p className="text-white text-sm font-semibold">{fmt(totalPendiente)}</p>
                  <p className="text-slate-600 text-xs">{expensas.filter(e => !e.pagado).length} expensas</p>
                </div>
              </div>

              {/* Gastos del período */}
              {(Number(p.total_ordinario) > 0 || Number(p.total_extraordinario) > 0) && (
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/[0.04]">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Gastos ordinarios</span>
                    <span className="text-slate-300">{fmt(p.total_ordinario)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Gastos extraordinarios</span>
                    <span className="text-slate-300">{fmt(p.total_extraordinario)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PeriodosPage() {
  const { usuario, consorcioActual } = useAuth();
  const navigate    = useNavigate();
  const { cid }     = useParams();
  const api         = apiConsorcio(cid);
  const esAdmin     = consorcioActual?.mi_rol === 'administrador';

  const [periodos,         setPeriodos]         = useState([]);
  const [cargando,         setCargando]         = useState(true);
  const [error,            setError]            = useState('');
  const [toast,            setToast]            = useState('');
  const [mostrarForm,      setMostrarForm]      = useState(false);
  const [nuevoPeriodo,     setNuevoPeriodo]     = useState('');
  const [creando,          setCreando]          = useState(false);
  const [errorForm,        setErrorForm]        = useState('');
  const [periodoACerrar,   setPeriodoACerrar]   = useState(null);
  const [cerrando,         setCerrando]         = useState(false);
  const [periodoAEliminar, setPeriodoAEliminar] = useState(null);
  const [eliminando,       setEliminando]       = useState(false);

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const cargar = async () => {
    try {
      setCargando(true);
      const res = await api.get('/periodos');
      setPeriodos(res.data.datos ?? res.data);
    } catch { setError('No se pudieron cargar los períodos.'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  useEffect(() => {
    if (mostrarForm && !nuevoPeriodo) {
      const hoy = new Date();
      setNuevoPeriodo(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`);
    }
  }, [mostrarForm]);

  const handleCrear = async () => {
    if (!nuevoPeriodo) { setErrorForm('Ingresá un período'); return; }
    setCreando(true); setErrorForm('');
    try {
      await api.post('/periodos', { periodo: nuevoPeriodo });
      setMostrarForm(false); setNuevoPeriodo('');
      mostrarToast(`Período ${formatearPeriodo(nuevoPeriodo)} creado correctamente`);
      cargar();
    } catch (e) { setErrorForm(e.response?.data?.mensaje || 'Error al crear el período'); }
    finally { setCreando(false); }
  };

  const handleCerrar = async () => {
    if (!periodoACerrar) return;
    setCerrando(true);
    try {
      await api.post(`/periodos/${periodoACerrar.id}/cerrar`);
      mostrarToast(`Período ${formatearPeriodo(periodoACerrar.periodo)} cerrado y expensas generadas`);
      setPeriodoACerrar(null); cargar();
    } catch (e) {
      mostrarToast(e.response?.data?.mensaje || 'Error al cerrar el período');
      setPeriodoACerrar(null);
    } finally { setCerrando(false); }
  };

  const handleEliminar = async () => {
    if (!periodoAEliminar) return;
    setEliminando(true);
    try {
      await api.delete(`/periodos/${periodoAEliminar.id}`);
      mostrarToast(`Período ${formatearPeriodo(periodoAEliminar.periodo)} eliminado`);
      setPeriodoAEliminar(null); cargar();
    } catch (e) {
      mostrarToast(e.response?.data?.mensaje || 'Error al eliminar el período');
      setPeriodoAEliminar(null);
    } finally { setEliminando(false); }
  };

  const periodoAbierto = periodos.find(p => p.cerrado === false);

  return (
    <Layout>
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[hsl(222,47%,7%)]/80
                         backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/consorcios/${cid}/dashboard`)} className="text-slate-500 hover:text-white transition-colors">
            <Icon path={ICONS.atras} size={18} />
          </button>
          <div>
            <h1 className="text-white text-lg font-semibold leading-none">Períodos</h1>
            <p className="text-slate-500 text-xs mt-1">
              {periodos.length} período{periodos.length !== 1 ? 's' : ''} registrado{periodos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {esAdmin && !periodoAbierto && (
          <button onClick={() => setMostrarForm(true)}
            className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300
                       text-slate-900 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150">
            <Icon path={ICONS.mas} size={16} />
            Nuevo período
          </button>
        )}
      </header>

      <div className="p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <Icon path={ICONS.alerta} size={18} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {periodoAbierto && esAdmin && (
          <div className="flex items-center justify-between bg-emerald-400/[0.06] border border-emerald-400/20 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <Icon path={ICONS.check} size={18} className="text-emerald-400 shrink-0" />
              <p className="text-emerald-400 text-sm">
                Período abierto: <span className="font-semibold">{formatearPeriodo(periodoAbierto.periodo)}</span>
              </p>
            </div>
            <span className="text-slate-500 text-xs">Solo puede haber uno a la vez</span>
          </div>
        )}

        {mostrarForm && (
          <div className="bg-slate-900/60 border border-emerald-400/20 rounded-xl p-5 space-y-4">
            <h2 className="text-white text-sm font-semibold">Nuevo período</h2>
            <div className="flex gap-3">
              <input type="month" value={nuevoPeriodo}
                onChange={e => { setNuevoPeriodo(e.target.value); setErrorForm(''); }}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                           text-white text-sm focus:outline-none focus:border-emerald-400/50
                           transition-all [color-scheme:dark]" />
              <button onClick={handleCrear} disabled={creando}
                className="bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold text-sm px-5
                           rounded-lg transition-all disabled:opacity-50 flex items-center gap-2">
                {creando ? <Spinner size={4} /> : <Icon path={ICONS.mas} size={16} />}
                {creando ? 'Creando…' : 'Crear'}
              </button>
              <button onClick={() => { setMostrarForm(false); setErrorForm(''); }}
                className="border border-white/[0.08] text-slate-400 hover:text-white px-4 rounded-lg text-sm transition-all">
                Cancelar
              </button>
            </div>
            {errorForm && <p className="text-red-400 text-xs">{errorForm}</p>}
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-20"><Spinner size={8} /></div>
        ) : periodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
              <Icon path={ICONS.calendario} size={28} className="text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm">No hay períodos todavía</p>
            {esAdmin && <button onClick={() => setMostrarForm(true)} className="text-emerald-400 text-sm hover:underline">Crear el primer período →</button>}
          </div>
        ) : (
          <div className="space-y-3">
            {periodos.map(p => (
              <CardPeriodo
                key={p.id}
                p={p}
                esAdmin={esAdmin}
                navigate={navigate}
                cid={cid}
                onCerrar={setPeriodoACerrar}
                onEliminar={setPeriodoAEliminar}
              />
            ))}
          </div>
        )}
      </div>

      {periodoACerrar && (
        <ModalCerrar periodo={periodoACerrar} onConfirmar={handleCerrar}
          onCancelar={() => setPeriodoACerrar(null)} cargando={cerrando} />
      )}

      {periodoAEliminar && (
        <ModalEliminar periodo={periodoAEliminar} onConfirmar={handleEliminar}
          onCancelar={() => setPeriodoAEliminar(null)} cargando={eliminando} />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 border border-white/[0.08]
                        rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl animate-fade-up">
          <Icon path={ICONS.check} size={18} className="text-emerald-400 shrink-0" />
          <p className="text-white text-sm">{toast}</p>
        </div>
      )}
    </Layout>
  );
}
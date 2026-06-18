// ============================================================
// ExpensasPage.jsx
// Ubicación: src/pages/ExpensasPage.jsx
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
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
  alerta:    'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  check:     'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  atras:     'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
  expensa:   'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  chevron:   'M19.5 8.25l-7.5 7.5-7.5-7.5',
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const formatearPeriodo = (p) => { if (!p) return ''; const [a, m] = p.split('-'); return `${MESES[parseInt(m)-1]} ${a}`; };

const Badge = ({ children, variant = 'default' }) => {
  const v = { default: 'bg-slate-700/50 text-slate-300', success: 'bg-emerald-400/15 text-emerald-400', warning: 'bg-amber-400/15 text-amber-400', muted: 'bg-slate-700/30 text-slate-500' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${v[variant]}`}>{children}</span>;
};
const Spinner = ({ size = 5 }) => <div className={`w-${size} h-${size} rounded-full border-2 border-emerald-400 border-t-transparent animate-spin`} />;

function MarcarPagadaBtn({ expensaId, onPagada, cid }) {
  const api = apiConsorcio(cid);
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try { await api.patch(`/expensas/${expensaId}/pagar`); onPagada(expensaId); }
    catch { }
    finally { setLoading(false); }
  };
  return (
    <button onClick={handleClick} disabled={loading}
      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300
                 text-xs border border-emerald-400/20 hover:border-emerald-400/40
                 px-2.5 py-1.5 rounded-lg transition-all disabled:opacity-50">
      {loading ? <Spinner size={3} /> : <Icon path={ICONS.check} size={13} />}
      Registrar pago
    </button>
  );
}

function RevertirPagoBtn({ expensaId, onRevertida, cid }) {
  const api = apiConsorcio(cid);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const handleClick = async () => {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 3000); return; }
    setLoading(true);
    try { await api.patch(`/expensas/${expensaId}/revertir`); onRevertida(expensaId); }
    catch { }
    finally { setLoading(false); setConfirm(false); }
  };

  return (
    <button onClick={handleClick} disabled={loading}
      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg
                  transition-all disabled:opacity-50 border
                  ${confirm
                    ? 'border-red-500/40 text-red-400 hover:bg-red-500/10'
                    : 'border-white/[0.08] text-slate-500 hover:text-slate-300 hover:border-white/[0.15]'}`}>
      {loading ? <Spinner size={3} /> : null}
      {confirm ? '¿Confirmar?' : 'Revertir pago'}
    </button>
  );
}

// ── Fila de historial expandible (para propietario) ────────
function FilaPeriodoHistorial({ periodo, email, cid }) {
  const api = apiConsorcio(cid);
  const [abierto,  setAbierto]  = useState(false);
  const [expensas, setExpensas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargado,  setCargado]  = useState(false);

  const toggle = async () => {
    setAbierto(v => !v);
    if (!cargado) {
      setCargando(true);
      try {
        const r = await api.get(`/expensas?periodoId=${periodo.id}`);
        setExpensas(r.data.datos ?? r.data);
        setCargado(true);
      } catch { }
      finally { setCargando(false); }
    }
  };

  const miExpensa = expensas[0]; // propietario/inquilino solo tiene 1 expensa por período

  return (
    <div className={`border rounded-xl overflow-hidden transition-all
      ${abierto ? 'border-emerald-400/20' : 'border-white/[0.06]'}`}>
      <button onClick={toggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
            ${abierto ? 'bg-emerald-400/10 border border-emerald-400/20' : 'bg-slate-800 border border-white/[0.06]'}`}>
            <Icon path={ICONS.expensa} size={15} className={abierto ? 'text-emerald-400' : 'text-slate-500'} />
          </div>
          <div className="text-left">
            <p className="text-white text-sm font-medium">{formatearPeriodo(periodo.periodo)}</p>
            <p className="text-slate-500 text-xs">{periodo.periodo}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {cargado && miExpensa && (
            <Badge variant={miExpensa.pagado ? 'success' : 'warning'}>
              {miExpensa.pagado ? 'Pagada' : 'Pendiente'}
            </Badge>
          )}
          {cargado && miExpensa && (
            <span className="text-white text-sm font-medium">
              ${Number(miExpensa.monto_total || 0).toLocaleString('es-AR')}
            </span>
          )}
          <Icon path={ICONS.chevron} size={16}
            className={`text-slate-500 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {abierto && (
        <div className="border-t border-white/[0.06] px-5 py-4 bg-slate-900/40">
          {cargando ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : expensas.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-2">Sin expensas en este período</p>
          ) : (
            <div className="space-y-3">
              {expensas.map(e => (
                <div key={e.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-slate-300 text-sm">{e.unidad_nombre ?? '—'}</p>
                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                      <span>Ordinario: ${Number(e.monto_ordinario || 0).toLocaleString('es-AR')}</span>
                      <span>Extraordinario: ${Number(e.monto_extraordinario || 0).toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-white font-semibold text-sm">
                      ${Number(e.monto_total || 0).toLocaleString('es-AR')}
                    </span>
                    <Badge variant={e.pagado ? 'success' : 'warning'}>
                      {e.pagado ? 'Pagada' : 'Pendiente'}
                    </Badge>
                    {e.pagado && e.pagado_en && (
                      <span className="text-slate-600 text-xs">
                        {new Date(e.pagado_en).toLocaleDateString('es-AR')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Vista admin (tabla por período) ────────────────────────
function VistaAdmin({ periodos, params, navigate, cid }) {
  const api = apiConsorcio(cid);
  const [periodoSel, setPeriodoSel] = useState(params.get('periodoId') || '');
  const [expensas,   setExpensas]   = useState([]);
  const [cargando,   setCargando]   = useState(false);
  const [filtro,     setFiltro]     = useState('todos');
  const [error,      setError]      = useState('');
  const [toast,      setToast]      = useState('');

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    if (!periodoSel && periodos.length > 0) {
      const cerrado = periodos.find(p => p.cerrado === true);
      setPeriodoSel(cerrado?.id ?? periodos[0].id);
    }
  }, [periodos]);

  useEffect(() => {
    if (!periodoSel) return;
    setCargando(true); setError('');
    api.get(`/expensas?periodoId=${periodoSel}`)
      .then(r => setExpensas(r.data.datos ?? r.data))
      .catch(() => setError('No se pudieron cargar las expensas'))
      .finally(() => setCargando(false));
  }, [periodoSel]);

  const onPagada = (id) => {
    setExpensas(prev => prev.map(e => e.id === id ? { ...e, pagado: true } : e));
    mostrarToast('Pago registrado correctamente');
  };

  const onRevertida = (id) => {
    setExpensas(prev => prev.map(e => e.id === id ? { ...e, pagado: false } : e));
    mostrarToast('Pago revertido correctamente');
  };

  const expensasFiltradas = expensas.filter(e => {
    if (filtro === 'todos') return true;
    return filtro === 'pagada' ? e.pagado : !e.pagado;
  });

  const totalPendiente = expensas.filter(e => !e.pagado).reduce((s, e) => s + Number(e.monto_total || 0), 0);
  const totalPagado    = expensas.filter(e => e.pagado).reduce((s, e) => s + Number(e.monto_total || 0), 0);
  const periodoActual  = periodos.find(p => p.id === periodoSel);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[hsl(222,47%,7%)]/80
                         backdrop-blur-sm px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/consorcios/${cid}/dashboard`)} className="text-slate-500 hover:text-white transition-colors">
            <Icon path={ICONS.atras} size={18} />
          </button>
          <div>
            <h1 className="text-white text-lg font-semibold leading-none">Expensas</h1>
            <p className="text-slate-500 text-xs mt-1">
              {periodoActual ? formatearPeriodo(periodoActual.periodo) : 'Seleccioná un período'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <select value={periodoSel} onChange={e => setPeriodoSel(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-lg
                       px-3 py-2 focus:outline-none focus:border-emerald-400/50 [color-scheme:dark]">
            {periodos.map(p => (
              <option key={p.id} value={p.id}>
                {formatearPeriodo(p.periodo)} {p.cerrado === false ? '(abierto)' : '(cerrado)'}
              </option>
            ))}
          </select>
          <div className="flex bg-slate-900/60 border border-white/[0.06] rounded-lg p-0.5">
            {['todos','pendiente','pagada'].map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150
                  ${filtro === f ? 'bg-emerald-400/10 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}>
                {f === 'todos' ? 'Todos' : f === 'pendiente' ? 'Pendientes' : 'Pagadas'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <Icon path={ICONS.alerta} size={18} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!cargando && expensas.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total período</p>
              <p className="text-white text-xl font-semibold">${(totalPendiente + totalPagado).toLocaleString('es-AR')}</p>
            </div>
            <div className="bg-slate-900/60 border border-amber-400/20 rounded-xl p-4">
              <p className="text-amber-400 text-xs uppercase tracking-wider mb-1">Pendiente</p>
              <p className="text-white text-xl font-semibold">${totalPendiente.toLocaleString('es-AR')}</p>
              <p className="text-slate-500 text-xs mt-0.5">{expensas.filter(e => !e.pagado).length} expensas</p>
            </div>
            <div className="bg-slate-900/60 border border-emerald-400/20 rounded-xl p-4">
              <p className="text-emerald-400 text-xs uppercase tracking-wider mb-1">Cobrado</p>
              <p className="text-white text-xl font-semibold">${totalPagado.toLocaleString('es-AR')}</p>
              <p className="text-slate-500 text-xs mt-0.5">{expensas.filter(e => e.pagado).length} expensas</p>
            </div>
          </div>
        )}

        <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center py-20"><Spinner size={8} /></div>
          ) : expensasFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Icon path={ICONS.expensa} size={32} className="text-slate-600" />
              <p className="text-slate-400 text-sm">
                {periodoActual?.cerrado === false
                  ? 'El período aún no fue cerrado. Cerralo para generar expensas.'
                  : expensas.length === 0 ? 'Sin expensas en este período' : `Sin expensas ${filtro === 'pendiente' ? 'pendientes' : 'pagadas'}`}
              </p>
              {periodoActual?.cerrado === false && (
                <button onClick={() => navigate(`/consorcios/${cid}/periodos`)} className="text-emerald-400 text-sm hover:underline">
                  Ir a períodos →
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  <th className="text-left text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Unidad</th>
                  <th className="text-left text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Propietario</th>
                  <th className="text-right text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Monto</th>
                  <th className="text-center text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Estado</th>
                  <th className="text-right text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {expensasFiltradas.map(e => (
                  <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-slate-300 font-medium">{e.unidad_nombre ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{e.propietario_nombre ?? '—'}</td>
                    <td className="px-5 py-3.5 text-right text-white font-medium">${Number(e.monto_total || 0).toLocaleString('es-AR')}</td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant={e.pagado ? 'success' : 'warning'}>
                        {e.pagado ? 'Pagada' : 'Pendiente'}
                      </Badge>
                    </td>
                          <td className="px-5 py-3.5 text-right">
                          {!e.pagado
                          ? <MarcarPagadaBtn expensaId={e.id} onPagada={onPagada} cid={cid} />
                          : <RevertirPagoBtn expensaId={e.id} onRevertida={onRevertida} cid={cid} />
                          }
                          </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-800 border border-white/[0.08]
                        rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl animate-fade-up">
          <Icon path={ICONS.check} size={18} className="text-emerald-400 shrink-0" />
          <p className="text-white text-sm">{toast}</p>
        </div>
      )}
    </>
  );
}

// ── Vista propietario/inquilino (historial) ────────────────
function VistaHistorial({ periodos, navigate, usuario, cid }) {
  const periodosCerrados = periodos.filter(p => p.cerrado === true);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[hsl(222,47%,7%)]/80
                         backdrop-blur-sm px-6 py-4 flex items-center gap-3">
        <button onClick={() => navigate(`/consorcios/${cid}/dashboard`)} className="text-slate-500 hover:text-white transition-colors">
          <Icon path={ICONS.atras} size={18} />
        </button>
        <div>
          <h1 className="text-white text-lg font-semibold leading-none">Mis expensas</h1>
          <p className="text-slate-500 text-xs mt-1">
            {periodosCerrados.length} período{periodosCerrados.length !== 1 ? 's' : ''} con expensas
          </p>
        </div>
      </header>

      <div className="p-6 space-y-3">
        {periodosCerrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon path={ICONS.expensa} size={32} className="text-slate-600" />
            <p className="text-slate-400 text-sm">No hay períodos cerrados aún</p>
          </div>
        ) : (
          periodosCerrados.map(p => (
            <FilaPeriodoHistorial key={p.id} periodo={p} email={usuario?.email} cid={cid} />
          ))
        )}
      </div>
    </>
  );
}

// ── Página principal ───────────────────────────────────────
export default function ExpensasPage() {
  const { usuario, consorcioActual } = useAuth();
  const navigate    = useNavigate();
  const { cid }     = useParams();
  const api         = apiConsorcio(cid);
  const [params]    = useSearchParams();
  const esAdmin     = consorcioActual?.mi_rol === 'administrador';

  const [periodos,  setPeriodos]  = useState([]);
  const [cargando,  setCargando]  = useState(true);

  useEffect(() => {
    api.get('/periodos')
      .then(r => setPeriodos(r.data.datos ?? r.data))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {esAdmin
        ? <VistaAdmin periodos={periodos} params={params} navigate={navigate} cid={cid} />
        : <VistaHistorial periodos={periodos} navigate={navigate} usuario={usuario} cid={cid} />
      }
    </Layout>
  );
}
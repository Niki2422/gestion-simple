// ============================================================
// GastosPage.jsx
// Ubicación: src/pages/GastosPage.jsx
// ============================================================
 
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../lib/api';
 
const Icon = ({ path, size = 18, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none"
    stroke="currentColor" viewBox="0 0 24 24" style={{ minWidth: size, minHeight: size }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);
const ICONS = {
  mas:     'M12 4.5v15m7.5-7.5h-15',
  basura:  'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
  alerta:  'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  check:   'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  atras:   'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
  gasto:   'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
};
 
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const formatearPeriodo = (p) => { if (!p) return ''; const [a, m] = p.split('-'); return `${MESES[parseInt(m)-1]} ${a}`; };
 
const Badge = ({ children, variant = 'default' }) => {
  const v = { default: 'bg-slate-700/50 text-slate-300', success: 'bg-emerald-400/15 text-emerald-400', warning: 'bg-amber-400/15 text-amber-400' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${v[variant]}`}>{children}</span>;
};
const Spinner = () => <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />;
 
const Modal = ({ titulo, children, onCerrar }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-[hsl(222,47%,10%)] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm space-y-4">
      <h3 className="text-white font-semibold">{titulo}</h3>
      {children}
    </div>
  </div>
);
 
export default function GastosPage() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const esAdmin     = usuario?.rol === 'administrador';
 
  const [periodos,      setPeriodos]      = useState([]);
  const [periodoSel,    setPeriodoSel]    = useState(params.get('periodoId') || '');
  const [gastos,        setGastos]        = useState([]);
  const [cargando,      setCargando]      = useState(false);
  const [toast,         setToast]         = useState('');
  const [error,         setError]         = useState('');
 
  // Formulario
  const [mostrarForm,   setMostrarForm]   = useState(false);
  const [form,          setForm]          = useState({ descripcion: '', monto: '', tipo: 'ordinario' });
  const [creando,       setCreando]       = useState(false);
  const [errorForm,     setErrorForm]     = useState('');
 
  // Confirm eliminar
  const [gastoAEliminar, setGastoAEliminar] = useState(null);
  const [eliminando,     setEliminando]     = useState(false);
 
  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };
 
  // Cargar períodos al montar
  useEffect(() => {
    api.get('/periodos').then(r => {
      const data = r.data.datos ?? r.data;
      setPeriodos(data);
      if (!periodoSel && data.length > 0) {
        const abierto = data.find(p => p.estado === 'abierto');
        setPeriodoSel(abierto?.id ?? data[0].id);
      }
    });
  }, []);
 
  // Cargar gastos cuando cambia el período
  useEffect(() => {
    if (!periodoSel) return;
    setCargando(true);
    setError('');
    api.get(`/gastos?periodoId=${periodoSel}`)
      .then(r => setGastos(r.data.datos ?? r.data))
      .catch(() => setError('No se pudieron cargar los gastos'))
      .finally(() => setCargando(false));
  }, [periodoSel]);
 
  const handleCrear = async () => {
    if (!form.descripcion || !form.monto) { setErrorForm('Completá todos los campos'); return; }
    setCreando(true); setErrorForm('');
    try {
      await api.post('/gastos', { ...form, monto: parseFloat(form.monto), periodoId: periodoSel });
      setMostrarForm(false);
      setForm({ descripcion: '', monto: '', tipo: 'ordinario' });
      mostrarToast('Gasto registrado correctamente');
      const r = await api.get(`/gastos?periodoId=${periodoSel}`);
      setGastos(r.data.datos ?? r.data);
    } catch (e) {
      setErrorForm(e.response?.data?.mensaje || 'Error al crear el gasto');
    } finally { setCreando(false); }
  };
 
  const handleEliminar = async () => {
    if (!gastoAEliminar) return;
    setEliminando(true);
    try {
      await api.delete(`/gastos/${gastoAEliminar.id}`);
      setGastos(prev => prev.filter(g => g.id !== gastoAEliminar.id));
      mostrarToast('Gasto eliminado');
      setGastoAEliminar(null);
    } catch (e) {
      mostrarToast(e.response?.data?.mensaje || 'Error al eliminar');
      setGastoAEliminar(null);
    } finally { setEliminando(false); }
  };
 
  const totalGastos = gastos.reduce((s, g) => s + Number(g.monto || 0), 0);
  const periodoActual  = periodos.find(p => p.id === periodoSel);
  const periodoAbierto = periodoActual?.cerrado === false;
 
  return (
    <Layout>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[hsl(222,47%,7%)]/80
                         backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-white transition-colors">
            <Icon path={ICONS.atras} size={18} />
          </button>
          <div>
            <h1 className="text-white text-lg font-semibold leading-none">Gastos</h1>
            <p className="text-slate-500 text-xs mt-1">
              {periodoActual ? formatearPeriodo(periodoActual.periodo) : 'Seleccioná un período'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Selector período */}
          <select value={periodoSel} onChange={e => setPeriodoSel(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-lg
                       px-3 py-2 focus:outline-none focus:border-emerald-400/50 [color-scheme:dark]">
            {periodos.map(p => (
              <option key={p.id} value={p.id}>
                {formatearPeriodo(p.periodo)} {p.cerrado === false ? '(abierto)' : ''}
              </option>
            ))}
          </select>
          {esAdmin && periodoAbierto && (
            <button onClick={() => setMostrarForm(true)}
              className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300
                         text-slate-900 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150">
              <Icon path={ICONS.mas} size={16} />
              Nuevo gasto
            </button>
          )}
        </div>
      </header>
 
      <div className="p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <Icon path={ICONS.alerta} size={18} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
 
        {/* Resumen */}
        {!cargando && gastos.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total gastos</p>
              <p className="text-white text-xl font-semibold">${totalGastos.toLocaleString('es-AR')}</p>
            </div>
            <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Ordinarios</p>
              <p className="text-white text-xl font-semibold">
                ${gastos.filter(g=>g.tipo==='ordinario').reduce((s,g)=>s+Number(g.monto||0),0).toLocaleString('es-AR')}
              </p>
            </div>
            <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-4">
              <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">Extraordinarios</p>
              <p className="text-white text-xl font-semibold">
                ${gastos.filter(g=>g.tipo==='extraordinario').reduce((s,g)=>s+Number(g.monto||0),0).toLocaleString('es-AR')}
              </p>
            </div>
          </div>
        )}
 
        {/* Tabla */}
        <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl overflow-hidden">
          {cargando ? (
            <div className="flex items-center justify-center py-20"><Spinner /></div>
          ) : gastos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Icon path={ICONS.gasto} size={32} className="text-slate-600" />
              <p className="text-slate-400 text-sm">Sin gastos en este período</p>
              {esAdmin && periodoAbierto && (
                <button onClick={() => setMostrarForm(true)} className="text-emerald-400 text-sm hover:underline">
                  Cargar el primer gasto →
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  <th className="text-left text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Descripción</th>
                  <th className="text-left text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Tipo</th>
                  <th className="text-left text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Fecha</th>
                  <th className="text-right text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Monto</th>
                  {esAdmin && periodoAbierto && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {gastos.map(g => (
                  <tr key={g.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-slate-300">{g.descripcion}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={g.tipo === 'ordinario' ? 'success' : 'warning'}>
                        {g.tipo === 'ordinario' ? 'Ordinario' : 'Extraordinario'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">
                      {g.fecha ? new Date(g.fecha).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right text-white font-medium">
                      ${Number(g.monto || 0).toLocaleString('es-AR')}
                    </td>
                    {esAdmin && periodoAbierto && (
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => setGastoAEliminar(g)}
                          className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                          <Icon path={ICONS.basura} size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-white/[0.06]">
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-slate-500 text-xs">Total</td>
                  <td className="px-5 py-3 text-right text-emerald-400 font-semibold">
                    ${totalGastos.toLocaleString('es-AR')}
                  </td>
                  {esAdmin && periodoAbierto && <td />}
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
 
      {/* Modal nuevo gasto */}
      {mostrarForm && (
        <Modal titulo="Nuevo gasto" onCerrar={() => setMostrarForm(false)}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs uppercase tracking-wider">Descripción</label>
              <input value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})}
                placeholder="Ej: Luz, Agua, Ascensor..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                           text-white text-sm placeholder:text-slate-600
                           focus:outline-none focus:border-emerald-400/50 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Monto</label>
                <input type="number" min="0" step="0.01" value={form.monto}
                  onChange={e => setForm({...form, monto: e.target.value})}
                  placeholder="0.00"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                             text-white text-sm placeholder:text-slate-600
                             focus:outline-none focus:border-emerald-400/50 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Tipo</label>
                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                             text-white text-sm focus:outline-none focus:border-emerald-400/50
                             transition-all [color-scheme:dark]">
                  <option value="ordinario">Ordinario</option>
                  <option value="extraordinario">Extraordinario</option>
                </select>
              </div>
            </div>
            {errorForm && <p className="text-red-400 text-xs">{errorForm}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setMostrarForm(false); setErrorForm(''); }}
                className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white
                           rounded-lg py-2.5 text-sm transition-all">
                Cancelar
              </button>
              <button onClick={handleCrear} disabled={creando}
                className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold
                           rounded-lg py-2.5 text-sm transition-all disabled:opacity-50
                           flex items-center justify-center gap-2">
                {creando ? <Spinner /> : null}
                {creando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
 
      {/* Modal confirmar eliminar */}
      {gastoAEliminar && (
        <Modal titulo="Eliminar gasto">
          <p className="text-slate-400 text-sm">
            ¿Eliminar <span className="text-white font-medium">{gastoAEliminar.descripcion}</span>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setGastoAEliminar(null)} disabled={eliminando}
              className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white
                         rounded-lg py-2.5 text-sm transition-all disabled:opacity-50">
              Cancelar
            </button>
            <button onClick={handleEliminar} disabled={eliminando}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold
                         rounded-lg py-2.5 text-sm transition-all disabled:opacity-50
                         flex items-center justify-center gap-2">
              {eliminando ? <Spinner /> : null}
              {eliminando ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
 
      {/* Toast */}
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
 
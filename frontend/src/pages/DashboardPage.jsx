// ============================================================
// DashboardPage.jsx
// Ubicación: src/pages/DashboardPage.jsx
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../lib/api';

const Icon = ({ path, size = 20, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none"
    stroke="currentColor" viewBox="0 0 24 24" style={{ minWidth: size, minHeight: size }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

const ICONS = {
  edificio:  'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  calendario:'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  gasto:     'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  expensa:   'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  check:     'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  alerta:    'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  cerrar:    'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  flecha:    'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3',
  refresh:   'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99',
};

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const formatearPeriodo = (p) => { if (!p) return ''; const [a, m] = p.split('-'); return `${MESES[parseInt(m)-1]} ${a}`; };

const Skeleton = ({ className = '' }) => (
  <div className={`bg-slate-700/40 rounded animate-pulse ${className}`} />
);
const StatCardSkeleton = () => (
  <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-5 flex gap-4 items-start">
    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-28" />
    </div>
  </div>
);
const CardSkeleton = () => (
  <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-5 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-4 rounded" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = { default: 'bg-slate-700/50 text-slate-300', success: 'bg-emerald-400/15 text-emerald-400', warning: 'bg-amber-400/15 text-amber-400' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]}`}>{children}</span>;
};

const StatCard = ({ icon, label, value, sub, accent = 'emerald' }) => {
  const accents = {
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    sky:     'text-sky-400 bg-sky-400/10 border-sky-400/20',
    amber:   'text-amber-400 bg-amber-400/10 border-amber-400/20',
    rose:    'text-rose-400 bg-rose-400/10 border-rose-400/20',
  };
  return (
    <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-5 flex gap-4 items-start">
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${accents[accent]}`}>
        <Icon path={ICONS[icon]} size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">{label}</p>
        <p className="text-white text-2xl font-semibold leading-none">{value ?? '—'}</p>
        {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
      </div>
    </div>
  );
};

function MarcarPagadaBtn({ expensaId, onPagada }) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    try { await api.patch(`/expensas/${expensaId}/pagar`); onPagada(expensaId); }
    catch { }
    finally { setLoading(false); }
  };
  return (
    <button onClick={handleClick} disabled={loading}
      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs transition-colors disabled:opacity-50">
      {loading ? <div className="w-3 h-3 rounded-full border border-emerald-400 border-t-transparent animate-spin" /> : <Icon path={ICONS.check} size={14} />}
      Pagar
    </button>
  );
}

const LoadingScreen = () => (
  <Layout>
    <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[hsl(222,47%,7%)]/80 backdrop-blur-sm px-6 py-4">
      <Skeleton className="h-5 w-24 mb-1.5" /><Skeleton className="h-3 w-36" />
    </header>
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}</div>
      <div className="grid lg:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
      <CardSkeleton />
    </div>
  </Layout>
);

const ErrorScreen = ({ mensaje, onReintentar }) => (
  <Layout>
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <Icon path={ICONS.alerta} size={28} className="text-red-400" />
      </div>
      <div className="text-center space-y-1">
        <h2 className="text-white font-semibold">No se pudo cargar el dashboard</h2>
        <p className="text-slate-500 text-sm max-w-sm">{mensaje}</p>
      </div>
      <button onClick={onReintentar}
        className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-lg transition-all">
        <Icon path={ICONS.refresh} size={16} />Reintentar
      </button>
    </div>
  </Layout>
);

export default function DashboardPage() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();
  const esAdmin     = usuario?.rol === 'administrador';

  const [periodos,        setPeriodos]        = useState([]);
  const [gastos,          setGastos]          = useState([]);
  const [unidades,        setUnidades]        = useState([]);
  const [expensas,        setExpensas]        = useState([]);
  const [periodoCerrado,  setPeriodoCerrado]  = useState(null);
  const [estado,          setEstado]          = useState('cargando');
  const [mensajeError,    setMensajeError]    = useState('');

  const periodoActivo = periodos.find(p => p.cerrado === false);

  const cargar = async () => {
    setEstado('cargando');
    try {
      const [rPeriodos, rUnidades] = await Promise.all([
        api.get('/periodos'),
        api.get('/unidades'),
      ]);
      const listaPeriodos = rPeriodos.data.datos ?? rPeriodos.data;
      const listaUnidades = rUnidades.data.datos ?? rUnidades.data;
      setPeriodos(listaPeriodos);
      setUnidades(listaUnidades);

      if (esAdmin) {
        // Período abierto → cargar gastos
        const activo   = listaPeriodos.find(p => p.cerrado === false);
        // Último período cerrado → cargar expensas
        const cerrado  = listaPeriodos.find(p => p.cerrado === true);

        const promesas = [];
        if (activo)  promesas.push(api.get(`/gastos?periodoId=${activo.id}`));
        else         promesas.push(Promise.resolve({ data: { datos: [] } }));
        if (cerrado) promesas.push(api.get(`/expensas?periodoId=${cerrado.id}`));
        else         promesas.push(Promise.resolve({ data: { datos: [] } }));

        const [rGastos, rExpensas] = await Promise.all(promesas);
        setGastos(rGastos.data.datos     ?? rGastos.data);
        setExpensas(rExpensas.data.datos ?? rExpensas.data);
        setPeriodoCerrado(cerrado ?? null);
      } else {
        // Propietario/inquilino → último período cerrado
        const reciente = listaPeriodos.find(p => p.cerrado === true);
        if (reciente) {
          const rExpensas = await api.get(`/expensas?periodoId=${reciente.id}`);
          setExpensas(rExpensas.data.datos ?? rExpensas.data);
          setPeriodoCerrado(reciente);
        }
        setGastos([]);
      }

      setEstado('ok');
    } catch (e) {
      setMensajeError(e.code === 'ERR_NETWORK'
        ? 'No se puede conectar con el servidor.'
        : 'Ocurrió un error al cargar los datos.');
      setEstado('error');
    }
  };

  useEffect(() => { cargar(); }, []);

  if (estado === 'cargando') return <LoadingScreen />;
  if (estado === 'error')    return <ErrorScreen mensaje={mensajeError} onReintentar={cargar} />;

  const totalGastos        = gastos.reduce((s, g) => s + (Number(g.monto) || 0), 0);
  const expensasPendientes = expensas.filter(e => !e.pagado).length;
  const expensasPagadas    = expensas.filter(e => e.pagado).length;
  const unidadesActivas    = unidades.filter(u => u.activa !== false).length;

  return (
    <Layout>
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[hsl(222,47%,7%)]/80
                         backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white text-lg font-semibold leading-none">Dashboard</h1>
          <p className="text-slate-500 text-xs mt-1">
            {esAdmin
              ? periodoActivo ? `Período activo: ${periodoActivo.periodo}` : 'Sin período activo'
              : periodoCerrado ? `Último período: ${formatearPeriodo(periodoCerrado.periodo)}` : 'Sin períodos'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={cargar}
            className="text-slate-600 hover:text-slate-400 transition-colors p-1.5 rounded-lg hover:bg-white/[0.04]"
            title="Actualizar datos">
            <Icon path={ICONS.refresh} size={16} />
          </button>
          {esAdmin && periodoActivo && (
            <button onClick={() => navigate('/gastos')}
              className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300
                         text-slate-900 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150">
              <Icon path={ICONS.gasto} size={16} />
              Cargar gasto
            </button>
          )}
        </div>
      </header>

      <div className="p-6 space-y-6">

        {/* Stats */}
        {esAdmin ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="edificio"   accent="emerald"
              label="Unidades"           value={unidadesActivas}
              sub="activas en el consorcio" />
            <StatCard icon="gasto"      accent="amber"
              label="Gastos del período"
              value={`$${totalGastos.toLocaleString('es-AR')}`}
              sub={periodoActivo ? 'período actual' : 'sin período activo'} />
            <StatCard icon="expensa"    accent="rose"
              label="Expensas pendientes" value={expensasPendientes}
              sub={periodoCerrado ? `de ${formatearPeriodo(periodoCerrado.periodo)}` : 'sin períodos cerrados'} />
            <StatCard icon="calendario" accent="sky"
              label="Períodos"            value={periodos.length}
              sub={periodoActivo ? '1 abierto' : 'ninguno abierto'} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <StatCard icon="expensa" accent="rose"
              label="Expensas pendientes" value={expensasPendientes}
              sub={periodoCerrado ? formatearPeriodo(periodoCerrado.periodo) : '—'} />
            <StatCard icon="expensa" accent="emerald"
              label="Expensas pagadas" value={expensasPagadas}
              sub="últimos períodos" />
          </div>
        )}

        {/* Período activo + últimos gastos — solo admin */}
        {esAdmin && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-sm font-semibold">Período activo</h2>
                <button onClick={() => navigate('/periodos')} className="text-slate-500 hover:text-emerald-400 transition-colors">
                  <Icon path={ICONS.flecha} size={16} />
                </button>
              </div>
              {periodoActivo ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">{periodoActivo.periodo}</span>
                    <Badge variant="success">Abierto</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Gastos cargados</span>
                    <span className="text-slate-300">{gastos.length}</span>
                  </div>
                  <button onClick={() => navigate('/periodos')}
                    className="mt-2 w-full flex items-center justify-center gap-2 border border-white/[0.08]
                               hover:border-amber-400/40 hover:text-amber-400 text-slate-400 text-xs
                               rounded-lg py-2 transition-all duration-150">
                    <Icon path={ICONS.cerrar} size={14} />
                    Ir a cerrar período
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Icon path={ICONS.alerta} size={28} className="text-slate-600" />
                  <p className="text-slate-500 text-sm">No hay período activo</p>
                  <button onClick={() => navigate('/periodos')} className="text-emerald-400 text-sm hover:underline">
                    Crear período →
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-sm font-semibold">Últimos gastos</h2>
                <button onClick={() => navigate('/gastos')} className="text-slate-500 hover:text-emerald-400 transition-colors">
                  <Icon path={ICONS.flecha} size={16} />
                </button>
              </div>
              {gastos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Icon path={ICONS.gasto} size={28} className="text-slate-600" />
                  <p className="text-slate-500 text-sm">Sin gastos en este período</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {gastos.slice(0, 5).map(g => (
                    <div key={g.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                      <p className="text-slate-300 text-sm truncate min-w-0">{g.descripcion ?? 'Gasto'}</p>
                      <span className="text-amber-400 text-sm font-medium ml-3 shrink-0">
                        ${Number(g.monto ?? 0).toLocaleString('es-AR')}
                      </span>
                    </div>
                  ))}
                  {gastos.length > 5 && (
                    <button onClick={() => navigate('/gastos')} className="text-slate-500 hover:text-emerald-400 text-xs pt-1 transition-colors">
                      Ver todos ({gastos.length}) →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expensas — último período cerrado */}
        <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white text-sm font-semibold">
                {esAdmin ? 'Expensas del período' : 'Mis expensas'}
              </h2>
              {periodoCerrado && (
                <p className="text-slate-500 text-xs mt-0.5">
                  {formatearPeriodo(periodoCerrado.periodo)} · {periodoCerrado.cerrado ? 'Cerrado' : 'Abierto'}
                </p>
              )}
            </div>
            <button onClick={() => navigate('/expensas')} className="text-slate-500 hover:text-emerald-400 transition-colors">
              <Icon path={ICONS.flecha} size={16} />
            </button>
          </div>
          {expensas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Icon path={ICONS.expensa} size={28} className="text-slate-600" />
              <p className="text-slate-500 text-sm">
                {esAdmin ? 'No hay períodos cerrados con expensas' : 'No tenés expensas en el período más reciente'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left text-slate-500 text-xs uppercase tracking-wider pb-3 font-medium">Unidad</th>
                    <th className="text-right text-slate-500 text-xs uppercase tracking-wider pb-3 font-medium">Monto</th>
                    <th className="text-center text-slate-500 text-xs uppercase tracking-wider pb-3 font-medium">Estado</th>
                    {esAdmin && <th className="text-right text-slate-500 text-xs uppercase tracking-wider pb-3 font-medium">Acción</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {expensas.slice(0, 8).map(e => (
                    <tr key={e.id} className="group">
                      <td className="py-3 text-slate-300">{e.unidad_nombre ?? '—'}</td>
                      <td className="py-3 text-right text-white font-medium">${Number(e.monto_total ?? 0).toLocaleString('es-AR')}</td>
                      <td className="py-3 text-center">
                        <Badge variant={e.pagado ? 'success' : 'warning'}>
                          {e.pagado ? 'Pagada' : 'Pendiente'}
                        </Badge>
                      </td>
                      {esAdmin && (
                        <td className="py-3 text-right">
                          {!e.pagado && (
                            <MarcarPagadaBtn expensaId={e.id}
                              onPagada={(id) => setExpensas(prev => prev.map(x => x.id === id ? {...x, pagado: true} : x))} />
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {expensas.length > 8 && (
                <button onClick={() => navigate('/expensas')} className="text-slate-500 hover:text-emerald-400 text-xs mt-3 transition-colors">
                  Ver todas ({expensas.length}) →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Unidades — solo admin */}
        {esAdmin && (
          <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-sm font-semibold">Unidades</h2>
              <button onClick={() => navigate('/unidades')} className="text-slate-500 hover:text-emerald-400 transition-colors">
                <Icon path={ICONS.flecha} size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {unidades.slice(0, 12).map(u => (
                <div key={u.id} className="bg-slate-800/50 border border-white/[0.05] rounded-lg p-3 text-center">
                  <p className="text-white text-sm font-medium">{u.nombre}</p>
                  {u.coeficiente != null && (
                    <p className="text-emerald-400 text-xs mt-1">{Number(u.coeficiente).toFixed(2)}%</p>
                  )}
                </div>
              ))}
              {unidades.length > 12 && (
                <div className="bg-slate-800/30 border border-white/[0.05] rounded-lg p-3
                                flex items-center justify-center cursor-pointer hover:border-emerald-400/30 transition-colors"
                  onClick={() => navigate('/unidades')}>
                  <span className="text-slate-500 text-xs">+{unidades.length - 12} más</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
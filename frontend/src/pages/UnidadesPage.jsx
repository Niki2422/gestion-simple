// ============================================================
// UnidadesPage.jsx
// Ubicación: src/pages/UnidadesPage.jsx
// ============================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import EmptyState from '../components/EmptyState';
import api from '../lib/api';

const Icon = ({ path, size = 18, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none"
    stroke="currentColor" viewBox="0 0 24 24" style={{ minWidth: size, minHeight: size }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);
const ICONS = {
  mas:     'M12 4.5v15m7.5-7.5h-15',
  editar:  'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
  basura:  'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
  alerta:  'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  check:   'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  atras:   'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
  edificio:'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
  coche:   'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12',
};

const Spinner = () => <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />;

const Modal = ({ titulo, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-[hsl(222,47%,10%)] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md space-y-4">
      <h3 className="text-white font-semibold">{titulo}</h3>
      {children}
    </div>
  </div>
);

const FORM_VACIO = { nombre: '', tipo: 'departamento', coeficiente: '', propietarioId: '', inquilinoId: '' };

export default function UnidadesPage() {
  const { usuario } = useAuth();
  const navigate    = useNavigate();
  const esAdmin     = usuario?.rol === 'administrador';

  const [unidades,     setUnidades]     = useState([]);
  const [usuarios,     setUsuarios]     = useState([]);
  const [deudas,       setDeudas]       = useState({}); // { unidad_id: { pendientes, monto_pendiente } }
  const [cargando,     setCargando]     = useState(true);
  const [toast,        setToast]        = useState('');
  const [error,        setError]        = useState('');

  const [modal,        setModal]        = useState(null);
  const [unidadSel,    setUnidadSel]    = useState(null);
  const [form,         setForm]         = useState(FORM_VACIO);
  const [guardando,    setGuardando]    = useState(false);
  const [errorForm,    setErrorForm]    = useState('');

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const cargar = async () => {
    try {
      setCargando(true);
      const promesas = [
        api.get('/unidades'),
        esAdmin ? api.get('/usuarios') : Promise.resolve({ data: { datos: [] } }),
        esAdmin ? api.get('/expensas/deudas') : Promise.resolve({ data: { datos: [] } }),
      ];
      const [ru, rus, rd] = await Promise.all(promesas);
      setUnidades(ru.data.datos ?? ru.data);
      setUsuarios(rus.data.datos ?? rus.data);

      // Convertir array de deudas a mapa por unidad_id para acceso O(1)
      const mapaDeudas = {};
      const listaDeudas = rd.data.datos ?? rd.data;
      listaDeudas.forEach(d => { mapaDeudas[d.unidad_id] = d; });
      setDeudas(mapaDeudas);
    } catch { setError('No se pudieron cargar las unidades'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => { setForm(FORM_VACIO); setErrorForm(''); setModal('crear'); };
  const abrirEditar = (u) => {
    setUnidadSel(u);
    setForm({
      nombre:        u.nombre ?? '',
      tipo:          u.tipo ?? 'departamento',
      coeficiente:   u.coeficiente ?? '',
      propietarioId: u.propietario_id ?? '',
      inquilinoId:   u.inquilino_id ?? '',
    });
    setErrorForm('');
    setModal('editar');
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.coeficiente) { setErrorForm('Nombre y coeficiente son requeridos'); return; }
    setGuardando(true); setErrorForm('');
    try {
      const payload = {
        nombre:        form.nombre,
        tipo:          form.tipo,
        coeficiente:   parseFloat(form.coeficiente),
        propietarioId: form.propietarioId || null,
        inquilinoId:   form.inquilinoId   || null,
      };
      if (modal === 'crear') {
        await api.post('/unidades', payload);
        mostrarToast('Unidad creada correctamente');
      } else {
        await api.put(`/unidades/${unidadSel.id}`, payload);
        mostrarToast('Unidad actualizada correctamente');
      }
      setModal(null);
      cargar();
    } catch (e) {
      setErrorForm(e.response?.data?.mensaje || 'Error al guardar la unidad');
    } finally { setGuardando(false); }
  };

  const handleDesactivar = async () => {
    if (!unidadSel) return;
    setGuardando(true);
    try {
      await api.delete(`/unidades/${unidadSel.id}`);
      mostrarToast('Unidad desactivada');
      setModal(null);
      cargar();
    } catch (e) {
      mostrarToast(e.response?.data?.mensaje || 'Error al desactivar');
      setModal(null);
    } finally { setGuardando(false); }
  };

  const propietarios  = usuarios.filter(u => u.rol === 'propietario');
  const inquilinos    = usuarios.filter(u => u.rol === 'inquilino');
  const sumaCoef      = unidades.reduce((s, u) => s + Number(u.coeficiente || 0), 0);
  const unidadesDeuda = Object.values(deudas).filter(d => Number(d.pendientes) > 0).length;

  return (
    <Layout>
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[hsl(222,47%,7%)]/80
                         backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-white transition-colors">
            <Icon path={ICONS.atras} size={18} />
          </button>
          <div>
            <h1 className="text-white text-lg font-semibold leading-none">Unidades</h1>
            <p className="text-slate-500 text-xs mt-1">
              {unidades.length} unidad{unidades.length !== 1 ? 'es' : ''} · Σ {sumaCoef.toFixed(4)}%
              {esAdmin && unidadesDeuda > 0 && (
                <span className="text-red-400 ml-2">· {unidadesDeuda} con deuda pendiente</span>
              )}
            </p>
          </div>
        </div>
        {esAdmin && (
          <button onClick={abrirCrear}
            className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300
                       text-slate-900 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150">
            <Icon path={ICONS.mas} size={16} />
            Nueva unidad
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

        {cargando ? (
          <div className="flex items-center justify-center py-20"><Spinner /></div>
        ) : unidades.length === 0 ? (
          <EmptyState
            icon={ICONS.edificio}
            titulo="No hay unidades todavía"
            descripcion="Registrá las unidades del consorcio para poder asignar propietarios, inquilinos y calcular expensas."
            accion={esAdmin ? 'Crear primera unidad' : undefined}
            onAccion={esAdmin ? abrirCrear : undefined}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {unidades.map(u => {
              const deuda       = deudas[u.id];
              const tieneDeuda  = esAdmin && deuda && Number(deuda.pendientes) > 0;
              const montoPend   = tieneDeuda ? Number(deuda.monto_pendiente) : 0;

              return (
                <div key={u.id}
                  className={`bg-slate-900/60 border rounded-xl p-5 space-y-3
                             hover:border-white/[0.12] transition-all group relative
                             ${tieneDeuda ? 'border-red-500/30' : 'border-white/[0.06]'}`}>

                  {/* Punto rojo de deuda */}
                  {tieneDeuda && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-400
                                    shadow-[0_0_6px_rgba(248,113,113,0.8)]" />
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                        ${u.tipo === 'cochera'
                          ? 'bg-sky-400/10 border border-sky-400/20'
                          : tieneDeuda
                            ? 'bg-red-500/10 border border-red-500/20'
                            : 'bg-emerald-400/10 border border-emerald-400/20'}`}>
                        <Icon path={u.tipo === 'cochera' ? ICONS.coche : ICONS.edificio} size={15}
                          className={u.tipo === 'cochera' ? 'text-sky-400' : tieneDeuda ? 'text-red-400' : 'text-emerald-400'} />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{u.nombre}</p>
                        <p className="text-slate-500 text-xs capitalize">{u.tipo}</p>
                      </div>
                    </div>
                    {esAdmin && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => abrirEditar(u)}
                          className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors">
                          <Icon path={ICONS.editar} size={15} />
                        </button>
                        <button onClick={() => { setUnidadSel(u); setModal('eliminar'); }}
                          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                          <Icon path={ICONS.basura} size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/[0.06] pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Coeficiente</span>
                      <span className="text-emerald-400 font-medium">{Number(u.coeficiente).toFixed(4)}%</span>
                    </div>
                    {u.propietario_nombre && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Propietario</span>
                        <span className="text-slate-300 truncate max-w-[120px]">{u.propietario_nombre}</span>
                      </div>
                    )}
                    {u.inquilino_nombre && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Inquilino</span>
                        <span className="text-slate-300 truncate max-w-[120px]">{u.inquilino_nombre}</span>
                      </div>
                    )}
                    {/* Indicador de deuda */}
                    {tieneDeuda && (
                      <div className="flex justify-between text-xs pt-1 border-t border-red-500/10 mt-1">
                        <span className="text-red-400 font-medium">
                          {Number(deuda.pendientes)} expensa{Number(deuda.pendientes) !== 1 ? 's' : ''} pendiente{Number(deuda.pendientes) !== 1 ? 's' : ''}
                        </span>
                        <span className="text-red-400 font-semibold">
                          ${montoPend.toLocaleString('es-AR')}
                        </span>
                      </div>
                    )}
                    {esAdmin && !tieneDeuda && deuda && Number(deuda.pendientes) === 0 && (
                      <div className="flex items-center gap-1 text-xs pt-1 border-t border-white/[0.04] mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-emerald-400">Al día</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nueva unidad' : 'Editar unidad'}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Nombre / Número</label>
                <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                  placeholder="Ej: 1A, 2B, Cochera 1"
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
                  <option value="departamento">Departamento</option>
                  <option value="cochera">Cochera</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs uppercase tracking-wider">Coeficiente (%)</label>
              <input type="number" min="0" max="100" step="0.0001" value={form.coeficiente}
                onChange={e => setForm({...form, coeficiente: e.target.value})}
                placeholder="Ej: 3.5"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                           text-white text-sm placeholder:text-slate-600
                           focus:outline-none focus:border-emerald-400/50 transition-all" />
              <p className="text-slate-600 text-xs">Suma actual: {sumaCoef.toFixed(4)}% de 100%</p>
            </div>
            {propietarios.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Propietario (opcional)</label>
                <select value={form.propietarioId} onChange={e => setForm({...form, propietarioId: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                             text-white text-sm focus:outline-none focus:border-emerald-400/50
                             transition-all [color-scheme:dark]">
                  <option value="">Sin propietario</option>
                  {propietarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
            )}
            {inquilinos.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Inquilino (opcional)</label>
                <select value={form.inquilinoId} onChange={e => setForm({...form, inquilinoId: e.target.value})}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                             text-white text-sm focus:outline-none focus:border-emerald-400/50
                             transition-all [color-scheme:dark]">
                  <option value="">Sin inquilino</option>
                  {inquilinos.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
            )}
            {errorForm && <p className="text-red-400 text-xs">{errorForm}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)}
                className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white
                           rounded-lg py-2.5 text-sm transition-all">
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando}
                className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-slate-900 font-semibold
                           rounded-lg py-2.5 text-sm transition-all disabled:opacity-50
                           flex items-center justify-center gap-2">
                {guardando ? <Spinner /> : null}
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'eliminar' && (
        <Modal titulo="Desactivar unidad">
          <p className="text-slate-400 text-sm">
            ¿Desactivar la unidad <span className="text-white font-medium">{unidadSel?.nombre}</span>?
            No se eliminará de la base de datos.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} disabled={guardando}
              className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white
                         rounded-lg py-2.5 text-sm transition-all disabled:opacity-50">Cancelar</button>
            <button onClick={handleDesactivar} disabled={guardando}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold
                         rounded-lg py-2.5 text-sm transition-all disabled:opacity-50
                         flex items-center justify-center gap-2">
              {guardando ? <Spinner /> : null}
              {guardando ? 'Desactivando…' : 'Desactivar'}
            </button>
          </div>
        </Modal>
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
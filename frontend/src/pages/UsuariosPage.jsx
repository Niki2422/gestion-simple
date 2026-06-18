// ============================================================
// UsuariosPage.jsx — Solo administrador del consorcio
// Ubicación: src/pages/UsuariosPage.jsx
//
// Gestiona la membresía de usuarios DENTRO de un consorcio.
//   - Crear: si el email ya existe en la plataforma, se agrega
//     al consorcio con el rol elegido; si no existe, se crea.
//   - Editar: solo permite cambiar el rol dentro del consorcio
//     (nombre/email son globales a la plataforma).
//   - Eliminar: quita la membresía del consorcio (no borra
//     al usuario de la plataforma).
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
  mas:     'M12 4.5v15m7.5-7.5h-15',
  editar:  'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10',
  basura:  'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0',
  alerta:  'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
  check:   'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  atras:   'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
  ojo:     'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  ojoCerrado: 'M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88',
  edificio: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z',
};

const ROLES = ['administrador', 'propietario', 'inquilino'];
const BADGE_ROL = {
  administrador: 'bg-purple-400/15 text-purple-400',
  propietario:   'bg-emerald-400/15 text-emerald-400',
  inquilino:     'bg-sky-400/15 text-sky-400',
};

const Spinner = () => <div className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />;

const Modal = ({ titulo, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-[hsl(222,47%,10%)] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm space-y-4">
      <h3 className="text-white font-semibold">{titulo}</h3>
      {children}
    </div>
  </div>
);

const FORM_VACIO = { nombre: '', email: '', contrasena: '', rol: 'propietario' };

export default function UsuariosPage() {
  const { usuario: usuarioActual } = useAuth();
  const navigate = useNavigate();
  const { cid }  = useParams();
  const api      = apiConsorcio(cid);

  const [usuarios,   setUsuarios]   = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [error,      setError]      = useState('');
  const [toast,      setToast]      = useState('');

  const [modal,      setModal]      = useState(null);
  const [usuarioSel, setUsuarioSel] = useState(null);
  const [form,       setForm]       = useState(FORM_VACIO);
  const [verPass,    setVerPass]    = useState(false);
  const [guardando,  setGuardando]  = useState(false);
  const [errorForm,  setErrorForm]  = useState('');

  const mostrarToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const cargar = async () => {
    try { setCargando(true); const r = await api.get('/usuarios'); setUsuarios(r.data.datos ?? r.data); }
    catch { setError('No se pudieron cargar los usuarios'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => { setForm(FORM_VACIO); setErrorForm(''); setVerPass(false); setModal('crear'); };
  const abrirEditar = (u) => {
    setUsuarioSel(u);
    // Solo el rol dentro del consorcio es editable; nombre/email son de plataforma
    setForm({ nombre: u.nombre, email: u.email, contrasena: '', rol: u.rol_consorcio });
    setErrorForm(''); setVerPass(false); setModal('editar');
  };

  const handleGuardar = async () => {
    if (modal === 'crear' && (!form.nombre || !form.email || !form.rol)) {
      setErrorForm('Completá todos los campos requeridos'); return;
    }
    if (modal === 'crear' && !form.contrasena) { setErrorForm('La contraseña es requerida'); return; }
    setGuardando(true); setErrorForm('');
    try {
      if (modal === 'crear') {
        await api.post('/usuarios', form);
        mostrarToast('Usuario agregado al consorcio correctamente');
      } else {
        // Edición = solo cambio de rol dentro del consorcio
        await api.patch(`/usuarios/${usuarioSel.id}/rol`, { rol: form.rol });
        mostrarToast('Rol actualizado correctamente');
      }
      setModal(null); cargar();
    } catch (e) {
      setErrorForm(e.response?.data?.mensaje || 'Error al guardar');
    } finally { setGuardando(false); }
  };

  const handleQuitar = async () => {
    if (!usuarioSel) return;
    setGuardando(true);
    try {
      await api.delete(`/usuarios/${usuarioSel.id}`);
      mostrarToast('Usuario removido del consorcio');
      setModal(null); cargar();
    } catch (e) {
      mostrarToast(e.response?.data?.mensaje || 'Error al quitar usuario');
      setModal(null);
    } finally { setGuardando(false); }
  };

  return (
    <Layout>
      <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[hsl(222,47%,7%)]/80
                         backdrop-blur-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/consorcios/${cid}/dashboard`)} className="text-slate-500 hover:text-white transition-colors">
            <Icon path={ICONS.atras} size={18} />
          </button>
          <div>
            <h1 className="text-white text-lg font-semibold leading-none">Usuarios</h1>
            <p className="text-slate-500 text-xs mt-1">{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} en este consorcio</p>
          </div>
        </div>
        <button onClick={abrirCrear}
          className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300
                     text-slate-900 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-150">
          <Icon path={ICONS.mas} size={16} />
          Nuevo usuario
        </button>
      </header>

      <div className="p-6 space-y-3">
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <Icon path={ICONS.alerta} size={18} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
          </div>
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Icon path={ICONS.edificio} size={32} className="text-slate-600" />
            <p className="text-slate-400 text-sm">No hay usuarios en este consorcio todavía</p>
            <button onClick={abrirCrear} className="text-emerald-400 text-sm hover:underline">
              Agregar el primer usuario →
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-white/[0.06] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.06]">
                <tr>
                  <th className="text-left text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Nombre</th>
                  <th className="text-left text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Email</th>
                  <th className="text-left text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Rol</th>
                  <th className="text-left text-slate-500 text-xs uppercase tracking-wider px-5 py-3 font-medium">Alta</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {usuarios.map(u => (
                  <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                          <span className="text-slate-300 text-xs font-semibold">
                            {u.nombre?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-slate-300">
                          {u.nombre}
                          {u.id === usuarioActual?.id && (
                            <span className="text-slate-600 text-xs ml-1.5">(vos)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${BADGE_ROL[u.rol_consorcio] ?? 'bg-slate-700/50 text-slate-300'}`}>
                        {u.rol_consorcio}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {u.creado_en ? new Date(u.creado_en).toLocaleDateString('es-AR') : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => abrirEditar(u)}
                          className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors">
                          <Icon path={ICONS.editar} size={15} />
                        </button>
                        {u.id !== usuarioActual?.id && (
                          <button onClick={() => { setUsuarioSel(u); setModal('eliminar'); }}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                            <Icon path={ICONS.basura} size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal crear/editar */}
      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nuevo usuario' : 'Editar rol'}>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs uppercase tracking-wider">Nombre</label>
              <input value={form.nombre} disabled={modal === 'editar'}
                onChange={e => setForm({...form, nombre: e.target.value})}
                placeholder="Nombre completo"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                           text-white text-sm placeholder:text-slate-600 disabled:opacity-50
                           focus:outline-none focus:border-emerald-400/50 transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs uppercase tracking-wider">Email</label>
              <input type="email" value={form.email} disabled={modal === 'editar'}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="email@ejemplo.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                           text-white text-sm placeholder:text-slate-600 disabled:opacity-50
                           focus:outline-none focus:border-emerald-400/50 transition-all" />
              {modal === 'crear' && (
                <p className="text-slate-600 text-xs">Si ya existe en la plataforma, solo se agrega a este consorcio.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs uppercase tracking-wider">Rol en este consorcio</label>
              <select value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5
                           text-white text-sm focus:outline-none focus:border-emerald-400/50
                           transition-all [color-scheme:dark]">
                {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
              </select>
            </div>
            {modal === 'crear' && (
              <div className="space-y-1.5">
                <label className="text-slate-400 text-xs uppercase tracking-wider">Contraseña</label>
                <div className="relative flex items-center">
                  <input type={verPass ? 'text' : 'password'} value={form.contrasena}
                    onChange={e => setForm({...form, contrasena: e.target.value})}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-4 pr-10 py-2.5
                               text-white text-sm placeholder:text-slate-600
                               focus:outline-none focus:border-emerald-400/50 transition-all" />
                  <button type="button" onClick={() => setVerPass(!verPass)}
                    className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors">
                    <Icon path={verPass ? ICONS.ojo : ICONS.ojoCerrado} size={16} />
                  </button>
                </div>
                <p className="text-slate-600 text-xs">Se ignora si el usuario ya existe en la plataforma.</p>
              </div>
            )}
            {errorForm && <p className="text-red-400 text-xs">{errorForm}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)}
                className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white
                           rounded-lg py-2.5 text-sm transition-all">Cancelar</button>
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

      {/* Modal quitar del consorcio */}
      {modal === 'eliminar' && (
        <Modal titulo="Quitar usuario del consorcio">
          <p className="text-slate-400 text-sm">
            ¿Quitar a <span className="text-white font-medium">{usuarioSel?.nombre}</span> de este consorcio?
            Esto no elimina su cuenta de la plataforma, solo su acceso a este consorcio.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} disabled={guardando}
              className="flex-1 border border-white/[0.08] text-slate-400 hover:text-white
                         rounded-lg py-2.5 text-sm transition-all disabled:opacity-50">Cancelar</button>
            <button onClick={handleQuitar} disabled={guardando}
              className="flex-1 bg-red-500 hover:bg-red-400 text-white font-semibold
                         rounded-lg py-2.5 text-sm transition-all disabled:opacity-50
                         flex items-center justify-center gap-2">
              {guardando ? <Spinner /> : null}
              {guardando ? 'Quitando…' : 'Quitar'}
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
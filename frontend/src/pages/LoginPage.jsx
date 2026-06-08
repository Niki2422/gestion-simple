// ============================================================
// LoginPage.jsx
// Diseño split: panel izquierdo con identidad, derecho con form.
// ============================================================

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Íconos SVG inline (sin dependencia extra) ──────────────
const IconMail = () => (
  <svg width="16" height="16" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 7.5-9.75-7.5" />
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

const IconEye = ({ open }) => open ? (
  <svg width="16" height="16" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
) : (
  <svg width="16" height="16" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

// ── Ícono edificio reutilizable ─────────────────────────────
const IconEdificio = ({ size = 20, className = '' }) => (
  <svg
    width={size} height={size}
    className={className}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
    style={{ minWidth: size, minHeight: size }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const destino   = location.state?.from?.pathname || '/dashboard';

  const [form, setForm]         = useState({ email: '', contrasena: '' });
  const [verPass, setVerPass]   = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.contrasena) {
      setError('Completá todos los campos');
      return;
    }
    setCargando(true);
    try {
      await login(form.email, form.contrasena);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[hsl(222,47%,7%)]">

      {/* ── Panel izquierdo — identidad ───────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">

        {/* Textura geométrica de fondo */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradiente lateral derecho */}
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-[hsl(222,47%,7%)] z-10" />

        {/* Línea superior */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400/0 via-emerald-400 to-emerald-400/0" />

        {/* Logo / marca */}
        <div className="relative z-10 animate-fade-up" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <IconEdificio size={20} className="text-emerald-400" />
            </div>
            <span className="text-slate-400 text-sm font-medium tracking-widest uppercase">Consorcio</span>
          </div>
        </div>

        {/* Texto central */}
        <div className="relative z-10 space-y-6">
          <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h1 className="font-display italic text-6xl text-white leading-none tracking-tight">
              Gestión<br />
              <span className="text-emerald-400">simple.</span>
            </h1>
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <p className="text-slate-400 text-base font-light leading-relaxed max-w-xs">
              Administrá expensas, unidades y períodos desde un solo lugar.
            </p>
          </div>

          {/* Separador */}
          <div className="animate-fade-up w-12 h-[1px] bg-emerald-400/40" style={{ animationDelay: '300ms' }} />

          {/* Features */}
          <div className="animate-fade-up space-y-3" style={{ animationDelay: '350ms' }}>
            {[
              'Cálculo automático por coeficiente',
              'Historial de períodos y gastos',
              'Acceso diferenciado por rol',
            ].map((texto) => (
              <div key={texto} className="flex items-center gap-2.5">
                <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-slate-500 text-sm">{texto}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie */}
        <div className="relative z-10 animate-fade-up" style={{ animationDelay: '400ms' }}>
          <p className="text-slate-600 text-xs">Sistema de gestión de consorcio</p>
        </div>
      </div>

      {/* ── Panel derecho — formulario ────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 animate-fade-up" style={{ animationDelay: '150ms' }}>

          {/* Header mobile */}
          <div className="lg:hidden text-center space-y-1">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 mb-3 shrink-0">
              <IconEdificio size={20} className="text-emerald-400" />
            </div>
            <h2 className="font-display italic text-2xl text-white">Consorcio</h2>
          </div>

          {/* Título del form */}
          <div className="space-y-1">
            <h2 className="text-white text-2xl font-medium tracking-tight">Bienvenido</h2>
            <p className="text-slate-500 text-sm">Ingresá con tu cuenta para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-500 pointer-events-none">
                  <IconMail />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5
                             text-white placeholder:text-slate-600 text-sm
                             focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.06]
                             transition-all duration-200"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 text-slate-500 pointer-events-none">
                  <IconLock />
                </div>
                <input
                  type={verPass ? 'text' : 'password'}
                  name="contrasena"
                  value={form.contrasena}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-10 py-2.5
                             text-white placeholder:text-slate-600 text-sm
                             focus:outline-none focus:border-emerald-400/50 focus:bg-white/[0.06]
                             transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setVerPass(!verPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <IconEye open={verPass} />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <div className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-emerald-400 hover:bg-emerald-300 active:bg-emerald-500
                         text-slate-900 font-semibold text-sm rounded-lg py-2.5
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 mt-2"
            >
              {cargando ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
                  Ingresando…
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* Pie del form */}
          <p className="text-center text-slate-600 text-xs">
            Acceso restringido al personal autorizado
          </p>
        </div>
      </div>
    </div>
  );
}

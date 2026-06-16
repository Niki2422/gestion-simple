// ============================================================
// EmptyState.jsx
// Componente reutilizable para estados vacíos con acción directa
// ============================================================

const Icon = ({ path, size = 18, className = '' }) => (
  <svg width={size} height={size} className={className} fill="none"
    stroke="currentColor" viewBox="0 0 24 24" style={{ minWidth: size, minHeight: size }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
  </svg>
);

/**
 * EmptyState — estado vacío enriquecido con acción principal y opcional secundaria.
 *
 * Props:
 *  - icon         string   SVG path del ícono (de tu objeto ICONS)
 *  - titulo       string   Título principal, ej: "Sin unidades todavía"
 *  - descripcion  string   Subtexto explicativo opcional
 *  - accion       string   Label del botón/CTA principal
 *  - onAccion     fn       Handler del CTA principal
 *  - accionSec    string   Label de acción secundaria (link underline) — opcional
 *  - onAccionSec  fn       Handler de acción secundaria — opcional
 *  - compact      bool     Versión compacta (menos padding, para paneles pequeños)
 */
export default function EmptyState({
  icon,
  titulo,
  descripcion,
  accion,
  onAccion,
  accionSec,
  onAccionSec,
  compact = false,
}) {
  const py      = compact ? 'py-10' : 'py-20';
  const iconSz  = compact ? 24 : 32;
  const circSz  = compact ? 'w-12 h-12' : 'w-16 h-16';

  return (
    <div className={`flex flex-col items-center justify-center ${py} gap-4 animate-fade-in`}>

      {/* Ícono con halo */}
      <div className={`${circSz} rounded-full bg-slate-800/80 border border-white/[0.06] flex items-center justify-center shrink-0`}>
        <Icon path={icon} size={iconSz} className="text-slate-500" />
      </div>

      {/* Texto */}
      <div className="text-center space-y-1 max-w-xs">
        <p className="text-slate-300 text-sm font-medium">{titulo}</p>
        {descripcion && (
          <p className="text-slate-500 text-xs leading-relaxed">{descripcion}</p>
        )}
      </div>

      {/* CTAs */}
      {(accion || accionSec) && (
        <div className="flex flex-col items-center gap-2">
          {accion && (
            <button
              onClick={onAccion}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg
                         bg-emerald-500/10 hover:bg-emerald-500/20
                         border border-emerald-500/20 hover:border-emerald-500/40
                         text-emerald-400 text-sm font-medium
                         transition-all duration-150"
            >
              <Icon path="M12 4.5v15m7.5-7.5h-15" size={14} />
              {accion}
            </button>
          )}
          {accionSec && (
            <button
              onClick={onAccionSec}
              className="text-slate-500 hover:text-emerald-400 text-xs transition-colors underline-offset-2 hover:underline"
            >
              {accionSec}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
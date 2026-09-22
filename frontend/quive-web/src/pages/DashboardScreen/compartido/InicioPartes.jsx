import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import { textoEstado, pillEstado, direccionLegible, formatoSoles } from '../../../utils/estadoServicio';

// Piezas de presentación del panel de inicio. No conocen roles ni hacen peticiones:
// InicioCliente e InicioTransportista les pasan sus propios datos y textos.

export const HeroInicio = ({ etiqueta, nombre, texto, acciones }) => (
  <div
    style={{ background: 'linear-gradient(135deg, #183e6d 0%, #255d9c 50%, #4d93f5 100%)' }}
    className="p-6 sm:p-8 text-white rounded-2xl relative overflow-hidden shadow-xl border border-blue-400/30"
  >
    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 blur-3xl pointer-events-none" />
    <div className="relative z-10 max-w-2xl">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold uppercase tracking-wider mb-3 backdrop-blur-sm">
        {etiqueta}
      </div>
      <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">¡Hola, {nombre}!</h2>
      <p className="text-blue-100 text-sm leading-relaxed mb-6 max-w-xl">{texto}</p>
      <div className="flex flex-wrap gap-3">{acciones}</div>
    </div>
  </div>
);

export const BotonHero = ({ principal = false, icon: Icon, children, onClick }) => (
  <button
    onClick={onClick}
    className={principal
      ? 'px-5 py-2.5 bg-white text-[#19457a] rounded-xl font-bold text-xs hover:bg-blue-50 transition-all shadow-md flex items-center gap-2'
      : 'px-4 py-2.5 bg-white/15 border border-white/30 text-white rounded-xl font-bold text-xs hover:bg-white/25 transition-all flex items-center gap-1.5 backdrop-blur-sm'}
  >
    {Icon && <Icon size={15} strokeWidth={principal ? 2.5 : 2} />}
    <span>{children}</span>
  </button>
);

export const StatCard = ({ icon: Icon, tone, titulo, valor, unidad }) => (
  <div className="stat-card">
    <div className={`stat-icon ${tone}`}><Icon size={18} /></div>
    <div className="mt-4 text-[11px] font-bold text-[#8da2bb] uppercase tracking-wider">{titulo}</div>
    <div className="mt-1 flex items-baseline gap-2">
      <span className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white">{valor}</span>
      {unidad && <span className="text-[11px] text-[#8ea6c2]">{unidad}</span>}
    </div>
  </div>
);

export const PanelInicio = ({ kicker, titulo, accion = null, children, className = '' }) => (
  <div className={`surface-card p-6 ${className}`}>
    <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] mb-5">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-1">{titulo}</h3>
      </div>
      {accion}
    </div>
    {children}
  </div>
);

export const EnlacePanel = ({ children, onClick }) => (
  <button onClick={onClick} className="text-xs font-bold text-[#4d93f5] hover:underline flex items-center gap-1">
    <span>{children}</span>
    <ArrowRight size={12} />
  </button>
);

export const ResumenServicio = ({ servicio, etiquetaContraparte, children = null }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <span className={pillEstado(servicio.estado_servicio)}>{textoEstado(servicio.estado_servicio)}</span>
      <p className="text-xl font-bold font-display text-[#16365f] dark:text-white">{formatoSoles(servicio.precio)}</p>
    </div>

    <div className="space-y-2.5 p-3.5 rounded-xl bg-[var(--color-app-bg)] border border-[var(--color-border)]">
      <div className="flex items-start gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#4d93f5] mt-1.5 shrink-0" />
        <div>
          <p className="text-[10px] uppercase font-bold text-[#4d93f5]">Origen</p>
          <p className="text-xs font-medium theme-text-primary">{direccionLegible(servicio.origen)}</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
        <div>
          <p className="text-[10px] uppercase font-bold text-emerald-500">Destino</p>
          <p className="text-xs font-medium theme-text-primary">{direccionLegible(servicio.destino)}</p>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-border)]">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar foto={servicio.usuario_foto} nombre={servicio.usuario_nombre} className="w-9 h-9 rounded-full text-[11px]" />
        <div className="min-w-0">
          <p className="text-xs font-bold theme-text-primary truncate">{servicio.usuario_nombre}</p>
          <p className="text-[10px] theme-text-secondary">{etiquetaContraparte}</p>
        </div>
      </div>
      {servicio.usuario_telefono && (
        <a href={`tel:${servicio.usuario_telefono}`} className="flex items-center gap-1 text-xs font-semibold text-[#4d93f5] hover:underline">
          <Phone size={12} />
          <span>{servicio.usuario_telefono}</span>
        </a>
      )}
    </div>

    {children}
  </div>
);

export const FilaDato = ({ icon: Icon, tone, titulo, children, accion = null }) => (
  <div className="p-3.5 rounded-xl border border-[#edf3f8] dark:border-[#1d324e] bg-[#fbfdff] dark:bg-[#112136]">
    <div className="flex items-center justify-between mb-1.5">
      <div className="flex items-center gap-2">
        <div className={`stat-icon ${tone} !h-6 !w-6`}><Icon size={14} /></div>
        <h4 className="text-xs font-bold text-[#16365f] dark:text-white">{titulo}</h4>
      </div>
      {accion}
    </div>
    <div className="pl-8 text-[11px] theme-text-secondary">{children}</div>
  </div>
);

export const SinServicios = ({ titulo, texto }) => (
  <div className="p-4 rounded-2xl bg-[#f7faff] dark:bg-[#132439] border border-[#e2ebf5] dark:border-[#1e3454]">
    <p className="text-sm font-semibold text-[#16365f] dark:text-white">{titulo}</p>
    <p className="text-xs theme-text-secondary mt-1">{texto}</p>
  </div>
);

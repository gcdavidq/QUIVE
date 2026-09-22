import React from 'react';
import { Phone } from 'lucide-react';
import Avatar from '../../../components/Avatar';
import { textoEstado, pillEstado, direccionLegible, formatoSoles, formatoFecha } from '../../../utils/estadoServicio';

// Presentación de un servicio. No conoce roles: quien la usa le dice cómo rotular
// a la contraparte y qué acciones mostrar.
const ServicioCard = ({ servicio, etiquetaContraparte, acciones = null, aviso = null }) => (
  <div className="surface-card rounded-2xl p-5 sm:p-6 hover:border-[#4d93f5]/50 transition-all duration-200">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
      <div className="flex-1 space-y-2 min-w-0">
        <div className="flex items-start gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#4d93f5] mt-1.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#4d93f5]">Origen</span>
            <p className="text-sm font-medium theme-text-primary">{direccionLegible(servicio.origen)}</p>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">Destino</span>
            <p className="text-sm font-medium theme-text-primary">{direccionLegible(servicio.destino)}</p>
          </div>
        </div>
      </div>

      <div className="flex md:flex-col items-end justify-between md:justify-center gap-1">
        <span className={pillEstado(servicio.estado_servicio)}>{textoEstado(servicio.estado_servicio)}</span>
        <p className="text-2xl font-bold font-display text-[#16365f] dark:text-white">{formatoSoles(servicio.precio)}</p>
        <span className="text-xs theme-text-secondary">{formatoFecha(servicio.fecha_hora, true)}</span>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar foto={servicio.usuario_foto} nombre={servicio.usuario_nombre} />
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#4d93f5]">{etiquetaContraparte}</span>
          <p className="text-sm font-semibold theme-text-primary truncate">{servicio.usuario_nombre}</p>
          {servicio.usuario_telefono && (
            <a href={`tel:${servicio.usuario_telefono}`} className="flex items-center text-xs theme-text-secondary gap-1 hover:text-[#4d93f5]">
              <Phone size={12} className="text-[#4d93f5]" />
              <span>{servicio.usuario_telefono}</span>
            </a>
          )}
        </div>
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">{acciones}</div>}
    </div>

    {aviso}
  </div>
);

export default ServicioCard;

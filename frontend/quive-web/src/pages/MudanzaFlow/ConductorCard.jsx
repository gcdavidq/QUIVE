import React from 'react';
import { Star, Truck, ShieldCheck, MapPin } from 'lucide-react';
import Avatar from '../../components/Avatar';
import { formatoSoles } from '../../utils/estadoServicio';

// Ficha de un transportista candidato. Solo muestra datos que existen: si nadie lo ha
// calificado dice "Sin calificaciones", y el distintivo de verificación sale únicamente
// cuando sus documentos están verificados en la base de datos.
const ConductorCard = ({ conductor, accion = null, destacado = false }) => (
  <div className={`p-5 rounded-2xl border bg-[#fbfdff] dark:bg-[#112136] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
    destacado ? 'border-[#4d93f5]/50 shadow-md' : 'border-[var(--color-border)] hover:border-[#4d93f5]/50 hover:shadow-md'
  }`}>
    <div className="flex items-center gap-4 min-w-0">
      <Avatar foto={conductor.foto} nombre={conductor.nombre} className="w-14 h-14 rounded-2xl text-sm" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-display text-sm font-bold text-[#16365f] dark:text-white">{conductor.nombre}</h4>
          {conductor.documentosVerificados && (
            <span className="status-pill status-green !text-[9px] !py-0.5 inline-flex items-center gap-1">
              <ShieldCheck size={10} /> Documentos verificados
            </span>
          )}
        </div>

        <p className="text-xs text-[#8da3bd] mt-0.5 flex items-center gap-1.5">
          <Truck size={12} />
          {conductor.vehiculo ? `${conductor.vehiculo} · ${conductor.capacidad}` : 'Sin vehículo activo registrado'}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs">
          <span className="flex items-center gap-1 font-bold text-[#16365f] dark:text-white">
            <Star size={13} className={conductor.rating !== null ? 'fill-amber-400 text-amber-400' : 'text-[#c7d5e4]'} />
            {conductor.rating !== null
              ? <>{conductor.rating.toFixed(1)} <span className="text-[#8da3bd] font-normal">({conductor.reviews})</span></>
              : <span className="text-[#8da3bd] font-normal">Sin calificaciones</span>}
          </span>
          <span className="text-[#8da3bd]">{conductor.viajes} {conductor.viajes === 1 ? 'viaje' : 'viajes'}</span>
          {conductor.distanciaAlOrigenKm !== null && (
            <span className="text-[#4d93f5] font-medium flex items-center gap-1">
              <MapPin size={12} /> a {conductor.distanciaAlOrigenKm.toFixed(1)} km del origen
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]">
      <div className="sm:text-right">
        <span className="section-kicker block">Tarifa</span>
        <span className="font-display text-xl font-extrabold text-[#16365f] dark:text-white">{formatoSoles(conductor.precio)}</span>
      </div>
      {accion}
    </div>
  </div>
);

export default ConductorCard;

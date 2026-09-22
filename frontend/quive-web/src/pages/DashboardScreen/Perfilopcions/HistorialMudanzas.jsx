import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../../api';
import { direccionLegible } from '../../../utils/estadoServicio';

const HistorialMudanzas = ({ userData }) => {
  const navigate = useNavigate();
  const isDriver = userData?.tipo_usuario === 'transportista';
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarHistorial = async () => {
      if (!userData?.id_usuario || !userData?.tipo_usuario) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/asignaciones/${userData.id_usuario}/${userData.tipo_usuario}`);
        const data = Array.isArray(res.data) ? res.data : [];
        // Filtrar solo mudanzas finalizadas / completadas
        const finalizadas = data.filter(a => a.estado_servicio === 'finalizada');
        setHistorial(finalizadas);
      } catch (err) {
        console.error('Error al cargar historial de mudanzas:', err);
        setHistorial([]);
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, [userData]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="surface-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('..')}
            className="p-2.5 rounded-xl border border-[var(--color-border)] hover:border-[#4d93f5] text-[#345273] dark:text-white transition-all"
            aria-label="Regresar a perfil"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="section-kicker">REGISTRO HISTÓRICO</span>
            <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white mt-0.5">
              {isDriver ? 'Historial de Traslados Completados' : 'Historial de Mudanzas Realizadas'}
            </h1>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <RefreshCw className="animate-spin text-[#4d93f5] mx-auto mb-3" size={28} />
          <p className="text-sm font-semibold theme-text-primary">Consultando registros históricos...</p>
        </div>
      ) : historial.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#4d93f5] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} />
          </div>
          <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white">
            Sin servicios finalizados aún
          </h3>
          <p className="text-xs text-[#8da3be] max-w-md mx-auto mt-1 mb-6">
            {isDriver 
              ? 'Cuando concluyas traslados de mudanza satisfactoriamente, se archivarán en este historial.' 
              : 'Aún no has completado traslados en la plataforma. Una vez entregada tu primera mudanza, el registro detallado aparecerá aquí.'}
          </p>
          <button
            onClick={() => navigate('/dashboard/pedidos')}
            className="secondary-button text-xs !py-2.5 !px-5 inline-flex items-center gap-2"
          >
            <span>Ver mis solicitudes activas</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {historial.map((item) => (
            <div 
              key={item.id_asignacion}
              className="surface-card p-6 rounded-2xl hover:border-[#4d93f5]/40 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="status-pill status-green text-[10px] font-bold">Completada con éxito</span>
                    <span className="text-xs text-[#8ea4be]">
                      {new Date(item.fecha_hora).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-display text-base font-bold text-[#16365f] dark:text-white mt-1">
                    Servicio #{item.id_asignacion}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8ea4be] font-bold uppercase tracking-wider block">Tarifa final</span>
                  <span className="font-display text-xl font-extrabold text-[#16365f] dark:text-white">
                    S/ {parseFloat(item.precio).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#345273] dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#4d93f5]" />
                  <span className="font-semibold">Origen:</span>
                  <span className="truncate">{direccionLegible(item.origen)}</span>
                </div>
                <div className="flex items-center gap-2 text-[#345273] dark:text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-semibold">Destino:</span>
                  <span className="truncate">{direccionLegible(item.destino)}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[#8da3bd]">
                <span>{isDriver ? `Cliente: ${item.usuario_nombre}` : `Transportista: ${item.usuario_nombre}`}</span>
                <span>Tel: {item.usuario_telefono}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialMudanzas;

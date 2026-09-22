import React from 'react';
import { ArrowLeft, MapPin, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MisDirecciones = ({ userData }) => {
  const navigate = useNavigate();
  const direccionPrincipal = (userData?.ubicacion || '').split(';')[0].trim();

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
            <span className="section-kicker">UBICACIONES FRECUENTES</span>
            <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white mt-0.5">
              Mis Direcciones Guardadas
            </h1>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {direccionPrincipal ? (
          <div className="surface-card p-6 rounded-2xl border-l-4 border-l-[#4d93f5]">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="stat-icon stat-blue !h-10 !w-10 flex-shrink-0">
                  <Home size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-bold text-[#16365f] dark:text-white">
                      Dirección de Registro Principal
                    </h3>
                    <span className="status-pill status-green text-[10px] font-bold">Principal</span>
                  </div>
                  <p className="text-sm text-[#345273] dark:text-slate-200 mt-1">
                    {direccionPrincipal}
                  </p>
                  <p className="text-[11px] text-[#8da3bd] mt-1">
                    Utilizada por defecto como punto de partida en tus cálculos de mudanza.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="surface-card p-10 text-center rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#4d93f5] flex items-center justify-center mx-auto mb-4">
              <MapPin size={28} />
            </div>
            <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white">
              Sin dirección registrada
            </h3>
            <p className="text-xs text-[#8da3bd] max-w-md mx-auto mt-1 mb-5">
              Puedes actualizar tu dirección de residencia principal editando tu perfil.
            </p>
            <button
              onClick={() => navigate('../editar')}
              className="primary-button text-xs !py-2.5 !px-5 inline-flex items-center gap-2"
            >
              <span>Actualizar datos de perfil</span>
            </button>
          </div>
        )}

        <div className="surface-card p-6 rounded-2xl">
          <span className="section-kicker">INFORMACIÓN DEL SERVICIO</span>
          <h4 className="font-display text-sm font-bold text-[#16365f] dark:text-white mt-1 mb-2">
            Puntos de carga y entrega dinámicos
          </h4>
          <p className="text-xs text-[#8da3bd] leading-relaxed">
            Al solicitar cada mudanza puedes seleccionar direcciones personalizadas de origen y destino con el selector de direcciones en mapa. Cada solicitud guarda sus propias direcciones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MisDirecciones;

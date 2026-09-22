import React from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AyudaSoporte = () => {
  const navigate = useNavigate();

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
            <span className="section-kicker">ATENCIÓN AL CLIENTE</span>
            <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white mt-0.5">
              Centro de Ayuda y Soporte
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="surface-card p-6 rounded-2xl">
          <div className="stat-icon stat-blue !h-12 !w-12 mb-4">
            <Mail size={22} />
          </div>
          <h3 className="font-display text-base font-bold text-[#16365f] dark:text-white">
            Soporte por Correo
          </h3>
          <p className="text-xs text-[#8da3bd] mt-1 mb-4">
            Escríbenos para consultas sobre facturación, cotizaciones especiales o reclamos.
          </p>
          <a
            href="mailto:soporte@quive.com"
            className="text-xs font-bold text-[#4d93f5] hover:underline"
          >
            soporte@quive.com →
          </a>
        </div>

      </div>

      {/* Preguntas frecuentes */}
      <div className="surface-card p-6 sm:p-8 rounded-2xl">
        <span className="section-kicker">PREGUNTAS FRECUENTES</span>
        <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-1 mb-4">
          Resolución Rápida de Dudas
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
            <h4 className="text-xs font-bold text-[#16365f] dark:text-white">
              ¿Cómo se calcula el precio de una mudanza?
            </h4>
            <p className="text-[11px] text-[#8da3bd] mt-1">
              Cada transportista registra su tarifa por kilómetro. El precio que ves es esa tarifa multiplicada por la distancia por carretera entre el origen y el destino de tu mudanza.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
            <h4 className="text-xs font-bold text-[#16365f] dark:text-white">
              ¿Qué medios de pago están disponibles?
            </h4>
            <p className="text-[11px] text-[#8da3bd] mt-1">
              Puedes registrar tarjeta de crédito o débito, Yape o PayPal desde tu perfil, en Métodos de pago.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
            <h4 className="text-xs font-bold text-[#16365f] dark:text-white">
              ¿Qué pasa si mis muebles son frágiles?
            </h4>
            <p className="text-[11px] text-[#8da3bd] mt-1">
              Cada tipo de objeto del catálogo ya indica si es frágil o si requiere embalaje; al agregarlo a tu solicitud lo verás señalado y el transportista también.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AyudaSoporte;

import React from 'react';
import { CreditCard, Smartphone, Settings, Wallet, Check } from 'lucide-react';
import { nombreMetodo } from '../../hooks/useMetodosPago';

const ICONOS = {
  Tarjeta: { Icon: CreditCard, tone: 'stat-blue' },
  Yape: { Icon: Smartphone, tone: 'stat-lilac' },
  PayPal: { Icon: Wallet, tone: 'stat-mint' },
};

// Lista los métodos REALES del usuario (GET /metodos_pago) y deja elegir uno.
const PaymentMethodSelector = ({
  metodos = [],
  cargando = false,
  metodoSeleccionadoId = null,
  onSeleccionar,
  onGestionarMetodos,
  showGestionarButton = true,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {cargando ? (
        <p className="text-xs theme-text-secondary text-center py-4">Cargando tus métodos de pago...</p>
      ) : metodos.length === 0 ? (
        <div className="p-4 rounded-xl border border-dashed border-[var(--color-border)] text-center">
          <p className="text-xs font-bold theme-text-primary">No tienes métodos de pago registrados</p>
          <p className="text-[11px] theme-text-secondary mt-0.5">
            Regístralo desde tu perfil para poder continuar.
          </p>
        </div>
      ) : (
        metodos.map((metodo) => {
          const { Icon, tone } = ICONOS[metodo.tipo] || ICONOS.Tarjeta;
          const activo = metodo.id === metodoSeleccionadoId;
          return (
            <button
              type="button"
              key={metodo.id}
              onClick={() => onSeleccionar && onSeleccionar(metodo)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                activo
                  ? 'border-[#4d93f5] bg-blue-50/60 dark:bg-blue-950/30 shadow-sm'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[#4d93f5]/50'
              }`}
            >
              <div className={`stat-icon ${tone} !h-9 !w-9 flex-shrink-0`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold theme-text-primary truncate">{nombreMetodo(metodo)}</p>
                {metodo.detalle?.titular && (
                  <p className="text-[11px] theme-text-secondary truncate">Titular: {metodo.detalle.titular}</p>
                )}
              </div>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                activo ? 'border-[#4d93f5] bg-[#4d93f5] text-white' : 'border-[var(--color-border)]'
              }`}>
                {activo && <Check size={12} strokeWidth={3} />}
              </span>
            </button>
          );
        })
      )}

      {showGestionarButton && (
        <button type="button" onClick={onGestionarMetodos} className="secondary-button w-full justify-center !py-2.5">
          <Settings size={14} />
          <span>Gestionar métodos de pago</span>
        </button>
      )}
    </div>
  );
};

export default PaymentMethodSelector;

import React from 'react';
import { CreditCard, Smartphone, Settings } from 'lucide-react';
import clsx from 'clsx';

const PaymentMethodSelector = ({
  metodosSeleccionados = {},
  metodoActivo = '',
  onSeleccionarMetodo,
  onGestionarMetodos,
  showGestionarButton = true,
  showSelectedMethod = true,
  className = ''
}) => {
  const getMethodIcon = (tipo) => {
    switch (tipo) {
      case 'Tarjeta':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'Yape':
        return <Smartphone className="w-5 h-5 text-purple-600" />;
      case 'PayPal':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCardNumber = (numero) => {
    if (!numero) return '';
    const lastFour = numero.slice(-4);
    return `•••• ${lastFour}`;
  };

  const getMethodDisplayName = (metodo) => {
    switch (metodo.tipo) {
      case 'Tarjeta':
        return `Tarjeta ${formatCardNumber(metodo.detalle.numero)}`;
      case 'Yape':
        return `Yape - ${metodo.detalle.codigo}`;
      case 'PayPal':
        return `PayPal - ${metodo.detalle.correo}`;
      default:
        return metodo.tipo;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: '2-digit', year: '2-digit' });
  };

  const metodosDisponibles = ['Tarjeta', 'Yape', 'PayPal'];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Lista de métodos de pago */}
      <div className="space-y-4">
        {metodosDisponibles.map(tipo => {
          const metodoSeleccionado = metodosSeleccionados[tipo];
          const estaActivo = metodoActivo === tipo;
          const estaDisponible = !!metodoSeleccionado;

          return (
            <div
              key={tipo}
              className={clsx(
                "border rounded-lg p-4 transition-all duration-200 cursor-pointer theme-border theme-card",
                estaActivo && estaDisponible ? 'shadow-md' : '',
                estaDisponible ? 'hover:opacity-95' : 'opacity-60 cursor-not-allowed'
              )}
              onClick={() => estaDisponible && onSeleccionarMetodo(tipo)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {/* Botón circular de selección */}
                  <div className={clsx(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                    estaActivo && estaDisponible ? 'border-blue-500 bg-blue-500' :
                    estaDisponible ? 'theme-border hover:border-blue-400' : 'border-gray-300'
                  )}>
                    {estaActivo && estaDisponible && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>

                  <div className="p-2 rounded-lg shadow-sm theme-bg-primary">
                    {getMethodIcon(tipo)}
                  </div>
                  <span className="font-medium theme-text-primary">
                    {tipo === 'Tarjeta' ? 'Tarjeta de Crédito/Débito' :
                    tipo === 'Yape' ? 'Yape/Plin' : 'PayPal'}
                  </span>
                </div>

                {estaActivo && estaDisponible && (
                  <span className="text-blue-600 text-sm font-medium bg-info-soft px-2 py-1 rounded-full">
                    Seleccionado
                  </span>
                )}
              </div>

              {estaActivo && metodoSeleccionado && (
                <div className="rounded-lg p-4 border-l-4 border-blue-500 transition-all duration-200 mt-3 theme-bg-primary">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium theme-text-primary">
                      {getMethodDisplayName(metodoSeleccionado)}
                    </span>
                    <span className="text-green-600 text-sm font-medium">✓ Disponible</span>
                  </div>

                  {/* Detalles específicos por tipo */}
                  {tipo === 'Tarjeta' && metodoSeleccionado.detalle && (
                    <div className="text-sm theme-text-secondary space-y-1">
                      <div>Titular: {metodoSeleccionado.detalle.nombre || 'No especificado'}</div>
                      {metodoSeleccionado.detalle.vencimiento && (
                        <div>Vence: {formatDate(metodoSeleccionado.detalle.vencimiento)}</div>
                      )}
                    </div>
                  )}

                  {tipo === 'Yape' && metodoSeleccionado.detalle && (
                    <div className="text-sm theme-text-secondary">
                      Código: {metodoSeleccionado.detalle.codigo}
                    </div>
                  )}

                  {tipo === 'PayPal' && metodoSeleccionado.detalle && (
                    <div className="text-sm theme-text-secondary">
                      Email: {metodoSeleccionado.detalle.correo}
                    </div>
                  )}
                </div>
              )}

              {!metodoSeleccionado && (
                <div className="theme-warning-card mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="theme-warning-card-title">
                      No tienes ningún método de {tipo} configurado
                    </span>
                  </div>
                  <p className="theme-warning-card-text">
                    Configura este método desde el botón de gestionar métodos de pago
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón para gestionar métodos de pago */}
      {showGestionarButton && (
        <button
          onClick={onGestionarMetodos}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 btn-secondary"
        >
          <Settings className="w-5 h-5" />
          <span>Gestionar Métodos de Pago</span>
        </button>
      )}
    </div>

  );
};

export default PaymentMethodSelector;
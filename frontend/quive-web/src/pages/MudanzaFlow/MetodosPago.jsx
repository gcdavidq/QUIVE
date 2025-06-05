import React from 'react';
import { Star } from 'lucide-react';

const MetodosPago = () => {
  return (
    <div className="p-6">

      {/* StepIndicator debe ir arriba si se importa desde el componente principal */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RESUMEN */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-blue-600 mb-4 text-center">RESUMEN</h3>

            <div className="bg-blue-100 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-blue-900">Juan Luis</span>
                <span className="font-bold text-xl">S/ 500</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-600">Vehículo: </span>Camión Mediano</div>
                <div><span className="text-gray-600">Capacidad: </span>15 m³</div>
                <div className="flex items-center">
                  <span className="text-gray-600">Calificación: </span>
                  <span className="flex items-center ml-1">
                    4.9 <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-1" />
                  </span>
                </div>
                <div><span className="text-gray-600">Tiempo estimado: </span>12 min</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-blue-900 mb-2">Notas adicionales</h4>
              <textarea
                placeholder="Especificar algunas instrucciones para el conductor"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows="4"
              ></textarea>
            </div>

            <div className="flex space-x-4 mt-6">
              <button className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Confirmar Servicio
              </button>
            </div>
          </div>
        </div>

        {/* MÉTODOS DE PAGO */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-blue-600 mb-6 text-center">MÉTODOS DE PAGO</h3>

          {/* Tarjeta */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input type="radio" name="payment" id="card" className="mr-3" defaultChecked />
                <label htmlFor="card" className="font-medium">Tarjeta de Crédito</label>
              </div>
              <div className="flex space-x-2">
                <span className="text-blue-600 font-bold">VISA</span>
                <span className="text-red-500 font-bold">●●</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tarjeta</label>
                <input
                  type="text"
                  placeholder="Número tarjeta"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración</label>
                <input
                  type="text"
                  placeholder="DD/MM/YY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titular</label>
                <input
                  type="text"
                  placeholder="Titular"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                <input
                  type="text"
                  placeholder="CVC"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Transferencia */}
          <div className="mb-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <input type="radio" name="payment" id="transfer" className="mr-3" />
                <label htmlFor="transfer" className="font-medium">Transferencia bancaria</label>
              </div>
              <div className="text-blue-600 font-bold">PayPal</div>
            </div>
          </div>

          {/* Yape/Plin */}
          <div className="mb-6">
            <div className="flex items-center p-4 border border-gray-200 rounded-lg">
              <input type="radio" name="payment" id="yape" className="mr-3" />
              <label htmlFor="yape" className="font-medium">Yape/Plin</label>
            </div>
          </div>

          {/* Términos */}
          <div className="space-y-3">
            <h4 className="font-bold text-blue-900">Términos y Condiciones</h4>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <input type="checkbox" id="marketing" className="mt-1" />
              <label htmlFor="marketing" className="text-sm text-gray-700">
                Acepto recibir correos electrónicos de marketing y publicidad de QUIVE
              </label>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <input type="checkbox" id="terms" className="mt-1" />
              <label htmlFor="terms" className="text-sm text-gray-700">
                Estoy de acuerdo con los términos de política y privacidad.
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetodosPago;

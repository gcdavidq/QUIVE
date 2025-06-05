import React, { useState } from 'react';
import {User, Navigation} from 'lucide-react';

const SeguimientoTab = () => {
    const [pedidoActivo] = useState({
    id: 2,
    transportista: 'Carlos Rodriguez',
    vehiculo: 'Toyota Hiace - ABC-123',
    telefono: '+51 987 654 321',
    origen: 'Surco, Lima',
    destino: 'La Molina, Lima',
    progreso: 60,
    ubicacionActual: 'Av. Javier Prado Este',
    tiempoEstimado: '25 min'
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Seguimiento en Tiempo Real</h2>
      
      {pedidoActivo ? (
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Mudanza en Progreso</h3>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                En Camino
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progreso</span>
                  <span>{pedidoActivo.progreso}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${pedidoActivo.progreso}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Tiempo estimado</p>
                  <p className="font-semibold text-blue-600">{pedidoActivo.tiempoEstimado}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ubicación actual</p>
                  <p className="font-semibold">{pedidoActivo.ubicacionActual}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Driver Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Transportista</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{pedidoActivo.transportista}</p>
                <p className="text-sm text-gray-600">{pedidoActivo.vehiculo}</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Llamar
              </button>
            </div>
          </div>

          {/* Route Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ruta</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                <span className="text-gray-700">{pedidoActivo.origen}</span>
              </div>
              <div className="ml-6 border-l-2 border-dashed border-gray-300 h-6"></div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                <span className="text-gray-700">{pedidoActivo.destino}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Navigation className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay pedidos activos</h3>
          <p className="text-gray-500">Cuando tengas una mudanza en proceso, podrás seguirla aquí</p>
        </div>
      )}
    </div>
  );

};
export default SeguimientoTab;
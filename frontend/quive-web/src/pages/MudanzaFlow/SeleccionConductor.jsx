import React from 'react';
import { Star } from 'lucide-react';

const SeleccionConductor = ({ nextStep, seleccionarConductor, setCurrentStep }) => {
  const conductorRecomendado = {
    id: 1,
    nombre: "Juan Perez",
    rating: 4.8,
    reviews: 48,
    distancia: "15 km",
    tiempoLlegada: "15 minutos",
    vehiculo: "Camión Mediano",
    capacidad: "12 m³",
    viajes: 234,
    precio: 500
  };

  return (
    <div className="p-6">

      {/* StepIndicator debe importarse y colocarse donde uses este componente */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold text-blue-900 mb-4">¿No te convence el conductor que te asignamos?</h3>
          <p className="text-gray-600 mb-6">Puedes seleccionar un conductor tú mismo.</p>

          <button
            onClick={nextStep}
            className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            BUSCAR MANUALMENTE
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600 mb-4 text-center">CONDUCTOR RECOMENDADO</h3>

          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-blue-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl text-blue-300">👤</span>
            </div>

            <h4 className="text-xl font-bold text-blue-900 mb-2">{conductorRecomendado.nombre}</h4>
            <div className="flex items-center justify-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-4 h-4 ${
                    star <= Math.floor(conductorRecomendado.rating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">({conductorRecomendado.reviews})</span>
            </div>

            <div className="flex space-x-4 text-sm text-gray-600 mb-4">
              <span className="bg-blue-100 px-2 py-1 rounded">{conductorRecomendado.distancia} de distancia</span>
              <span className="bg-green-100 px-2 py-1 rounded">Llega en {conductorRecomendado.tiempoLlegada}</span>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Modelo Camión:</span>
              <span className="font-medium">{conductorRecomendado.vehiculo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Capacidad:</span>
              <span className="font-medium">{conductorRecomendado.capacidad}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Viajes realizados:</span>
              <span className="font-medium">{conductorRecomendado.viajes}</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <span className="text-3xl font-bold text-green-600">S/ {conductorRecomendado.precio}</span>
          </div>

          <button
            onClick={() => {
              seleccionarConductor(conductorRecomendado);
              setCurrentStep(5); // Saltar directamente a pago
            }}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Confirmar Conductor
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeleccionConductor;

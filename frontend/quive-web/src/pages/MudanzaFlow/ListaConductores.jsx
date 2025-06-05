import React from 'react';
import { Star } from 'lucide-react';

const ListaConductores = ({ nextStep, seleccionarConductor }) => {
  const conductores = [
    { id: 1, nombre: "Carlos Mendoza", status: "DISPONIBLE", color: "green", precio: 480, rating: 4.8, reviews: 124, distancia: "2.5 km", tiempo: "15 min", vehiculo: "Camión grande - 15 m²" },
    { id: 2, nombre: "María González", status: "OCUPADO", color: "red", precio: 520, rating: 4.9, reviews: 89, distancia: "3.2 km", tiempo: "20 min", vehiculo: "Camión mediano - 12 m²" },
    { id: 3, nombre: "Luis Rodríguez", status: "DISPONIBLE", color: "green", precio: 450, rating: 4.7, reviews: 156, distancia: "1.8 km", tiempo: "12 min", vehiculo: "Camión grande - 18 m²" }
  ];

  return (
    <div className="p-6">

      {/* StepIndicator debe importarse y colocarse fuera si es parte común */}

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 mb-6 text-center">LISTA DE CONDUCTORES</h3>

        <div className="space-y-4">
          {conductores.map((conductor) => (
            <div
              key={conductor.id}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-300 text-xl">🚛</span>
                </div>

                <div>
                  <h4 className="font-bold text-blue-900">{conductor.nombre}</h4>
                  <p className="text-sm text-gray-600">{conductor.vehiculo}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.floor(conductor.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm">{conductor.rating} ({conductor.reviews} reseñas)</span>
                  </div>
                  <p className="text-xs text-gray-500">"Buen conductor, amable y atento."</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold mb-2">S/ {conductor.precio}</div>
                <div className="text-sm text-gray-600 mb-2">{conductor.distancia} - {conductor.tiempo}</div>
                <div
                  className={`px-2 py-1 rounded text-xs text-white mb-3 ${
                    conductor.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {conductor.status}
                </div>
                <button
                  onClick={() => {
                    if (conductor.status === 'DISPONIBLE') {
                      seleccionarConductor(conductor);
                      nextStep();
                    } else {
                      alert('Este conductor no está disponible en este momento');
                    }
                  }}
                  disabled={conductor.status !== 'DISPONIBLE'}
                  className={`px-6 py-2 rounded font-medium transition-colors ${
                    conductor.status === 'DISPONIBLE'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {conductor.status === 'DISPONIBLE' ? 'SELECCIONAR' : 'NO DISPONIBLE'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListaConductores;

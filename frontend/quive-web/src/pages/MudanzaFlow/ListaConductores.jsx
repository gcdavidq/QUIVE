import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import WaitingScreen from './WaitingScreen';

const ListaConductores = ({ nextStep, seleccionarConductor, formData }) => {
  const [conductores, setConductores] = useState([]);

  useEffect(() => {
    const fetchConductores = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:5000/transportistas/${formData.id_solicitud}/all`
        );
        const data = await response.json();

        const nuevos = data.map((c) => ({
          id_transportista: c.id_transportista,
          nombre: c.nombre_completo,
          foto: c.foto_perfil_url,
          status: 'DISPONIBLE',
          color: 'green',
          precio: parseFloat(c.precio_estimado_total).toFixed(2),
          rating: parseFloat(c.promedio_calificaciones).toFixed(1),
          reviews: c.viajes_realizados,
          distancia: `${(formData.distancia / 1000).toFixed(1)} km`,
          tiempo:
            c.tiempo_estimado_horas * 60 > 60
              ? `${Math.floor(c.tiempo_estimado_horas)} h ${(
                  c.tiempo_estimado_horas * 60 % 60
                ).toFixed(0)} min`
              : `${(c.tiempo_estimado_horas * 60).toFixed(0)} min`,
          vehiculo: `${c.nombre_vehiculo} - ${c.capacidad_volumen} m³`,
        }));

        setConductores(nuevos);
      } catch (e) {
        console.error('Error al obtener conductores:', e);
      }
    };
    fetchConductores();
  }, [formData]);

  // Si ya seleccionó un conductor, mostrar pantalla de espera
  if (formData.conductor) {
    return <WaitingScreen />;
  }

  if (conductores.length === 0) return <p className="p-6">Cargando conductores...</p>;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 mb-6 text-center">
          LISTA DE CONDUCTORES
        </h3>
        <div className="space-y-4">
          {conductores.map((c) => (
            <div
              key={c.id_transportista}
              className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <img
                    src={c.foto}
                    alt="Avatar"
                    className="w-16 h-16 object-cover rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">{c.nombre}</h4>
                  <p className="text-sm text-gray-600">{c.vehiculo}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const fillPercentage = Math.min(Math.max(c.rating - star + 1, 0), 1) * 100;

                        return (
                          <div key={star} className="relative w-4 h-4">
                            {/* Estrella vacía de fondo */}
                            <Star className="w-4 h-4 text-gray-300" />

                            {/* Estrella amarilla parcial encima */}
                            <div
                              className="absolute top-0 left-0 h-full overflow-hidden"
                              style={{ width: `${fillPercentage}%` }}
                            >
                              <Star className="w-4 h-4 text-yellow-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-sm">
                      {c.rating} ({c.reviews} reseñas)
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold mb-2">S/ {c.precio}</div>
                <div className="text-sm text-gray-600 mb-2">
                  {c.distancia} - {c.tiempo}
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs text-white mb-3 ${
                    c.color === 'green' ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {c.status}
                </div>
                <button
                  onClick={() => {
                    if (c.status === 'DISPONIBLE') {
                      console.log('Seleccionando conductor:', c);
                      seleccionarConductor(c);
                      nextStep(4);
                    } else {
                      alert('Este conductor no está disponible en este momento');
                    }
                  }}
                  disabled={c.status !== 'DISPONIBLE'}
                  className={`px-6 py-2 rounded font-medium transition-colors ${
                    c.status === 'DISPONIBLE'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {c.status === 'DISPONIBLE' ? 'SELECCIONAR' : 'NO DISPONIBLE'}
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
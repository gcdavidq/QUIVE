import React, { useEffect, useState } from "react";
import { Star } from 'lucide-react';

const SeleccionConductor = ({ nextStep, seleccionarConductor, formData }) => {
  const [conductorRecomendado, setConductorRecomendado] = useState(null);
  useEffect(() => {
    const fetchConductor = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/transportistas/${formData.id_solicitud}/unico`);
        const data = await response.json();
        setConductorRecomendado({
          id_transportista: data.id_transportista,
          nombre: data.nombre_completo,
          foto: data.foto_perfil_url,
          puntaje: data.promedio_calificaciones,
          rating: parseFloat(data.promedio_calificaciones).toFixed(1),
          reviews: data.viajes_realizados,
          distancia: `${(formData.distancia / 1000).toFixed(1)} km`, // metros a km
          tiempo: data.tiempo_estimado_horas * 60 > 60
          ? `${Math.floor(data.tiempo_estimado_horas)} h ${(data.tiempo_estimado_horas * 60 % 60).toFixed(0)} min`
          : `${(data.tiempo_estimado_horas * 60).toFixed(0)} min`,
          vehiculo: data.nombre_vehiculo, // Requiere más datos si quieres el nombre real
          capacidad: `${data.capacidad_volumen} m³`, // Si quieres volumen, necesitas consultar
          viajes: data.viajes_realizados, // Este valor deberías obtenerlo aparte
          precio: parseFloat(data.precio_estimado_total).toFixed(2)
        });
      } catch (error) {
        console.error("Error al obtener el conductor:", error);
      }
    };

    fetchConductor();
  }, [formData]);
  // Renderiza algo mientras se carga
  if (!conductorRecomendado) return <p>Cargando conductor recomendado...</p>;


  return (
    <div className="p-6">

      {/* StepIndicator debe importarse y colocarse donde uses este componente */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold text-blue-900 mb-4">¿No te convence el conductor que te asignamos?</h3>
          <p className="text-gray-600 mb-6">Puedes seleccionar un conductor tú mismo.</p>

          <button
            onClick={() => {nextStep(4);}}
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
              {[1, 2, 3, 4, 5].map((star) => {
                const fillPercentage = Math.min(Math.max(conductorRecomendado.rating - star + 1, 0), 1) * 100;

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
              <span className="ml-2 text-sm text-gray-600">({conductorRecomendado.reviews})</span>
            </div>

            <div className="flex space-x-4 text-sm text-gray-600 mb-4">
              <span className="bg-blue-100 px-2 py-1 rounded">{conductorRecomendado.distancia} de distancia</span>
              <span className="bg-green-100 px-2 py-1 rounded">Llega en {conductorRecomendado.tiempo}</span>
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
              nextStep();
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

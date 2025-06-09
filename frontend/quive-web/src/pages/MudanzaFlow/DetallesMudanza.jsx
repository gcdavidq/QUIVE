import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import UbicacionPeru from '../Registerutils/address';
import RutaMap from '../../components/RutaMap';
import { parseUbicacion } from '../../components/ubicacion';

const DetallesMudanza = ({ userData, formData, setFormData, nextStep }) => {
  const [origenDireccion, setOrigenDireccion] = useState(() => {
    if (userData.Ubicacion) {
      return parseUbicacion(userData.Ubicacion);
    }
    return {};
  });

  const [destinoDireccion, setDestinoDireccion] = useState({});
  const [distanciaKm, setDistanciaKm] = useState(null);
  const [duracionMin, setDuracionMin] = useState(null);
  const [rutaGeo, setRutaGeo] = useState(null);
  

  const validarPaso1 = () => {
    if (!formData.fecha.trim() || !formData.hora.trim()) {
      alert('Por favor, complete todos los campos requeridos');
      return false;
    }
    return true;
  };

  const formatearDireccion = (direccionObj) => {
    const { departamento, provincia, distrito, tipoVia, nombreVia, numero, lat, lng } = direccionObj;
    return `${tipoVia} ${nombreVia} ${numero}, ${distrito}, ${provincia}, ${departamento}, Peru; ${lat}, ${lng}`;
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 mb-6 text-center">DETALLES DE LA MUDANZA</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de Origen <span className="text-red-500">*</span>
            </label>
            <UbicacionPeru direccion={origenDireccion} setUbicacion={setOrigenDireccion} titulo="Dirección de Origen" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de Destino <span className="text-red-500">*</span>
            </label>
            <UbicacionPeru direccion={destinoDireccion} setUbicacion={setDestinoDireccion} titulo="Dirección de Destino" />
          </div>

          {origenDireccion.lat && destinoDireccion.lat && (
            <RutaMap
              origen={origenDireccion}
              destino={destinoDireccion}
              setRutaGeo={setRutaGeo}
              setDistanciaKm={setDistanciaKm}
              setDuracionMin={setDuracionMin}
            />
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="time"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            if (!validarPaso1()) return;

            if (!origenDireccion.lat || !destinoDireccion.lat || !rutaGeo) {
              alert("Por favor, asegúrate de haber seleccionado ambas direcciones y que se haya cargado la ruta.");
              return;
            }

            const origenFinal = formatearDireccion(origenDireccion);
            const destinoFinal = formatearDireccion(destinoDireccion);
            const fechaHora = new Date(`${formData.fecha}T${formData.hora}`).toISOString().slice(0, 19);

            try {
              // API: Crear solicitud
              const res = await fetch('http://127.0.0.1:5000/solicitudes', {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  id_usuario: userData.id_usuario,
                  origen: origenFinal,
                  destino: destinoFinal,
                  fecha_hora: fechaHora
                })
              });

              const data = await res.json();
              if (!res.ok) {
                alert(data.msg || 'Error al registrar mudanza');
                return;
              }

              const idSolicitud = data.id_solicitud;
              
              const rutas = {
                  id_solicitud: idSolicitud,
                  distancia_km: distanciaKm,
                  duracion_min: duracionMin,
                  ruta: rutaGeo
                }
              console.log(rutas);
              nextStep();
            } catch (err) {
              console.error("Error al conectar con API:", err);
              alert("Error de red.");
            }
          }}
          className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium mt-6 hover:bg-blue-600 transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default DetallesMudanza;

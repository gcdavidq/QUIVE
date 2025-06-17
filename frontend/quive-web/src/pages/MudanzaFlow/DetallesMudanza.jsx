import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import UbicacionPeru from '../Registerutils/address';
import RutaMap from '../utils/RutaMap';
import { parseUbicacion } from '../utils/ubicacion';

const DetallesMudanza = ({ userData, formData, actualizarFormData, setFormData, nextStep }) => {
  // ───────── Límites dinámicos para fecha ─────────
  const hoy = new Date();
  const minDateString = hoy.toISOString().split('T')[0];
  const maxDateObj = new Date(hoy);
  maxDateObj.setFullYear(maxDateObj.getFullYear() + 1);
  const maxDateString = maxDateObj.toISOString().split('T')[0];

  // ───────── Hooks inside component ─────────
  const [errors, setErrors] = useState({});
  const [origenDireccion, setOrigenDireccion] = useState(() => {
    if (formData.origen) return parseUbicacion(formData.origen);
    if (userData.Ubicacion) return parseUbicacion(userData.Ubicacion);
    return {};
  });
  const [destinoDireccion, setDestinoDireccion] = useState(() => {
    if (formData.destino) return parseUbicacion(formData.destino);
    return {};
  });
  const [distanciaKm, setDistanciaKm] = useState(formData.distancia || null);
  const [duracionMin, setDuracionMin] = useState(formData.tiempos_estimado || null);
  const [rutaGeo, setRutaGeo] = useState(formData.ruta || null);

  // ──────────────── Validation helpers ────────────────
  const cleanError = (fieldname) => {
    if (errors[fieldname]) {
      setErrors(prev => ({ ...prev, [fieldname]: '' }));
    }
  };

  const validateDetalles = () => {
    const newErrors = {};
    // Direcciones
    if (!origenDireccion.lat || !origenDireccion.lng) {
      newErrors.origen = 'Debe seleccionar una dirección de origen válida';
    }
    if (!destinoDireccion.lat || !destinoDireccion.lng) {
      newErrors.destino = 'Debe seleccionar una dirección de destino válida';
    }

    // Fecha y hora obligatorios
    if (!formData.fecha.trim()) {
      newErrors.fecha = 'La fecha es requerida';
    }
    if (!formData.hora.trim()) {
      newErrors.hora = 'La hora es requerida';
    }

    // Validar rango y validez de fecha-hora
    if (formData.fecha && formData.hora) {
      const seleccion = new Date(`${formData.fecha}T${formData.hora}`);
      if (isNaN(seleccion.getTime())) {
        newErrors.fecha = 'Formato de fecha inválido';
      } else {
        const ahora = new Date();
        const minimo = new Date(ahora.getTime() + 60 * 60 * 1000); // +1 hora
        const maximo = new Date(ahora);
        maximo.setFullYear(maximo.getFullYear() + 1); // +1 año

        if (seleccion < minimo) {
          newErrors.fechaHora = 'La fecha y hora deben ser al menos una hora después de ahora';
        } else if (seleccion > maximo) {
          newErrors.fechaHora = 'La fecha y hora no puede ser más de un año en el futuro';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatearDireccion = (d) => {
    const { departamento, provincia, distrito, tipoVia, nombreVia, numero, lat, lng } = d;
    return `${tipoVia} ${nombreVia} ${numero}, ${distrito}, ${provincia}, ${departamento}, Peru; ${lat}, ${lng}`;
  };

  const huboCambios = () => {
    const o = formatearDireccion(origenDireccion);
    const dest = formatearDireccion(destinoDireccion);
    return (
      o !== formData.origen ||
      dest !== formData.destino ||
      distanciaKm !== formData.distancia ||
      duracionMin !== formData.tiempos_estimado ||
      formData.fecha !== userData.formularioMudanza.fecha ||
      formData.hora !== userData.formularioMudanza.hora ||
      JSON.stringify(rutaGeo) !== JSON.stringify(formData.ruta) ||
      !formData.id_solicitud
    );
  };

  // ──────────────── Render ────────────────
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-blue-600 mb-6 text-center">DETALLES DE LA MUDANZA</h3>

        <div className="space-y-4">
          {/* Origen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de Origen <span className="text-red-500">*</span>
            </label>
            <UbicacionPeru
              direccion={origenDireccion}
              setUbicacion={(dir) => { cleanError('origen'); setOrigenDireccion(dir); }}
              titulo="Dirección de Origen"
            />
            {errors.origen && <p className="text-red-500 text-sm">{errors.origen}</p>}
          </div>

          {/* Destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dirección de Destino <span className="text-red-500">*</span>
            </label>
            <UbicacionPeru
              direccion={destinoDireccion}
              setUbicacion={(dir) => { cleanError('destino'); setDestinoDireccion(dir); }}
              titulo="Dirección de Destino"
            />
            {errors.destino && <p className="text-red-500 text-sm">{errors.destino}</p>}
          </div>

          {/* Mapa y ruta */}
          {origenDireccion.lat && destinoDireccion.lat && (
            <RutaMap
              origen={origenDireccion}
              destino={destinoDireccion}
              setRutaGeo={setRutaGeo}
              setDistanciaKm={setDistanciaKm}
              setDuracionMin={setDuracionMin}
            />
          )}

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={formData.fecha}
                  onChange={(e) => { cleanError('fecha'); setFormData({ ...formData, fecha: e.target.value }); }}
                  min={minDateString}
                  max={maxDateString}
                />
              </div>
              {errors.fecha && <p className="text-red-500 text-sm">{errors.fecha}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="time"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={formData.hora}
                  onChange={(e) => { cleanError('hora'); setFormData({ ...formData, hora: e.target.value }); }}
                />
              </div>
              {errors.hora && <p className="text-red-500 text-sm">{errors.hora}</p>}
            </div>
          </div>
          {/* Error rango fecha-hora */}
          {errors.fechaHora && <p className="text-red-500 text-sm mt-2">{errors.fechaHora}</p>}
        </div>

        <button
          onClick={async () => {
            if (!validateDetalles()) return;
            if (!origenDireccion.lat || !destinoDireccion.lat || !rutaGeo) {
              alert('Por favor, asegúrate de haber seleccionado ambas direcciones y que se haya cargado la ruta.');
              return;
            }
            const origenFinal = formatearDireccion(origenDireccion);
            const destinoFinal = formatearDireccion(destinoDireccion);
            const fechaHora = new Date(`${formData.fecha}T${formData.hora}`)
              .toISOString()
              .slice(0, 19);
            if (!huboCambios()) { nextStep(); return; }
            try {
              const payload = { id_usuario: userData.id_usuario, origen: origenFinal, destino: destinoFinal, distancia: distanciaKm, tiempo_estimado: duracionMin, ruta: rutaGeo, fecha_hora: fechaHora };
              const res = await fetch(formData.id_solicitud ? `http://127.0.0.1:5000/solicitudes/${formData.id_solicitud}` : 'http://127.0.0.1:5000/solicitudes', { method: formData.id_solicitud ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              const data = await res.json();
              if (!res.ok) { alert(data.msg || 'Error al procesar mudanza'); return; }
              actualizarFormData({ id_solicitud: data.id_solicitud || formData.id_solicitud, origen: origenFinal, destino: destinoFinal, distancia: distanciaKm, tiempos_estimado: duracionMin, ruta: rutaGeo, hora: formData.hora, fecha: formData.fecha });
              nextStep();
            } catch (err) { console.error('Error al conectar con API:', err); alert('Error de red.'); }
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

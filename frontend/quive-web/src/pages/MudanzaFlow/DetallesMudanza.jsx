import React, { useState } from 'react';
import { Calendar, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import UbicacionPeru from '../Registerutils/address';
import RutaMap from '../utils/RutaMap';
import { parseUbicacion } from '../utils/ubicacion';
import API_URL, { apiFetch } from '../../api';

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
    if (userData.ubicacion && userData.ubicacion.includes(';')) return parseUbicacion(userData.ubicacion);
    return {};
  });
  const [destinoDireccion, setDestinoDireccion] = useState(() => {
    if (formData.destino) return parseUbicacion(formData.destino);
    return {};
  });
  const [distanciaKm, setDistanciaKm] = useState(formData.distancia || null);
  const [duracionMin, setDuracionMin] = useState(formData.tiempos_estimado || null);
  const [rutaGeo, setRutaGeo] = useState(formData.ruta || null);
  const [guardando, setGuardando] = useState(false);

  // ──────────────── Validation helpers ────────────────
  const cleanError = (fieldname) => {
    if (errors[fieldname]) {
      setErrors(prev => ({ ...prev, [fieldname]: '' }));
    }
  };

  const validateDetalles = () => {
    const newErrors = {};
    if (!origenDireccion.lat || !origenDireccion.lng) {
      newErrors.origen = 'Debe seleccionar una dirección de origen válida';
    }
    if (!destinoDireccion.lat || !destinoDireccion.lng) {
      newErrors.destino = 'Debe seleccionar una dirección de destino válida';
    }

    if (!formData.fecha?.trim()) {
      newErrors.fecha = 'La fecha es requerida';
    }
    if (!formData.hora?.trim()) {
      newErrors.hora = 'La hora es requerida';
    }

    if (formData.fecha && formData.hora) {
      const seleccion = new Date(`${formData.fecha}T${formData.hora}`);
      if (isNaN(seleccion.getTime())) {
        newErrors.fecha = 'Formato de fecha inválido';
      } else {
        const ahora = new Date();
        const minimo = new Date(ahora.getTime() + 60 * 60 * 1000);
        const maximo = new Date(ahora);
        maximo.setFullYear(maximo.getFullYear() + 1);

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
      formData.fecha !== userData?.formularioMudanza?.fecha ||
      formData.hora !== userData?.formularioMudanza?.hora ||
      JSON.stringify(rutaGeo) !== JSON.stringify(formData.ruta) ||
      !formData.id_solicitud
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="surface-card p-6 sm:p-8 rounded-2xl">
        <div className="border-b border-[var(--color-border)] pb-4 mb-6">
          <span className="section-kicker">PASO 1 DE 5 · PLANIFICACIÓN DE RUTA</span>
          <h2 className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white mt-1">
            Detalles de Origen, Destino y Horario
          </h2>
          <p className="text-xs text-[#8da3bd] mt-1">
            Indica los puntos de partida y llegada para calcular la distancia satelital y el tiempo de viaje
          </p>
        </div>

        <div className="space-y-6">
          {/* Origen */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4d93f5]" />
                <span>Punto de Partida (Origen)</span>
                <span className="text-rose-500">*</span>
              </label>
            </div>
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
              <UbicacionPeru
                direccion={origenDireccion}
                setUbicacion={(dir) => { cleanError('origen'); setOrigenDireccion(dir); }}
                titulo="Dirección de Origen"
              />
            </div>
            {errors.origen && (
              <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} /> {errors.origen}
              </p>
            )}
          </div>

          {/* Destino */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Punto de Entrega (Destino)</span>
                <span className="text-rose-500">*</span>
              </label>
            </div>
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
              <UbicacionPeru
                direccion={destinoDireccion}
                setUbicacion={(dir) => { cleanError('destino'); setDestinoDireccion(dir); }}
                titulo="Dirección de Destino"
              />
            </div>
            {errors.destino && (
              <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} /> {errors.destino}
              </p>
            )}
          </div>

          {/* Mapa y ruta */}
          {origenDireccion.lat && destinoDireccion.lat && (
            <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
              <RutaMap
                origen={origenDireccion}
                destino={destinoDireccion}
                setRutaGeo={setRutaGeo}
                setDistanciaKm={setDistanciaKm}
                setDuracionMin={setDuracionMin}
              />
            </div>
          )}

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5">
                Fecha del Traslado <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8da3bd]" />
                <input
                  type="date"
                  className="w-full text-xs font-medium py-3 pl-10 pr-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors"
                  value={formData.fecha}
                  onChange={(e) => { cleanError('fecha'); setFormData({ ...formData, fecha: e.target.value }); }}
                  min={minDateString}
                  max={maxDateString}
                />
              </div>
              {errors.fecha && (
                <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={13} /> {errors.fecha}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5">
                Hora de Inicio <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-[#8da3bd]" />
                <input
                  type="time"
                  className="w-full text-xs font-medium py-3 pl-10 pr-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors"
                  value={formData.hora}
                  onChange={(e) => { cleanError('hora'); setFormData({ ...formData, hora: e.target.value }); }}
                />
              </div>
              {errors.hora && (
                <p className="text-rose-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={13} /> {errors.hora}
                </p>
              )}
            </div>
          </div>

          {errors.fechaHora && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{errors.fechaHora}</span>
            </div>
          )}
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
              setGuardando(true);
              const payload = {
                id_usuario: userData.id_usuario,
                origen: origenFinal,
                destino: destinoFinal,
                distancia: distanciaKm,
                tiempo_estimado: duracionMin,
                ruta: rutaGeo,
                fecha_hora: fechaHora
              };
              const res = await apiFetch(
                formData.id_solicitud
                  ? `${API_URL}/solicitudes/${formData.id_solicitud}`
                  : `${API_URL}/solicitudes`,
                {
                  method: formData.id_solicitud ? 'PUT' : 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                }
              );
              const data = await res.json();
              if (!res.ok) {
                alert(data.msg || 'Error al procesar mudanza');
                setGuardando(false);
                return;
              }
              actualizarFormData({
                id_solicitud: data.id_solicitud || formData.id_solicitud,
                origen: origenFinal,
                destino: destinoFinal,
                distancia: distanciaKm,
                tiempos_estimado: duracionMin,
                ruta: rutaGeo,
                hora: formData.hora,
                fecha: formData.fecha
              });
              nextStep();
            } catch (err) {
              console.error('Error al conectar con API:', err);
              alert('Error de red.');
            } finally {
              setGuardando(false);
            }
          }}
          disabled={guardando}
          className="primary-button w-full !py-3.5 text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-8"
        >
          <span>{guardando ? 'Calculando ruta...' : 'Continuar al Cubicaje de Objetos'}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DetallesMudanza;

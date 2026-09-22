import React, { useEffect, useRef, useState } from 'react';
import { Play, Flag, Radio, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../../api';

const INTERVALO_REPORTE_MS = 20000;

// Responsabilidad exclusiva del TRANSPORTISTA: iniciar / finalizar el traslado y, mientras
// está en curso, reportar la posición GPS real del dispositivo (POST /tracking).
const ControlTraslado = ({ servicio, onCambio }) => {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [gps, setGps] = useState('inactivo'); // inactivo | transmitiendo | denegado | no-disponible
  const ultimoEnvio = useRef(0);

  const enCurso = servicio.estado === 'activa';

  useEffect(() => {
    if (!enCurso) { setGps('inactivo'); return undefined; }
    if (!navigator.geolocation) { setGps('no-disponible'); return undefined; }

    const watchId = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        setGps('transmitiendo');
        if (Date.now() - ultimoEnvio.current < INTERVALO_REPORTE_MS) return;
        ultimoEnvio.current = Date.now();
        try {
          await axios.post(`${API_URL}/tracking`, {
            id_asignacion: servicio.id_asignacion,
            latitud: coords.latitude,
            longitud: coords.longitude,
          });
        } catch (err) {
          console.error('Error al reportar posición:', err);
        }
      },
      (err) => setGps(err.code === err.PERMISSION_DENIED ? 'denegado' : 'no-disponible'),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [enCurso, servicio.id_asignacion]);

  const cambiarEstado = async (estado) => {
    try {
      setProcesando(true);
      setError('');
      await axios.put(`${API_URL}/solicitudes/actualizar_estado/${servicio.id_solicitud}`, { estado });
      onCambio();
    } catch (err) {
      setError(err.response?.data?.msg || 'No se pudo actualizar el traslado.');
    } finally {
      setProcesando(false);
    }
  };

  const textoGps = {
    inactivo: 'El reporte GPS se activa al iniciar el traslado.',
    transmitiendo: 'Transmitiendo tu posición al cliente.',
    denegado: 'Permiso de ubicación denegado: el cliente no verá tu posición. Actívalo en el navegador.',
    'no-disponible': 'Este dispositivo no pudo obtener la ubicación.',
  }[gps];

  return (
    <div className="surface-card p-6">
      <span className="section-kicker">CONTROL DEL TRASLADO</span>
      <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-0.5 mb-3">
        {enCurso ? 'Traslado en curso' : 'Servicio confirmado'}
      </h3>

      <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 mb-4 ${
        gps === 'denegado' || gps === 'no-disponible'
          ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200'
          : 'border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136] theme-text-secondary'
      }`}>
        <Radio size={14} className={gps === 'transmitiendo' ? 'text-emerald-500 animate-pulse mt-0.5' : 'mt-0.5'} />
        <span>{textoGps}</span>
      </div>

      {error && (
        <p className="text-rose-500 text-xs mb-3 flex items-center gap-1"><AlertCircle size={13} /> {error}</p>
      )}

      {enCurso ? (
        <button onClick={() => cambiarEstado('finalizada')} disabled={procesando} className="primary-button w-full justify-center !py-3 disabled:opacity-50">
          <Flag size={15} /> <span>{procesando ? 'Procesando...' : 'Marcar como entregado'}</span>
        </button>
      ) : (
        <button onClick={() => cambiarEstado('activa')} disabled={procesando} className="primary-button w-full justify-center !py-3 disabled:opacity-50">
          <Play size={15} /> <span>{procesando ? 'Procesando...' : 'Iniciar traslado'}</span>
        </button>
      )}
    </div>
  );
};

export default ControlTraslado;

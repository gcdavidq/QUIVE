import React, { useState, useEffect, useCallback } from 'react';
import { Phone, Package, Truck, Navigation, ArrowRight, RefreshCw, Star, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../api';
import Avatar from '../../components/Avatar';
import MapaSeguimiento from './compartido/MapaSeguimiento';
import ControlTraslado from './transportista/ControlTraslado';
import { direccionLegible, coordenadasDe, formatoSoles, formatoFecha } from '../../utils/estadoServicio';

const INTERVALO_MS = 15000;

const SeguimientoTab = ({ userData, setActiveTab }) => {
  const isDriver = userData?.tipo_usuario === 'transportista';
  const [loading, setLoading] = useState(true);
  const [servicio, setServicio] = useState(null);

  // Un único origen de datos: GET /tracking/ruta. Si no hay servicio, no se muestra nada
  // inventado (antes se armaba una ficha con teléfono, rating, viajes y capacidad de relleno).
  const cargar = useCallback(async () => {
    if (!userData?.id_usuario) return;
    try {
      const res = await axios.get(`${API_URL}/tracking/ruta/${userData.id_usuario}`);
      setServicio(res.data?.id_solicitud ? res.data : null);
    } catch (err) {
      if (err.response?.status !== 404) console.error('Error al consultar seguimiento:', err);
      setServicio(null);
    } finally {
      setLoading(false);
    }
  }, [userData?.id_usuario]);

  useEffect(() => {
    cargar();
    const id = setInterval(cargar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [cargar]);

  if (loading) {
    return (
      <div className="surface-card p-12 text-center rounded-2xl flex flex-col items-center justify-center min-h-[360px]">
        <RefreshCw className="animate-spin text-[#4d93f5] mb-3" size={32} />
        <p className="font-display text-base font-bold text-[#16365f] dark:text-white">Consultando tus traslados...</p>
      </div>
    );
  }

  if (!servicio) {
    return (
      <div className="surface-card p-10 sm:p-14 text-center rounded-2xl">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/50 text-[#4d93f5] flex items-center justify-center mx-auto mb-5">
          <Navigation size={32} />
        </div>
        <span className="section-kicker">SEGUIMIENTO</span>
        <h2 className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white mt-2 mb-3">
          {isDriver ? 'Sin traslados confirmados' : 'Sin mudanzas confirmadas'}
        </h2>
        <p className="text-sm theme-text-secondary max-w-lg mx-auto mb-8 leading-relaxed">
          {isDriver
            ? 'Aquí aparecerá tu próximo servicio cuando el cliente lo confirme y pague. Al iniciarlo, tu posición se transmitirá al cliente.'
            : 'Aquí aparecerá tu mudanza cuando la confirmes y pagues. Cuando el transportista inicie el traslado verás su posición en el mapa.'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!isDriver && (
            <button onClick={() => setActiveTab('mudanza')} className="primary-button !py-3 !px-6">
              <span>Solicitar mudanza</span> <ArrowRight size={14} />
            </button>
          )}
          <button onClick={() => setActiveTab('pedidos')} className={isDriver ? 'primary-button !py-3 !px-6' : 'secondary-button !py-3 !px-5'}>
            {isDriver ? 'Ir a mi bandeja' : 'Ver mis mudanzas'}
          </button>
        </div>
      </div>
    );
  }

  const enCurso = servicio.estado === 'activa';
  const posicion = servicio.ultima_posicion
    ? [parseFloat(servicio.ultima_posicion.latitud), parseFloat(servicio.ultima_posicion.longitud)]
    : null;
  const distanciaKm = parseFloat(servicio.distancia);
  const vehiculo = servicio.vehiculo;

  return (
    <div className="space-y-6">
      <div className="surface-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="section-kicker">SOLICITUD #{servicio.id_solicitud}</span>
          <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white mt-1">
            {enCurso ? 'Traslado en curso' : 'Próximo traslado confirmado'}
          </h1>
          <p className="text-[#8da3be] text-xs mt-0.5">Programado para {formatoFecha(servicio.fecha_hora, true)}</p>
        </div>
        {enCurso
          ? <span className="live-pill"><span className="live-dot" /> EN RUTA</span>
          : <span className="status-pill status-green">Confirmada y pagada</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="surface-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="section-kicker">RUTA</span>
                <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-0.5">Recorrido del traslado</h3>
              </div>
              {Number.isFinite(distanciaKm) && (
                <span className="font-display text-xl font-extrabold text-[#4d93f5]">{(distanciaKm / 1000).toFixed(1)} km</span>
              )}
            </div>

            <div className="w-full h-80 rounded-xl overflow-hidden border border-[var(--color-border)]">
              <MapaSeguimiento
                origen={coordenadasDe(servicio.origen)}
                destino={coordenadasDe(servicio.destino)}
                ruta={servicio.ruta}
                posicionVehiculo={posicion}
              />
            </div>

            <p className="text-[11px] theme-text-secondary mt-3">
              {posicion
                ? `Última posición del vehículo reportada el ${formatoFecha(servicio.ultima_posicion.hora_ultima_actualizacion, true)}.`
                : enCurso
                  ? 'El transportista aún no ha reportado su posición GPS.'
                  : 'La posición del vehículo se mostrará cuando el transportista inicie el traslado.'}
            </p>

            <div className="space-y-3 mt-5 pt-5 border-t border-[var(--color-border)]">
              <div className="flex items-start gap-3">
                <span className="w-3 h-3 bg-[#4d93f5] rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#4d93f5]">Origen</p>
                  <p className="text-sm font-semibold text-[#16365f] dark:text-white">{direccionLegible(servicio.origen)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-3 h-3 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">Destino</p>
                  <p className="text-sm font-semibold text-[#16365f] dark:text-white">{direccionLegible(servicio.destino)}</p>
                </div>
              </div>
            </div>
          </div>

          {servicio.objetos?.length > 0 && (
            <div className="surface-card p-6">
              <span className="section-kicker">INVENTARIO</span>
              <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-0.5 mb-4">
                Carga del traslado ({servicio.objetos.length} {servicio.objetos.length === 1 ? 'tipo de objeto' : 'tipos de objeto'})
              </h3>
              <div className="space-y-2.5">
                {servicio.objetos.map((objeto) => (
                  <div key={objeto.id_objeto} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
                    <div className="stat-icon stat-blue flex-shrink-0"><Package size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#16365f] dark:text-white truncate">{objeto.categoria}</p>
                      <p className="text-[11px] text-[#8da3bd] truncate">{objeto.variante}</p>
                    </div>
                    <span className="text-xs font-bold text-[#4d93f5] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg">x{objeto.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {isDriver && <ControlTraslado servicio={servicio} onCambio={cargar} />}

          <div className="surface-card p-6">
            <span className="section-kicker">{isDriver ? 'CLIENTE' : 'TRANSPORTISTA ASIGNADO'}</span>
            <div className="flex items-center gap-3 mt-3">
              <Avatar foto={servicio.contraparte_foto} nombre={servicio.contraparte_nombre} className="w-14 h-14 rounded-2xl text-sm" />
              <div className="min-w-0">
                <h4 className="font-display text-base font-bold text-[#16365f] dark:text-white truncate">{servicio.contraparte_nombre}</h4>
                {!isDriver && (
                  <p className="text-xs text-[#8da3be] flex items-center gap-1 mt-0.5">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    {servicio.transportista_calificacion !== null
                      ? `${servicio.transportista_calificacion.toFixed(1)} (${servicio.transportista_calificaciones})`
                      : 'Sin calificaciones'}
                    <span>· {servicio.transportista_viajes} {servicio.transportista_viajes === 1 ? 'viaje' : 'viajes'}</span>
                  </p>
                )}
              </div>
            </div>

            {!isDriver && (
              <div className="space-y-3 mt-4 pt-4 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <div className="stat-icon stat-blue !h-8 !w-8 flex-shrink-0"><Truck size={16} /></div>
                  {vehiculo ? (
                    <div>
                      <p className="text-xs font-bold text-[#16365f] dark:text-white">{vehiculo.tipo_vehiculo}</p>
                      <p className="text-[11px] text-[#8da3bd]">Placa {vehiculo.placa} · {parseFloat(vehiculo.capacidad_volumen)} m³</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#8da3bd]">El transportista no tiene un vehículo activo registrado.</p>
                  )}
                </div>
                {servicio.documentos_verificados && (
                  <div className="flex items-center gap-3">
                    <div className="stat-icon stat-mint !h-8 !w-8 flex-shrink-0"><ShieldCheck size={16} /></div>
                    <p className="text-xs font-bold text-[#16365f] dark:text-white">Documentos verificados por QUIVE</p>
                  </div>
                )}
              </div>
            )}

            {servicio.contraparte_telefono && (
              <a href={`tel:${servicio.contraparte_telefono}`} className="secondary-button w-full justify-center !py-3 mt-5">
                <Phone size={14} className="text-emerald-500" />
                <span>Llamar: {servicio.contraparte_telefono}</span>
              </a>
            )}
          </div>

          <div className="surface-card p-6">
            <span className="section-kicker">{isDriver ? 'TU COBRO' : 'TARIFA PAGADA'}</span>
            <p className="font-display text-3xl font-extrabold text-[#16365f] dark:text-white mt-1">{formatoSoles(servicio.precio)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoTab;

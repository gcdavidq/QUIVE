// Traducción única de las respuestas del backend al "conductor" que maneja el flujo.
// Antes cada pantalla hacía su propio mapeo leyendo campos que el backend no envía
// (nombre_completo, nombre_vehiculo, viajes_realizados...) y tapaba los huecos con valores
// de relleno: precio 60, rating 5, 10 viajes, 15 m³, 5 km.

const numeroONull = (valor) => {
  const n = parseFloat(valor);
  return Number.isFinite(n) ? n : null;
};

// Fila de GET /transportistas/<id_solicitud>/(unico|all)
export const conductorDesdeCandidato = (c) => ({
  id_transportista: c.id_transportista,
  nombre: c.nombre,
  foto: c.foto_perfil_url,
  vehiculo: c.vehiculo,                 // nombre del tipo de vehículo (null si no tiene unidad activa)
  capacidad: c.vehiculo ? c.capacidad : null, // "8.00 m³ / 1200.00 kg"
  viajes: Number(c.viajes) || 0,
  rating: numeroONull(c.promedio_calificaciones), // null = nadie lo ha calificado todavía
  reviews: Number(c.cantidad_calificaciones) || 0,
  distanciaAlOrigenKm: numeroONull(c.distancia_al_origen),
  documentosVerificados: Boolean(c.documentos_verificados),
  precio: numeroONull(c.precio_estimado_total),
});

// Respuesta de GET /solicitudes/mi_solicitud (solicitud en curso con transportista ya elegido)
export const conductorDesdeSolicitud = (s) => ({
  id_transportista: s.id_transportista,
  nombre: s.nombre,
  foto: s.foto,
  vehiculo: s.vehiculo?.tipo_vehiculo || null,
  capacidad: s.vehiculo ? `${parseFloat(s.vehiculo.capacidad_volumen)} m³ / ${parseFloat(s.vehiculo.capacidad_peso)} kg` : null,
  viajes: Number(s.transportista_viajes) || 0,
  rating: numeroONull(s.transportista_calificacion),
  reviews: Number(s.transportista_calificaciones) || 0,
  distanciaAlOrigenKm: null,
  documentosVerificados: Boolean(s.documentos_verificados),
  precio: numeroONull(s.precio),
});

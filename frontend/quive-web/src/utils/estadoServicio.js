// Única fuente de verdad para presentar el estado de un servicio (campo `estado_servicio`
// de GET /asignaciones). Antes cada pantalla tenía su propia copia de estas tablas y
// filtraba por estados que el backend nunca producía ('activa'/'finalizada' sobre la asignación).

export const ESTADOS_SERVICIO = {
  pendiente:  { texto: 'Pendiente de respuesta', pill: 'status-pill status-orange' },
  aceptada:   { texto: 'Aceptada · por pagar',   pill: 'status-pill status-blue' },
  confirmada: { texto: 'Confirmada y pagada',    pill: 'status-pill status-green' },
  activa:     { texto: 'En traslado',            pill: 'status-pill status-lilac' },
  finalizada: { texto: 'Finalizada',             pill: 'status-pill status-mint' },
  rechazada:  { texto: 'Rechazada',              pill: 'status-pill status-red' },
  cancelada:  { texto: 'Cancelada',              pill: 'status-pill status-red' },
};

export const ORDEN_ESTADOS = ['pendiente', 'aceptada', 'confirmada', 'activa', 'finalizada', 'rechazada', 'cancelada'];

export const textoEstado = (estado) => ESTADOS_SERVICIO[estado]?.texto || estado || '—';
export const pillEstado = (estado) => ESTADOS_SERVICIO[estado]?.pill || 'status-pill status-gray';

// Servicios que siguen vivos (ni cerrados ni descartados)
export const esServicioVigente = (estado) => ['pendiente', 'aceptada', 'confirmada', 'activa'].includes(estado);

// Las direcciones se guardan como "Av. X 123, Distrito, ...; lat, lng"
export const direccionLegible = (ubicacion) => (ubicacion || '').split(';')[0].trim();

export const coordenadasDe = (ubicacion) => {
  const partes = (ubicacion || '').split(';')[1]?.split(',').map((v) => parseFloat(v));
  return partes && partes.length === 2 && partes.every(Number.isFinite) ? partes : null;
};

export const formatoSoles = (monto) => {
  const n = parseFloat(monto);
  return Number.isFinite(n) ? `S/ ${n.toFixed(2)}` : '—';
};

export const formatoFecha = (fecha, conHora = false) => {
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-PE', conHora
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: '2-digit', month: 'short', year: 'numeric' });
};

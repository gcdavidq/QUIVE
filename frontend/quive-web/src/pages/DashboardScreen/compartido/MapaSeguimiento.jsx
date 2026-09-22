import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const punto = (color) => L.divIcon({
  html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const ICONO_ORIGEN = punto('#4d93f5');
const ICONO_DESTINO = punto('#10b981');
const ICONO_VEHICULO = L.divIcon({
  html: '<div style="background:#16365f;color:#fff;width:30px;height:30px;border-radius:10px;border:2px solid #fff;display:grid;place-items:center;font-size:15px;box-shadow:0 4px 10px rgba(0,0,0,.35)">🚚</div>',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const Encuadre = ({ puntos }) => {
  const map = useMap();
  useEffect(() => {
    if (puntos.length > 1) map.fitBounds(puntos, { padding: [30, 30] });
    else if (puntos.length === 1) map.setView(puntos[0], 14);
  }, [map, puntos]);
  return null;
};

// Solo dibuja lo que existe en la base de datos: la ruta planificada de la solicitud,
// sus extremos y, si el transportista ya reportó GPS, la última posición real del vehículo.
const MapaSeguimiento = ({ origen, destino, ruta = [], posicionVehiculo = null }) => {
  const extremos = [origen, destino].filter(Boolean);
  if (extremos.length === 0) return null;

  return (
    <MapContainer center={extremos[0]} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%', zIndex: 0 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <Encuadre puntos={ruta.length > 1 ? ruta : extremos} />
      {ruta.length > 1 && <Polyline positions={ruta} pathOptions={{ color: '#4d93f5', weight: 4, opacity: 0.85 }} />}
      {origen && <Marker position={origen} icon={ICONO_ORIGEN}><Popup>Origen</Popup></Marker>}
      {destino && <Marker position={destino} icon={ICONO_DESTINO}><Popup>Destino</Popup></Marker>}
      {posicionVehiculo && <Marker position={posicionVehiculo} icon={ICONO_VEHICULO}><Popup>Última posición reportada</Popup></Marker>}
    </MapContainer>
  );
};

export default MapaSeguimiento;

import React, { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";

const apiKey = "5b3ce3597851110001cf6248586c45473a8042fbbe48c152e2539778";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const RutaMap = ({ origen, destino, setRutaGeo, setDistanciaKm, setDuracionMin }) => {
  const [ruta, setRuta] = React.useState([]);
  const [errorRuta, setErrorRuta] = React.useState(false);
  const [mostrarDistancia, setMostrarDistancia] = useState(null);
  const [mostrarDuracion, setMostrarDuracion] = useState(null);


  const obtenerRuta = useCallback(async () => {
    if (!origen || !destino || !origen.lat || !destino.lat) return;

    try {
      const coords = [
        [origen.lng, origen.lat],
        [destino.lng, destino.lat],
      ];

      const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coordinates: coords, radiuses: [200, 200] }),
      });

      const data = await res.json();

      if (!res.ok || !data.routes || data.routes.length === 0) {
        setRuta([]);
        setRutaGeo(null);
        setErrorRuta(true);
        return;
      }

      const encoded = data.routes[0].geometry;
      const decoded = polyline.decode(encoded);
      const latlngs = decoded.map(([lat, lng]) => [lat, lng]);

      const summary = data.routes[0].summary;
      setRuta(latlngs);
      setRutaGeo(JSON.stringify(latlngs)); // geometry compacta para guardar
      setDistanciaKm((summary.distance).toFixed(2));
      setDuracionMin((summary.duration).toFixed(0));
      setMostrarDistancia((summary.distance / 1000).toFixed(2));
      setMostrarDuracion((summary.duration / 60).toFixed(0));

      setErrorRuta(false);
    } catch (err) {
      console.error("Error al obtener ruta:", err);
      setRuta([]);
      setRutaGeo(null);
      setErrorRuta(true);
    }
  }, [origen, destino, setRutaGeo, setDistanciaKm, setDuracionMin]);

  useEffect(() => {
    obtenerRuta();
  }, [obtenerRuta]);

  if (errorRuta) {
    return (
      <div className="text-red-600 text-sm mt-2">
        ❌ No se pudo calcular una ruta entre las direcciones seleccionadas.
      </div>
    );
  }

  if (!ruta.length) return null;

  return (
    <div className="mt-4 space-y-2">
      <h4 className="font-semibold text-blue-600">Ruta estimada:</h4>

      <MapContainer
        center={[origen.lat, origen.lng]}
        zoom={13}
        style={{
          height: "300px",
          width: "100%",
          borderRadius: "8px",
          zIndex: 0, // <- forzar que esté debajo
          position: "relative" // <- necesario para que funcione z-index
        }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={[origen.lat, origen.lng]} icon={markerIcon}>
          <Popup>Origen</Popup>
        </Marker>
        <Marker position={[destino.lat, destino.lng]} icon={markerIcon}>
          <Popup>Destino</Popup>
        </Marker>
        <Polyline positions={ruta} color="blue" weight={5} />
      </MapContainer>

      <div className="text-sm text-gray-700 mt-2 text-center">
        <p><strong>Distancia:</strong> {mostrarDistancia} km</p>
        <p><strong>Duración estimada:</strong> {mostrarDuracion} minutos</p>
      </div>
    </div>
  );
};

export default RutaMap;

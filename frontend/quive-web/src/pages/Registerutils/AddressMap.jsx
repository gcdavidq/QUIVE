// src/components/Registerutils/AddressMap.jsx

import React, { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

function CenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);
  return null;
}

function MapClickHandler({ onManualSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onManualSelect([lat, lng]);
    },
  });
  return null;
}

const EtiquetaUbicacion = ({ position, texto, esValida }) => {
  const map = useMap();
  const [pixelPos, setPixelPos] = useState(null);

  // Función que recalcula la posición del punto
  const updatePosition = useCallback(() => {
    if (position && map) {
      const point = map.latLngToContainerPoint(position);
      setPixelPos(point);
    }
  }, [position, map]);

  useEffect(() => {
    updatePosition();
  }, [updatePosition]);

  useEffect(() => {
    map.on("move", updatePosition);
    map.on("zoom", updatePosition);
    return () => {
      map.off("move", updatePosition);
      map.off("zoom", updatePosition);
    };
  }, [map, updatePosition]);

  if (!pixelPos) return null;

  return (
    <div
      className={`location-label ${esValida ? 'valid' : 'invalid'}`}
      style={{
        left: `${pixelPos.x}px`,
        top: `${pixelPos.y - 35}px`,
      }}
    >
      {texto}
    </div>
  );
};

const AddressMap = ({
  resultados,
  positionSeleccionada,
  onMarkerClick,
  haBuscado,
  onManualSelect,
  esUbicacionValida,
}) => {
  return (
    <div className="mapa-container">
      <MapContainer
        center={positionSeleccionada || [-9.19, -75.02]}
        zoom={positionSeleccionada ? 16 : 6}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {positionSeleccionada && <CenterMap position={positionSeleccionada} />}
        <MapClickHandler onManualSelect={onManualSelect} />

        {resultados.map((item, idx) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          return (
            <Marker key={idx} position={[lat, lon]} icon={markerIcon}>
              <Popup>
                <div className="marker-popup">
                  <div className="popup-title">Dirección encontrada:</div>
                  <div className="popup-address">
                    {item.address?.road} {item.address?.house_number || ""},{" "}
                    {item.address?.suburb || item.address?.city || ""},{" "}
                    {item.address?.state || ""}, Perú
                  </div>
                  <button
                    type="button"
                    className="marker-select-btn"
                    onClick={() => onMarkerClick(item)}
                  >
                    Seleccionar esta ubicación
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {!resultados.length && positionSeleccionada && (
          <Marker position={positionSeleccionada} icon={markerIcon}>
            <Popup>
              <strong>Ubicación seleccionada manualmente</strong>
            </Popup>
          </Marker>
        )}

        {/* Siempre mostrar etiqueta sobre el punto */}
        {positionSeleccionada && (
          <EtiquetaUbicacion
            position={L.latLng(positionSeleccionada)}
            texto={esUbicacionValida ? "✔ Ubicación válida para ruta" : "⚠ Ubicación no válida"}
            esValida={esUbicacionValida}
          />
        )}
      </MapContainer>

      {haBuscado && resultados.length === 0 && (
        <div className="overlay-message">
          No se encontraron ubicaciones. Puedes seleccionar un punto en el mapa.
        </div>
      )}

      {positionSeleccionada && (
        <div className="coord-text">
          Latitud: {positionSeleccionada[0].toFixed(6)}, Longitud:{" "}
          {positionSeleccionada[1].toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default AddressMap;
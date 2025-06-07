// src/components/Registerutils/AddressMap.jsx

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const styles = {
  mapaContainer: {
    width: "100%",
    height: "300px",
    marginTop: "1rem",
    borderRadius: "8px",
    overflow: "hidden",
    position: "relative",
  },
  coordText: {
    marginTop: "0.5rem",
    fontSize: "0.9rem",
    color: "#333",
    textAlign: "center",
  },
  overlayMessage: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: "0.8rem 1rem",
    borderRadius: "6px",
    textAlign: "center",
    fontSize: "0.95rem",
    color: "#555",
    zIndex: 10,
    pointerEvents: "none",
    width: "80%",
  },
};

// Centrar el mapa si cambia la posición seleccionada
function CenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);
  return null;
}

// Captura clics del usuario sobre el mapa
function MapClickHandler({ onManualSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onManualSelect([lat, lng]);
    },
  });
  return null;
}

const AddressMap = ({
  resultados,
  positionSeleccionada,
  onMarkerClick,
  haBuscado,
  onManualSelect, // nuevo prop
}) => {
  return (
    <div style={styles.mapaContainer}>
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
                <div style={{ maxWidth: "200px" }}>
                  <strong>Dirección encontrada:</strong>
                  <p style={{ fontSize: "0.9rem" }}>
                    {item.address?.road} {item.address?.house_number || ""},{" "}
                    {item.address?.suburb || item.address?.city || ""},{" "}
                    {item.address?.state || ""}, Perú
                  </p>
                  <button
                    type="button"
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.4rem 0.6rem",
                      backgroundColor: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                    }}
                    onClick={() => onMarkerClick(item)}
                  >
                    Seleccionar esta ubicación
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Mostrar marcador manual si no hay resultados */}
        {!resultados.length && positionSeleccionada && (
          <Marker position={positionSeleccionada} icon={markerIcon}>
            <Popup>
              <strong>Ubicación seleccionada manualmente</strong>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {haBuscado && resultados.length === 0 && (
        <div style={styles.overlayMessage}>
          No se encontraron ubicaciones. Puedes seleccionar un punto en el mapa.
        </div>
      )}

      {positionSeleccionada && (
        <div style={styles.coordText}>
          Latitud: {positionSeleccionada[0].toFixed(6)}, Longitud:{" "}
          {positionSeleccionada[1].toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default AddressMap;

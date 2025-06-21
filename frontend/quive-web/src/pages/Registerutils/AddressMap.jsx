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

const EtiquetaUbicacion = ({ position, texto, colorFondo, colorTexto }) => {
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
      style={{
        position: "absolute",
        left: `${pixelPos.x}px`,
        top: `${pixelPos.y - 35}px`,
        transform: "translate(-50%, -100%)",
        backgroundColor: colorFondo,
        color: colorTexto,
        border: `1px solid ${colorTexto}`,
        borderRadius: "6px",
        padding: "4px 10px",
        fontSize: "0.75rem",
        whiteSpace: "nowrap",
        zIndex: 999,
        pointerEvents: "none",
        fontWeight: "500",
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
            texto= {"✔ Ubicación válida para ruta"
            }
            colorFondo={"#fee2e2|"}
            colorTexto={"#991b1b"}
          />
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

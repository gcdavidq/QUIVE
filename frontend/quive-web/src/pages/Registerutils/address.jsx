// src/components/Registerutils/UbicacionPeru.jsx

import React, { useState } from "react";
import AddressForm from "./AddressForm";
import AddressMap from "./AddressMap";
import useUbicacionDesdeExcel from "./distrito";

// SVG inline de pin (color rojo suave) para el botón
const PinIcon = ({ size = 16, color = "#d9534f", style = {} }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M12 21c0 0-7-4.35-7-11a7 7 0 0114 0c0 6.65-7 11-7 11z" />
    <circle cx="12" cy="10" r="2" />
  </svg>
);

// Estilos para el overlay (modal)
const overlayStyles = {
  modalBackdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 50,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "1.5rem",
    borderRadius: "12px",
    width: "95%",
    maxWidth: "750px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    position: "relative",
  },
};

const sinonimosTipoVia = {
  Avenida: ["Avenida", "Av.", "Av"],
  Calle: ["Calle", "Cll", "C."],
  Jirón: ["Jirón", "Jr.", "Jr"],
  Pasaje: ["Pasaje", "Pje.", "Pje"]
};

function obtenerSinonimos(tipoVia) {
  return sinonimosTipoVia[tipoVia] || [tipoVia];
}

const UbicacionPeru = ({ direccion, setUbicacion }) => {
  const datosUbicacion = useUbicacionDesdeExcel() || {};
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [positionSeleccionada, setPositionSeleccionada] = useState(null);
  const [haBuscado, setHaBuscado] = useState(false);

  // Construye el string de búsqueda para Nominatim
  const construirQuery = ({ incluyeNumero, tipoViaAlternativo }) => {
    const partes = [];

    if (incluyeNumero && direccion.numero) {
      partes.push(`${direccion.numero} ${direccion.nombreVia}`);
    } else if (direccion.nombreVia) {
      partes.push(`${tipoViaAlternativo} ${direccion.nombreVia}`);
    } else {
      partes.push(tipoViaAlternativo);
    }

    if (direccion.distrito) partes.push(direccion.distrito);
    if (direccion.provincia) partes.push(direccion.provincia);
    if (direccion.departamento) partes.push(direccion.departamento);
    partes.push("Peru");

    return partes.filter(Boolean).join(", ");
  };


  // Llamada a Nominatim en 3 pasos según lógica
  const buscarEnMapa = async () => {
    setHaBuscado(true);
    setResultados([]);
    setPositionSeleccionada(null);

    const sinonimos = obtenerSinonimos(direccion.tipoVia);
    let resultadosAcumulados = [];

    for (const tipoVia of sinonimos) {
      // 1) Buscar con número
      const queryConNumero = construirQuery({ incluyeNumero: true, tipoViaAlternativo: tipoVia });
      let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(queryConNumero)}`;
      let resp = await fetch(url, { headers: { "User-Agent": "QUIVE-App" } });
      let data = await resp.json();
      if (data?.length) {
        resultadosAcumulados = [...resultadosAcumulados, ...data];
      }

      // 2) Buscar sin número (nombre de vía)
      const querySinNumero = construirQuery({ incluyeNumero: false, tipoViaAlternativo: tipoVia });
      url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&q=${encodeURIComponent(querySinNumero)}`;
      resp = await fetch(url, { headers: { "User-Agent": "QUIVE-App" } });
      data = await resp.json();
      if (data?.length) {
        resultadosAcumulados = [...resultadosAcumulados, ...data];
      }
    }

    // Eliminar duplicados por lat/lon
    const keySet = new Set();
    const filtrados = resultadosAcumulados.filter(item => {
      const key = `${item.lat}-${item.lon}`;
      if (keySet.has(key)) return false;
      keySet.add(key);
      return true;
    });

    setResultados(filtrados);
  };


  // Cuando el usuario selecciona un marcador en el mapa…
  const onMarkerClick = (objeto) => {
    const address = objeto.address || {};
    const lat = objeto.lat;
    const lon = objeto.lon;

    let numeroEncontrado = address.house_number || "";
    if (!numeroEncontrado) {
      const nombreVia = direccion.nombreVia?.trim();
      const regexViaConNumero = new RegExp(`${nombreVia}\\s+(\\d{1,5})`, "i");
      const matchNum = objeto.display_name.match(regexViaConNumero);
      numeroEncontrado = matchNum ? matchNum[1] : "";
    }

    const viaCompleta = address.road || "";
    let tipoViaNuevo = "";
    let nombreViaNuevo = "";
    if (viaCompleta) {
      const partesVia = viaCompleta.split(" ");
      tipoViaNuevo = partesVia[0];
      nombreViaNuevo = partesVia.slice(1).join(" ");
    }

    setUbicacion({
      ...direccion,
      tipoVia: tipoViaNuevo,
      nombreVia: nombreViaNuevo,
      numero: numeroEncontrado,
      lat: parseFloat(lat),
      lng: parseFloat(lon),
    });

    setPositionSeleccionada([parseFloat(lat), parseFloat(lon)]);
  };

  // ✅ Nuevo: cuando el usuario hace clic libre en el mapa
  const onManualSelect = async ([lat, lon]) => {
    setPositionSeleccionada([lat, lon]);
    setResultados([]);

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
      const resp = await fetch(url, { headers: { "User-Agent": "QUIVE-App" } });
      const data = await resp.json();

      const address = data?.address || {};
      const departamento = address.state || "";
      const provincia =
        address.county || address.region || address.state_district || "";
      const distrito =
        address.city_district || address.suburb || address.city || "";

      const viaCompleta = address.road || "";
      const numero = address.house_number || "";

      let tipoVia = "";
      let nombreVia = "";
      if (viaCompleta) {
        const partesVia = viaCompleta.split(" ");
        tipoVia = partesVia[0];
        nombreVia = partesVia.slice(1).join(" ");
      }

      setUbicacion({
        ...direccion,
        departamento,
        provincia,
        distrito,
        tipoVia,
        nombreVia,
        numero,
        lat,
        lng: lon,
      });
    } catch (error) {
      console.error("Error al hacer reverse geocoding:", error);
    }
  };

  const resumenUbicacion = `${direccion.tipoVia} ${direccion.nombreVia} ${direccion.numero}, ${direccion.distrito}, ${direccion.provincia}, ${direccion.departamento}, Peru`

  return (
    <div>
      {/* Botón que abre el modal */}
      <button
        type="button"
        onClick={() => setMostrarFormulario(true)}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white flex items-center justify-start text-sm text-gray-800"
      >
        <PinIcon />
        <span className="ml-2">📍 {resumenUbicacion}</span>
      </button>

      {/* Modal superpuesto */}
      {mostrarFormulario && (
        <div style={overlayStyles.modalBackdrop}>
          <div style={overlayStyles.modalContent}>
            {/* Botón de cerrar */}
            <button
              style={{
                position: "absolute",
                top: "8px",
                right: "12px",
                fontSize: "20px",
                cursor: "pointer",
                background: "transparent",
                border: "none",
                color: "#555",
              }}
              onClick={() => setMostrarFormulario(false)}
            >
              ✕
            </button>

            {/* 1) Formulario de campos: Departamento, Provincia, Distrito, etc. */}
            <AddressForm
              datosUbicacion={datosUbicacion}
              direccion={direccion}
              setUbicacion={setUbicacion}
              onBuscar={buscarEnMapa}
            />

            {/* 2) Mapa con resultados, coordenadas y mensaje situacional */}
            <AddressMap
              resultados={resultados}
              positionSeleccionada={positionSeleccionada}
              onMarkerClick={onMarkerClick}
              onManualSelect={onManualSelect}
              haBuscado={haBuscado}
            />
            {direccion.lat && direccion.lng && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#374151", textAlign: "left" }}>
                Coordenadas seleccionadas:<br />
                <strong>Lat:</strong> {direccion.lat.toFixed(6)}&nbsp;&nbsp;
                <strong>Lng:</strong> {direccion.lng.toFixed(6)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UbicacionPeru;

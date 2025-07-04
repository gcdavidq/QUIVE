// src/components/Registerutils/UbicacionPeru.jsx

import React, { useState } from "react";
import AddressForm from "./AddressForm";
import AddressMap from "./AddressMap";
import useUbicacionDesdeExcel from "./distrito";

// SVG inline de pin (color rojo suave) para el botón
const PinIcon = ({ size = 16, color = "#d9534f" }) => (
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
  >
    <path d="M12 21c0 0-7-4.35-7-11a7 7 0 0114 0c0 6.65-7 11-7 11z" />
    <circle cx="12" cy="10" r="2" />
  </svg>
);

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
  const [positionSeleccionada, setPositionSeleccionada] = useState(() => {
    if (direccion.lat && direccion.lng) {
      return [parseFloat(direccion.lat), parseFloat(direccion.lng)];
    }
    return null;
  });
  const [haBuscado, setHaBuscado] = useState(false);
  const [esUbicacionValida, setEsUbicacionValida] = useState(null);

  const validarUbicacion = async ([lat, lon]) => {
    const puntoReferencia = [-12.045627, -77.052869]; // Lima
    const body = {
      coordinates: [
        [puntoReferencia[1], puntoReferencia[0]],
        [lon, lat],
      ],
      radiuses: [200, 200],
    };

    try {
      const response = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
        method: "POST",
        headers: {
          Authorization: "5b3ce3597851110001cf6248586c45473a8042fbbe48c152e2539778",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      const tieneRuta = data?.routes?.[0]?.geometry !== undefined;
      return tieneRuta;
    } catch (err) {
      console.error("Error en validación de ruta:", err);
      return false;
    }
  };

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
      lat: parseFloat(lat) || "",
      lng: parseFloat(lon) || "",
    });

    setPositionSeleccionada([parseFloat(lat), parseFloat(lon)]);
    validarUbicacion([parseFloat(lat), parseFloat(lon)]);
  };

  // Cuando el usuario hace clic libre en el mapa
  const onManualSelect = async ([lat, lon]) => {
    const esValida = await validarUbicacion([lat, lon]);
    setEsUbicacionValida(esValida);

    // Mostrar mensaje pero no cambiar punto si no es válida
    if (!esValida) {
      return;
    }

    setPositionSeleccionada([lat, lon]);
    setResultados([]);
    
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
      const resp = await fetch(url, { headers: { "User-Agent": "QUIVE-App" } });
      const data = await resp.json();
      const address = data?.address || {};

      const departamento = address.state || "";
      const provincia = address.county || address.region || address.state_district || "";
      const distrito = address.city_district || address.suburb || address.city || "";
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

  // Verificar si hay ubicación seleccionada
  const tieneUbicacion = direccion.lat && direccion.lng && 
    (direccion.tipoVia || direccion.nombreVia || direccion.distrito);

  const resumenUbicacion = tieneUbicacion 
    ? `${direccion.tipoVia} ${direccion.nombreVia} ${direccion.numero}, ${direccion.distrito}, ${direccion.provincia}, ${direccion.departamento}, Peru`
    : "Seleccione su ubicación";
  return (
    <div>
      {/* Botón que abre el modal */}
      <button
        type="button"
        onClick={() => setMostrarFormulario(true)}
        className="ubicacion-button"
      >
        <div className="ubicacion-button-content">
          <div className="ubicacion-button-icon">
            <PinIcon />
          </div>
          <span className="ubicacion-button-text">📍 {resumenUbicacion}</span>
        </div>
      </button>

      {/* Modal superpuesto */}
      {mostrarFormulario && (
        <div className="ubicacion-modal-backdrop">
          <div className="ubicacion-modal-content">
            {/* Botón de cerrar */}
            <button
              className="ubicacion-modal-close"
              onClick={() => setMostrarFormulario(false)}
              aria-label="Cerrar modal"
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
              esUbicacionValida={esUbicacionValida}
            />
            
            {/* 3) Mostrar coordenadas seleccionadas */}
            {direccion.lat && direccion.lng && (
              <div className="ubicacion-coordenadas">
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
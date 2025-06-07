// src/components/Registerutils/AddressForm.jsx

import React from "react";
import Select from "react-select";

const inputStyles = {
  label: {
    fontWeight: "600",
    marginBottom: "4px",
    display: "block",
  },
  field: {
    marginBottom: "1rem",
    width: "100%",
  },
  input: {
    padding: "10px",
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  buscarBtn: {
    marginTop: "1rem",
    padding: "0.75rem 1.2rem",
    backgroundColor: "#3b82f6",
    color: "#fff",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
};

const AddressForm = ({
  datosUbicacion,
  direccion,
  setUbicacion,
  onBuscar,
}) => {
  const departamentos = Object.keys(datosUbicacion);
  // Encuentra el departamento con coincidencia real
  const departamentoMatch = departamentos.find(
    (dep) => dep.toLowerCase() === (direccion.departamento || "").toLowerCase()
  );

  // Lista de provincias (si hay departamento válido)
  const provincias = departamentoMatch
    ? Object.keys(datosUbicacion[departamentoMatch])
    : [];

  // Encuentra la provincia real dentro del departamento correcto
  const provinciaMatch = provincias.find(
    (prov) => prov.toLowerCase() === (direccion.provincia || "").toLowerCase()
  );

  // Lista de distritos (si hay provincia válida)
  const distritos =
    departamentoMatch &&
    provinciaMatch &&
    datosUbicacion[departamentoMatch][provinciaMatch]
      ? datosUbicacion[departamentoMatch][provinciaMatch]
      : [];

  const tiposVia = ["Avenida", "Calle", "Jirón", "Pasaje"];
  const getOptionValue = (list, selected) => {
    if (!selected) return null;
    const match = list.find(
      (item) => item.toLowerCase().trim() === selected.toLowerCase().trim()
    );
    return match ? { value: match, label: match } : null;
  };

  const toOptions = (list) => list.map((e) => ({ value: e, label: e }));

  return (
    <div>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        maxWidth: '800px',
        margin: '0 auto',
      }}>

        {/* Departamento */}
        <div style={{ flex: '1 1 48%' }}>
          <label style={inputStyles.label}>Departamento:</label>
          <Select
            options={toOptions(departamentos)}
            value={getOptionValue(departamentos, direccion.departamento)}
            onChange={(selected) =>
              setUbicacion({
                ...direccion,
                departamento: selected?.value || "",
                provincia: "",
                distrito: "",
                lat: undefined,
                lng: undefined,
              })
            }
            placeholder="Selecciona..."
            isClearable
          />
        </div>

        {/* Provincia */}
        <div style={{ flex: '1 1 48%' }}>
          <label style={inputStyles.label}>Provincia:</label>
          <Select
            options={toOptions(provincias)}
            value={getOptionValue(provincias, direccion.provincia)}
            onChange={(selected) =>
              setUbicacion({
                ...direccion,
                provincia: selected?.value || "",
                distrito: "",
                lat: undefined,
                lng: undefined,
              })
            }
            placeholder="Selecciona..."
            isDisabled={!direccion.departamento}
            isClearable
          />
        </div>

        {/* Distrito */}
        <div style={{ flex: '1 1 48%' }}>
          <label style={inputStyles.label}>Distrito:</label>
          <Select
            options={toOptions(distritos)}
            value={getOptionValue(distritos, direccion.distrito)}
            onChange={(selected) =>
              setUbicacion({
                ...direccion,
                distrito: selected?.value || "",
                lat: undefined,
                lng: undefined,
              })
            }
            placeholder="Selecciona..."
            isDisabled={!direccion.provincia}
            isClearable
          />
        </div>

        {/* Tipo de vía */}
        <div style={{ flex: '1 1 48%' }}>
          <label style={inputStyles.label}>Tipo de vía:</label>
          <Select
            options={toOptions(tiposVia)}
            value={getOptionValue(tiposVia, direccion.tipoVia)}
            onChange={(selected) =>
              setUbicacion({
                ...direccion,
                tipoVia: selected?.value || "",
                nombreVia: "",
                numero: "",
                lat: undefined,
                lng: undefined,
              })
            }
            placeholder="Selecciona..."
            isClearable
          />
        </div>

        {/* Nombre de la vía */}
        <div style={{ flex: '1 1 48%' }}>
          <label style={inputStyles.label}>Nombre de la vía:</label>
          <input
            type="text"
            style={inputStyles.input}
            value={direccion.nombreVia}
            onChange={(e) =>
              setUbicacion({
                ...direccion,
                nombreVia: e.target.value,
                numero: "",
                lat: undefined,
                lng: undefined,
              })
            }
            placeholder="Ej. Primavera"
            disabled={!direccion.tipoVia}
          />
        </div>

        {/* Número */}
        <div style={{ flex: '1 1 48%' }}>
          <label style={inputStyles.label}>Número:</label>
          <input
            type="number"
            style={inputStyles.input}
            value={direccion.numero}
            onChange={(e) =>
              setUbicacion({
                ...direccion,
                numero: e.target.value,
                lat: undefined,
                lng: undefined,
              })
            }
            placeholder="Ej. 123"
            disabled={!direccion.nombreVia}
          />
        </div>

      </div>

      {/* Botón “Buscar en el mapa” */}
      <button
        type="button"
        style={inputStyles.buscarBtn}
        onClick={onBuscar}
        disabled={
          !direccion.departamento ||
          !direccion.provincia ||
          !direccion.distrito ||
          !direccion.tipoVia
        }
      >
        Buscar en el mapa
      </button>
    </div>
  );
};

export default AddressForm;

// src/components/Registerutils/AddressForm.jsx

import React from "react";
import Select from "react-select";

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

  // Estilos personalizados para react-select
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: `1px solid var(--border-color)`,
      borderRadius: '6px',
      backgroundColor: 'var(--bg-primary)',
      minHeight: '42px',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(13, 110, 253, 0.1)' : 'none',
      '&:hover': {
        borderColor: 'var(--button-bg)'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--text-primary)'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'var(--text-secondary)'
    }),
    input: (provided) => ({
      ...provided,
      color: 'var(--text-primary)'
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '6px',
      boxShadow: '0 4px 12px var(--shadow)',
      zIndex: 9999
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'var(--button-bg)' 
        : state.isFocused 
        ? 'var(--bg-secondary)' 
        : 'transparent',
      color: state.isSelected ? 'white' : 'var(--text-primary)',
      padding: '8px 12px',
      cursor: 'pointer'
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: 'var(--text-secondary)',
      cursor: 'pointer',
      '&:hover': {
        color: 'var(--text-primary)'
      }
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'var(--text-secondary)',
      '&:hover': {
        color: 'var(--text-primary)'
      }
    })
  };

  return (
    <div className="address-form-container">
      <div className="address-form-grid">

        {/* Departamento */}
        <div className="address-form-field">
          <label className="address-form-label">Departamento:</label>
          <Select
            options={toOptions(departamentos)}
            value={getOptionValue(departamentos, direccion.departamento) || ""}
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
            styles={selectStyles}
          />
        </div>

        {/* Provincia */}
        <div className="address-form-field">
          <label className="address-form-label">Provincia:</label>
          <Select
            options={toOptions(provincias)}
            value={getOptionValue(provincias, direccion.provincia) || ""}
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
            styles={selectStyles}
          />
        </div>

        {/* Distrito */}
        <div className="address-form-field">
          <label className="address-form-label">Distrito:</label>
          <Select
            options={toOptions(distritos)}
            value={getOptionValue(distritos, direccion.distrito) || ""}
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
            styles={selectStyles}
          />
        </div>

        {/* Tipo de vía */}
        <div className="address-form-field">
          <label className="address-form-label">Tipo de vía:</label>
          <Select
            options={toOptions(tiposVia)}
            value={getOptionValue(tiposVia, direccion.tipoVia) || ""}
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
            styles={selectStyles}
          />
        </div>

        {/* Nombre de la vía */}
        <div className="address-form-field">
          <label className="address-form-label">Nombre de la vía:</label>
          <input
            type="text"
            className="address-form-input"
            value={direccion.nombreVia || ""}
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
        <div className="address-form-field">
          <label className="address-form-label">Número:</label>
          <input
            type="number"
            className="address-form-input"
            value={direccion.numero || ""}
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

      {/* Botón "Buscar en el mapa" */}
      <button
        type="button"
        className="address-search-btn"
        onClick={onBuscar}
        disabled={
          !direccion.departamento ||
          !direccion.provincia ||
          !direccion.distrito ||
          !direccion.tipoVia
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        Buscar en el mapa
      </button>
    </div>
  );
};

export default AddressForm;
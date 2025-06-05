import React, { useState } from "react";
import useUbicacionDesdeExcel from "./distrito";

// Opciones para “Tipo de vía”
const tiposVia = ["Avenida", "Calle", "Jirón", "Pasaje"];

// SVG inline de pin (color rojo suave)
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

const styles = {
  container: {
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
    padding: "1rem 1.5rem",
    maxWidth: "600px",
    margin: "1rem auto",
    fontFamily: "Arial, sans-serif",
  },
  toggleButton: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#f9f9f9",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
    cursor: "pointer",
    outline: "none",
  },
  toggleText: {
    marginLeft: "8px",
  },
  row: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
    flexWrap: "wrap",
  },
  field: {
    flex: 1,
    minWidth: "150px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "#555",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    color: "#333",
    backgroundColor: "#fff",
    outline: "none",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    color: "#333",
    backgroundColor: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
};

const UbicacionPeru = ({ direccion, setUbicacion }) => {
  const datosUbicacion = useUbicacionDesdeExcel();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const departamentos = Object.keys(datosUbicacion);
  const provincias = direccion.departamento
    ? Object.keys(datosUbicacion[direccion.departamento])
    : [];
  const distritos =
    direccion.departamento && direccion.provincia
      ? datosUbicacion[direccion.departamento][direccion.provincia]
      : [];

  // Genera el texto resumido para el botón
  const resumenUbicacion = [
    direccion.departamento,
    direccion.provincia,
    direccion.distrito,
    direccion.tipoVia && direccion.nombreVia
      ? `${direccion.tipoVia} ${direccion.nombreVia}`
      : "",
    direccion.numero ? `Nº ${direccion.numero}` : "",
  ]
    .filter(Boolean)
    .join(" / ") || "Selecciona tu ubicación";

  return (
    <div style={styles.container}>
      {/* Botón para mostrar/ocultar el formulario */}
      <button
        type="button"
        style={styles.toggleButton}
        onClick={() => setMostrarFormulario((prev) => !prev)}
      >
        <PinIcon />
        <span style={styles.toggleText}>📍 {resumenUbicacion}</span>
      </button>

      {/* Formulario (solo si mostrarFormulario === true) */}
      {mostrarFormulario && (
        <>
          {/* Primera fila: Departamento y Provincia */}
          <div style={styles.row}>
            {/* Departamento */}
            <div style={styles.field}>
              <label style={styles.label}>Departamento:</label>
              <select
                style={styles.select}
                value={direccion.departamento}
                onChange={(e) =>
                  setUbicacion({
                    ...direccion,
                    departamento: e.target.value,
                    provincia: "",
                    distrito: "",
                  })
                }
              >
                <option value="">-- Selecciona --</option>
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            {/* Provincia */}
            <div style={styles.field}>
              <label style={styles.label}>Provincia:</label>
              <select
                style={styles.select}
                value={direccion.provincia}
                onChange={(e) =>
                  setUbicacion({
                    ...direccion,
                    provincia: e.target.value,
                    distrito: "",
                  })
                }
                disabled={!direccion.departamento}
              >
                <option value="">-- Selecciona --</option>
                {provincias.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Segunda fila: Distrito (ancho completo) */}
          <div style={styles.row}>
            <div style={{ ...styles.field, flex: "1 1 100%" }}>
              <label style={styles.label}>Distrito:</label>
              <select
                style={styles.select}
                value={direccion.distrito}
                onChange={(e) =>
                  setUbicacion({ ...direccion, distrito: e.target.value })
                }
                disabled={!direccion.provincia}
              >
                <option value="">-- Selecciona --</option>
                {distritos.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tercera fila: Tipo de vía y Nombre de la vía */}
          <div style={styles.row}>
            {/* Tipo de vía */}
            <div style={styles.field}>
              <label style={styles.label}>Tipo de vía:</label>
              <select
                style={styles.select}
                value={direccion.tipoVia}
                onChange={(e) =>
                  setUbicacion({ ...direccion, tipoVia: e.target.value })
                }
              >
                <option value="">-- Selecciona --</option>
                {tiposVia.map((via) => (
                  <option key={via} value={via}>
                    {via}
                  </option>
                ))}
              </select>
            </div>

            {/* Nombre de la vía */}
            <div style={styles.field}>
              <label style={styles.label}>Nombre de la vía:</label>
              <input
                type="text"
                style={styles.input}
                value={direccion.nombreVia}
                onChange={(e) =>
                  setUbicacion({ ...direccion, nombreVia: e.target.value })
                }
                placeholder="Ej. Primavera"
              />
            </div>
          </div>

          {/* Cuarta fila: Número (ancho completo) */}
          <div style={styles.row}>
            <div style={{ ...styles.field, flex: "1 1 100%" }}>
              <label style={styles.label}>Número:</label>
              <input
                type="number"
                style={styles.input}
                min="1"
                value={direccion.numero}
                onChange={(e) =>
                  setUbicacion({ ...direccion, numero: e.target.value })
                }
                placeholder="Ej. 123"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UbicacionPeru;

import React, { useState } from "react";

// Ícono de ojo minimalista (SVG inline)
const EyeIcon = ({ size = 20, color = "#007bff" }) => (
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
    style={{ marginRight: "6px" }}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const styles = {
  container: {
    backgroundColor: "#ffffff",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    maxWidth: "480px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#333",
  },
  viewButton: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#007bff",
    fontWeight: "500",
    background: "none",
    border: "none",
    padding: "0",
    cursor: "pointer",
    userSelect: "none",
  },
  field: {
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "0.5rem",
    color: "#444",
  },
  fileWrapper: {
    position: "relative",
  },
  fakeInput: {
    display: "flex",
    alignItems: "center",
    padding: "0.75rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    backgroundColor: "#f0f0f0",
    color: "#555",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  realInput: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },
  fileInfo: {
    fontStyle: "italic",
    fontSize: "13px",
    color: "#333",
    marginTop: "0.5rem",
    textAlign: "left",
  },
};

const SubidaDocumentos = ({ documentos, setDocumentos }) => {
  // Estado para mostrar/ocultar los campos de subida
  const [showFields, setShowFields] = useState(false);

  const handleFileChange = (e, tipo) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentos({ ...documentos, [tipo]: file });
    }
  };

  return (
    <div style={styles.container}>
      {/* Header con título y botón de ojo */}
      <div style={styles.header}>
        <div style={styles.title}>Documentos Requeridos</div>
        <button
          type="button"
          style={styles.viewButton}
          onClick={() => setShowFields((prev) => !prev)}
        >
          <EyeIcon color="#007bff" />
          Ver Documentos
        </button>
      </div>

      {/* Campos de subida, se renderizan sólo si showFields === true */}
      {showFields && (
        <>
          {/* Licencia de Conducir */}
          <div style={styles.field}>
            <label style={styles.label}>Licencia de Conducir (PDF)</label>
            <div style={styles.fileWrapper}>
              <div style={styles.fakeInput}>
                {/* Puedes reutilizar el EyeIcon con color gris si prefieres,
                    o usar otro SVG; aquí uso el mismo puro para tener un mini ícono */}
                <EyeIcon size={16} color="#555" />
                Seleccionar archivo PDF
                <input
                  type="file"
                  accept=".pdf"
                  style={styles.realInput}
                  onChange={(e) => handleFileChange(e, "licencia_conducir")}
                />
              </div>
            </div>
            {documentos.licencia_conducir && (
              <div style={styles.fileInfo}>
                {documentos.licencia_conducir.name} (
                {(documentos.licencia_conducir.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          {/* Tarjeta de Propiedad */}
          <div style={styles.field}>
            <label style={styles.label}>Tarjeta de Propiedad (PDF)</label>
            <div style={styles.fileWrapper}>
              <div style={styles.fakeInput}>
                <EyeIcon size={16} color="#555" />
                Seleccionar archivo PDF
                <input
                  type="file"
                  accept=".pdf"
                  style={styles.realInput}
                  onChange={(e) => handleFileChange(e, "tarjeta_propiedad")}
                />
              </div>
            </div>
            {documentos.tarjeta_propiedad && (
              <div style={styles.fileInfo}>
                {documentos.tarjeta_propiedad.name} (
                {(documentos.tarjeta_propiedad.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          {/* Certificado de ITV */}
          <div style={styles.field}>
            <label style={styles.label}>Certificado de ITV (PDF)</label>
            <div style={styles.fileWrapper}>
              <div style={styles.fakeInput}>
                <EyeIcon size={16} color="#555" />
                Seleccionar archivo PDF
                <input
                  type="file"
                  accept=".pdf"
                  style={styles.realInput}
                  onChange={(e) => handleFileChange(e, "certificado_itv")}
                />
              </div>
            </div>
            {documentos.certificado_itv && (
              <div style={styles.fileInfo}>
                {documentos.certificado_itv.name} (
                {(documentos.certificado_itv.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SubidaDocumentos;

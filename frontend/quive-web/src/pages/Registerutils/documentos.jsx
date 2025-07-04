import React, { useState } from "react";

// Ícono de ojo minimalista (SVG inline)
const EyeIcon = ({ size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

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
    <div className="documentos-container">
      {/* Header con título y botón de ojo */}
      <div className="documentos-header">
        <div className="documentos-title">Documentos Requeridos</div>
        <button
          type="button"
          className="documentos-view-button"
          onClick={() => setShowFields((prev) => !prev)}
        >
          <EyeIcon className="documentos-eye-icon" />
          Ver Documentos
        </button>
      </div>

      {/* Campos de subida, se renderizan sólo si showFields === true */}
      {showFields && (
        <div className="documentos-fields">
          {/* Licencia de Conducir */}
          <div className="documentos-field">
            <label className="documentos-label">Licencia de Conducir (PDF)</label>
            <div className="documentos-file-wrapper">
              <div className="documentos-fake-input">
                <EyeIcon size={16} className="documentos-file-icon" />
                Seleccionar archivo PDF
                <input
                  type="file"
                  accept=".pdf"
                  className="documentos-real-input"
                  onChange={(e) => handleFileChange(e, "licencia_conducir")}
                />
              </div>
            </div>
            {documentos.licencia_conducir && (
              <div className="documentos-file-info">
                {documentos.licencia_conducir.name} (
                {(documentos.licencia_conducir.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          {/* Tarjeta de Propiedad */}
          <div className="documentos-field">
            <label className="documentos-label">Tarjeta de Propiedad (PDF)</label>
            <div className="documentos-file-wrapper">
              <div className="documentos-fake-input">
                <EyeIcon size={16} className="documentos-file-icon" />
                Seleccionar archivo PDF
                <input
                  type="file"
                  accept=".pdf"
                  className="documentos-real-input"
                  onChange={(e) => handleFileChange(e, "tarjeta_propiedad")}
                />
              </div>
            </div>
            {documentos.tarjeta_propiedad && (
              <div className="documentos-file-info">
                {documentos.tarjeta_propiedad.name} (
                {(documentos.tarjeta_propiedad.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          {/* Certificado de ITV */}
          <div className="documentos-field">
            <label className="documentos-label">Certificado de ITV (PDF)</label>
            <div className="documentos-file-wrapper">
              <div className="documentos-fake-input">
                <EyeIcon size={16} className="documentos-file-icon" />
                Seleccionar archivo PDF
                <input
                  type="file"
                  accept=".pdf"
                  className="documentos-real-input"
                  onChange={(e) => handleFileChange(e, "certificado_itv")}
                />
              </div>
            </div>
            {documentos.certificado_itv && (
              <div className="documentos-file-info">
                {documentos.certificado_itv.name} (
                {(documentos.certificado_itv.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubidaDocumentos;
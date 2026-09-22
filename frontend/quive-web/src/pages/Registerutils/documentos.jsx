import React from "react";
import { FileUp, FileCheck } from 'lucide-react';

const DOCUMENTOS = [
  { campo: "licencia_conducir", titulo: "Licencia de conducir" },
  { campo: "tarjeta_propiedad", titulo: "Tarjeta de propiedad" },
  { campo: "certificado_itv", titulo: "Certificado de inspección técnica (ITV)" },
];

// Subida de los tres documentos del TRANSPORTISTA (PDF).
const SubidaDocumentos = ({ documentos, setDocumentos }) => (
  <div className="space-y-3">
    <span className="field-label">Documentos requeridos (PDF)</span>
    {DOCUMENTOS.map(({ campo, titulo }) => {
      const archivo = documentos[campo];
      return (
        <label
          key={campo}
          className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136] hover:border-[#4d93f5] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`stat-icon ${archivo ? 'stat-mint' : 'stat-blue'} !h-9 !w-9 flex-shrink-0`}>
              {archivo ? <FileCheck size={16} /> : <FileUp size={16} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#16365f] dark:text-white">{titulo}</p>
              <p className="text-[11px] text-[#8da3bd] truncate">
                {archivo ? `${archivo.name} · ${(archivo.size / 1024).toFixed(0)} KB` : 'Ningún archivo seleccionado'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#4d93f5] flex-shrink-0">{archivo ? 'Cambiar' : 'Seleccionar'}</span>
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) setDocumentos({ ...documentos, [campo]: file });
            }}
          />
        </label>
      );
    })}
  </div>
);

export default SubidaDocumentos;

import React from 'react';
import { AlertCircle } from 'lucide-react';

// Marco común de cada paso del registro: encabezado, contenido, error y botones.
const PasoRegistro = ({ kicker, titulo, descripcion, children, error, anterior, siguiente }) => (
  <div className="space-y-5">
    <div>
      <span className="section-kicker">{kicker}</span>
      <h2 className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white mt-1">{titulo}</h2>
      {descripcion && <p className="text-xs text-[#8da3bd] mt-1">{descripcion}</p>}
    </div>

    {children}

    {error && (
      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
        <AlertCircle size={15} /> <span>{error}</span>
      </div>
    )}

    <div className="flex gap-3 pt-2">
      {anterior && (
        <button type="button" onClick={anterior.onClick} className="secondary-button flex-1 justify-center !py-3">
          {anterior.texto || 'Volver'}
        </button>
      )}
      {siguiente && (
        <button
          type="button"
          onClick={siguiente.onClick}
          disabled={siguiente.disabled}
          className="primary-button flex-1 justify-center !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{siguiente.texto || 'Siguiente'}</span>
          {siguiente.Icon && <siguiente.Icon size={15} />}
        </button>
      )}
    </div>
  </div>
);

export default PasoRegistro;

import React, { useState } from 'react';
import { Star, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../../api';

// Calificación de la contraparte de un servicio finalizado. El backend decide quién
// califica (la sesión) y a quién (la otra parte de la asignación).
const CalificarModal = ({ servicio, onCerrar, onCalificado }) => {
  const [puntaje, setPuntaje] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const enviar = async () => {
    if (!puntaje) { setError('Elige de 1 a 5 estrellas.'); return; }
    try {
      setEnviando(true);
      await axios.post(`${API_URL}/calificaciones`, {
        id_asignacion: servicio.id_asignacion,
        puntaje,
        comentario: comentario.trim() || null,
      });
      onCalificado();
    } catch (err) {
      setError(err.response?.data?.msg || 'No se pudo registrar la calificación.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c1f36]/50 backdrop-blur-sm p-4" onClick={onCerrar}>
      <div className="surface-card p-6 rounded-2xl max-w-md w-full relative shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onCerrar} className="icon-button h-8 w-8 absolute top-4 right-4" aria-label="Cerrar">
          <X size={16} />
        </button>
        <span className="section-kicker">CALIFICACIÓN DEL SERVICIO</span>
        <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-1">
          ¿Cómo fue tu experiencia con {servicio.usuario_nombre}?
        </h3>

        <div className="flex items-center justify-center gap-2 my-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => { setPuntaje(n); setError(''); }} aria-label={`${n} estrellas`}>
              <Star size={30} className={n <= puntaje ? 'text-amber-400 fill-amber-400' : 'text-[#c7d5e4] dark:text-[#385172]'} />
            </button>
          ))}
        </div>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Comentario (opcional)"
          className="w-full text-xs font-medium py-3 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors"
        />

        {error && (
          <p className="text-rose-500 text-xs mt-2 flex items-center gap-1"><AlertCircle size={13} /> {error}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={onCerrar} className="secondary-button flex-1 justify-center !py-2.5">Cancelar</button>
          <button onClick={enviar} disabled={enviando} className="primary-button flex-1 justify-center !py-2.5 disabled:opacity-50">
            {enviando ? 'Enviando...' : 'Enviar calificación'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalificarModal;

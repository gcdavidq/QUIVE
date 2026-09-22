import React, { useEffect, useState } from 'react';
import { Truck, ArrowRight, RefreshCw } from 'lucide-react';
import API_URL, { apiFetch } from '../../api';
import { conductorDesdeCandidato } from './conductor';
import ConductorCard from './ConductorCard';

const ListaConductores = ({ seleccionarConductor, formData }) => {
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConductores = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`${API_URL}/transportistas/${formData.id_solicitud}/all`);
        const data = response.ok ? await response.json() : [];
        setConductores((Array.isArray(data) ? data : []).map(conductorDesdeCandidato));
      } catch (e) {
        console.error('Error al obtener conductores:', e);
        setConductores([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConductores();
  }, [formData.id_solicitud]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="surface-card p-6 sm:p-8 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--color-border)] mb-6">
          <div>
            <span className="section-kicker">PASO 4 DE 5 · TRANSPORTISTAS</span>
            <h2 className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white mt-1">Elige tu transportista</h2>
            <p className="text-xs text-[#8da3bd] mt-1">
              Ordenados por puntaje. La tarifa se calcula con el precio por km de cada transportista y la distancia de tu mudanza.
            </p>
          </div>
          {!loading && (
            <span className="live-pill self-start sm:self-auto">
              {conductores.length} {conductores.length === 1 ? 'candidato' : 'candidatos'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="animate-spin text-[#4d93f5] mx-auto mb-3" size={28} />
            <p className="text-xs font-semibold theme-text-secondary">Cargando transportistas...</p>
          </div>
        ) : conductores.length === 0 ? (
          <div className="p-10 text-center rounded-xl border border-[var(--color-border)]">
            <Truck className="w-10 h-10 text-[#8da3bd] mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-[#16365f] dark:text-white">No hay transportistas disponibles para esta solicitud</p>
            <p className="text-xs text-[#8da3bd] mt-1">Tu solicitud queda guardada; puedes volver a intentarlo más tarde.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conductores.map((c) => (
              <ConductorCard
                key={c.id_transportista}
                conductor={c}
                accion={
                  <button onClick={() => seleccionarConductor(c)} className="primary-button text-xs !py-2 !px-4">
                    <span>Seleccionar</span>
                    <ArrowRight size={13} />
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaConductores;

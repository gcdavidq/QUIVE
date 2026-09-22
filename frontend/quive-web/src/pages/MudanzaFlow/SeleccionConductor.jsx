import React, { useEffect, useState } from "react";
import { Truck, ArrowRight, RefreshCw, UserCheck, Users } from 'lucide-react';
import API_URL, { apiFetch } from '../../api';
import { conductorDesdeCandidato } from './conductor';
import ConductorCard from './ConductorCard';

const SeleccionConductor = ({ nextStep, seleccionarConductor, formData }) => {
  const [conductorRecomendado, setConductorRecomendado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConductor = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`${API_URL}/transportistas/${formData.id_solicitud}/unico`);
        const data = response.ok ? await response.json() : null;
        setConductorRecomendado(data?.id_transportista ? conductorDesdeCandidato(data) : null);
      } catch (error) {
        console.error("Error al obtener el conductor:", error);
        setConductorRecomendado(null);
      } finally {
        setLoading(false);
      }
    };

    fetchConductor();
  }, [formData.id_solicitud]);

  if (loading) {
    return (
      <div className="surface-card p-12 text-center rounded-2xl max-w-xl mx-auto my-8">
        <RefreshCw className="animate-spin text-[#4d93f5] mx-auto mb-3" size={32} />
        <h3 className="font-display text-base font-bold text-[#16365f] dark:text-white">Buscando transportistas para tu solicitud...</h3>
      </div>
    );
  }

  if (!conductorRecomendado) {
    return (
      <div className="surface-card p-10 text-center rounded-2xl max-w-xl mx-auto my-8">
        <Truck className="w-12 h-12 text-[#8da3bd] mx-auto mb-3 opacity-50" />
        <span className="section-kicker">PASO 3 DE 5 · TRANSPORTISTA</span>
        <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-1">
          No hay transportistas disponibles para esta solicitud
        </h3>
        <p className="text-xs text-[#8da3bd] max-w-md mx-auto mt-1">
          Ningún transportista activo con tarifa registrada cubre esta ruta por ahora. Tu solicitud queda guardada; puedes volver a intentarlo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="surface-card p-6 sm:p-8 rounded-2xl">
        <span className="section-kicker">PASO 3 DE 5 · TRANSPORTISTA</span>
        <h2 className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white mt-1">Transportista sugerido</h2>
        <p className="text-xs text-[#8da3bd] mt-1 mb-6">
          Es el candidato con mejor puntaje para tu solicitud, combinando sus calificaciones, sus incidentes reportados y su tarifa para esta ruta.
        </p>

        <ConductorCard conductor={conductorRecomendado} destacado />

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button onClick={() => nextStep()} className="secondary-button flex-1 justify-center !py-3">
            <Users size={15} />
            <span>Ver todos los transportistas</span>
          </button>
          <button
            onClick={() => { seleccionarConductor(conductorRecomendado); nextStep(); }}
            className="primary-button flex-1 justify-center !py-3"
          >
            <UserCheck size={16} />
            <span>Enviar solicitud a este transportista</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeleccionConductor;

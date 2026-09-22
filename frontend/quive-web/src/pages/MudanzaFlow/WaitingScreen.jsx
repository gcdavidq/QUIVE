import React, { useEffect, useRef } from "react";
import { Loader2, X } from "lucide-react";
import API_URL, { apiFetch } from "../../api";
import { formatoSoles } from "../../utils/estadoServicio";

const WaitingScreen = ({ onCancelar, actualizarFormData, formData, userData, nextStep }) => {
  const pollingRef = useRef(null);

  useEffect(() => {
    if (!formData?.asignacion?.id_asignacion) return;

    const id_asignacion = formData.asignacion.id_asignacion;

    const iniciarMonitoreo = () => {
      pollingRef.current = setInterval(async () => {
        try {
          const response = await apiFetch(
            `${API_URL}/asignaciones/${id_asignacion}/estado`
          );
          const miAsignacion = await response.json();

          if (!miAsignacion) return;

          const estado = miAsignacion.estado;

          if (estado !== "pendiente") {
            clearInterval(pollingRef.current);
          }

          if (estado === "rechazada") {
            actualizarFormData({ conductor: null, asignacion: null });
            if (onCancelar) onCancelar();
          }

          if (estado === "confirmada") {
            actualizarFormData({
              asignacion: {
                id_asignacion: miAsignacion.id_asignacion,
                estado: "confirmada",
              },
            });
            if (nextStep) nextStep();
          }
        } catch (err) {
          console.error("Error al consultar asignación:", err);
        }
      }, 4000);
    };

    iniciarMonitoreo();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [formData?.asignacion, actualizarFormData, onCancelar, userData?.tipo_usuario, nextStep]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-[#0c1f36]/50 backdrop-blur-sm p-4">
      <div className="surface-card p-8 sm:p-10 rounded-3xl shadow-2xl text-center space-y-4 max-w-md w-full border border-blue-200 dark:border-blue-900/60 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#4d93f5] flex items-center justify-center mx-auto shadow-inner">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <div>
          <span className="section-kicker">COMUNICANDO CON EL CONDUCTOR</span>
          <h2 className="font-display text-xl font-extrabold text-[#16365f] dark:text-white mt-1">
            Enviando Solicitud...
          </h2>
          <p className="text-xs text-[#8da3bd] mt-1.5 leading-relaxed">
            Estamos notificando a {formData?.conductor?.nombre || 'tu transportista seleccionado'} para que acepte o rechace la solicitud.
          </p>
        </div>

        <div className="p-3 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136] text-xs flex items-center justify-between">
          <span className="text-[#8da3bd]">Tarifa a pagar:</span>
          <span className="font-display font-extrabold text-base text-[#16365f] dark:text-white">
            {formatoSoles(formData?.conductor?.precio)}
          </span>
        </div>

        <button
          onClick={onCancelar}
          className="w-full py-3 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 pt-2"
        >
          <X size={15} />
          <span>Cancelar y Elegir Otro Conductor</span>
        </button>
      </div>
    </div>
  );
};

export default WaitingScreen;

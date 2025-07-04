import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import API_URL from "../../api"; // Asegúrate de que esta ruta sea correcta

const WaitingScreen = ({ onCancelar, actualizarFormData, formData, userData, nextStep }) => {
  const pollingRef = useRef(null);

  useEffect(() => {
    if (!formData.asignacion?.id_asignacion) return;

    const id_asignacion = formData.asignacion.id_asignacion;

    console.log("Asignación detectada, iniciando monitoreo:", id_asignacion);
    const iniciarMonitoreo = () => {
      console.log("Iniciando monitoreo de asignación:", id_asignacion);
      pollingRef.current = setInterval(async () => {
        try {
          const response = await fetch(
            `${API_URL}/asignaciones/${id_asignacion}/estado`
          );
          const miAsignacion = await response.json(); // Ya es un objeto, no lista

          if (!miAsignacion) return;

          const estado = miAsignacion.estado;
          console.log("Estado actual de la asignación:", estado);

          if (estado !== "pendiente") {
            clearInterval(pollingRef.current);
          }

          if (estado === "rechazada") {
            actualizarFormData({ conductor: null, asignacion: null });
            onCancelar();
          }

          if (estado === "confirmada") {
            actualizarFormData({
              asignacion: {
                id_asignacion: miAsignacion.id_asignacion,
                estado: "confirmada",
              },
            });
            nextStep();
          }
        } catch (err) {
          console.error("Error al consultar asignación:", err);
        }
      }, 5000);
    };

    iniciarMonitoreo();

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [formData.asignacion, actualizarFormData, onCancelar, userData.tipo_usuario, nextStep]);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm">
      <div className="theme-card p-8 rounded-2xl shadow-xl text-center space-y-4 max-w-md w-full">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
        <h2 className="text-2xl font-semibold theme-text-primary">
          Enviando solicitud...
        </h2>
        <p className="theme-text-secondary">
          Por favor espera mientras el conductor acepta o rechaza la solicitud.
        </p>
        <button
          onClick={onCancelar}
          className="btn-delete bg-red-500 text-white font-medium px-6 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Cancelar transportista
        </button>
      </div>
    </div>
  );
};

export default WaitingScreen;

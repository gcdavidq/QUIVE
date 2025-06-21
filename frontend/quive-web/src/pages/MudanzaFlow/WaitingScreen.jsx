import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

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
            `http://127.0.0.1:5000/asignaciones/${id_asignacion}/estado`
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
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="p-8 bg-white rounded-2xl shadow-xl text-center space-y-4">
        <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
        <h2 className="text-2xl font-semibold text-gray-800">Enviando solicitud...</h2>
        <p className="text-gray-600">
          Por favor espera mientras el conductor acepta o rechaza la solicitud.
        </p>
        <button
          onClick={onCancelar}
          className="mt-4 px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
        >
          Cancelar transportista
        </button>
      </div>
    </div>
  );
};

export default WaitingScreen;

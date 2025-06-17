import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

const WaitingScreen = ({ onCancelar, actualizarFormData, formData, userData }) => {
  const asignacionCreadaRef = useRef(false); // 🔐 flag de control
  const pollingRef = useRef(null); // 📡 referencia para el setInterval

  useEffect(() => {
    const iniciarMonitoreo = (id_asignacion) => {
      console.log("Iniciando monitoreo de asignación:", formData);
      pollingRef.current = setInterval(async () => {
        try {
          const response = await fetch(
            `http://127.0.0.1:5000/asignaciones/${id_asignacion}/${userData.tipo_usuario}`
          );
          const asignaciones = await response.json();

          const miAsignacion = asignaciones.find(
            (a) => a.id_asignacion === id_asignacion
          );

          if (!miAsignacion) return;

          if (miAsignacion.estado === "rechazado") {
            clearInterval(pollingRef.current);
            actualizarFormData({ conductor: null, asignacion: null });
            onCancelar(); // vuelve a paso 3
          }

          if (miAsignacion.estado === "confirmado") {
            clearInterval(pollingRef.current);
            actualizarFormData({
              asignacion: {
                id_asignacion: miAsignacion.id_asignacion,
                estado: "confirmado",
              },
            });
            actualizarFormData((prev) => ({
              ...prev,
              avanzarPaso: true,
            }));
          }
        } catch (err) {
          console.error("Error al consultar asignaciones:", err);
        }
      }, 5000);
    };

    const crearAsignacion = async () => {
      if (!formData.conductor || !formData.conductor.id_transportista) {
        console.warn("No hay conductor seleccionado. No se puede crear asignación.");
        return;
      }

      console.log("Creando asignación con datos:", formData);
      try {
        const bodyAsignacion = {
          id_solicitud: formData.id_solicitud,
          id_transportista: formData.conductor.id_transportista,
          precio: formData.conductor.precio,
        };

        const response = await fetch("http://127.0.0.1:5000/asignaciones", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyAsignacion),
        });

        if (!response.ok) throw new Error("Error al crear la asignación");

        const resultado = await response.json();
        console.log("Asignación creada con éxito:", resultado);

        if (actualizarFormData && resultado.id_asignacion) {
          actualizarFormData({
            asignacion: {
              id_asignacion: resultado.id_asignacion,
              estado: resultado.estado,
            },
          });

          iniciarMonitoreo(resultado.id_asignacion);
        }
      } catch (error) {
        console.error("Error en la solicitud de asignación:", error);
        alert("Hubo un error al crear la asignación.");
        onCancelar();
      }
    };

    // 🔒 Proteger contra múltiples ejecuciones
    if (!asignacionCreadaRef.current) {
      asignacionCreadaRef.current = true;
      crearAsignacion();
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [formData, actualizarFormData, onCancelar, userData.tipo_usuario]);

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

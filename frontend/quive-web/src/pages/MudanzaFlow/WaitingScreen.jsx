import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const WaitingScreen = ({ onCancelar, actualizarFormData, formData, userData }) => {
  useEffect(() => {
    let pollingInterval;

    const crearAsignacion = async () => {
      try {
        const bodyAsignacion = {
          id_solicitud: formData.id_solicitud,
          id_transportista: formData.conductor.id_transportista,
          precio: formData.conductor.precio,
        };

        console.log("Cuerpo de la asignación:", bodyAsignacion);
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
    console.log("Iniciando monitoreo para asignación:", userData);
    const iniciarMonitoreo = (id_asignacion) => {
      
      pollingInterval = setInterval(async () => {
        try {
          const response = await fetch(
            `http://127.0.0.1:5000/asignaciones/${userData.formularioMudanza.asignacion.id_asignacion}/${userData.tipo_usuario}`
          );
          const asignaciones = await response.json();

          const miAsignacion = asignaciones.find(
            (a) => a.id_asignacion === id_asignacion
          );

          if (!miAsignacion) return;

          if (miAsignacion.estado === "rechazado") {
            clearInterval(pollingInterval);
            actualizarFormData({ conductor: null, asignacion: null });
            onCancelar(); // vuelve a paso 3
          }

          if (miAsignacion.estado === "confirmado") {
            clearInterval(pollingInterval);
            actualizarFormData({
              asignacion: {
                id_asignacion: miAsignacion.id_asignacion,
                estado: "confirmado",
              },
            });
            // paso 5 automáticamente
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

    if (!formData.asignacion?.id_asignacion) {
      crearAsignacion();
    } else {
      iniciarMonitoreo(formData.asignacion.id_asignacion);
    }

    return () => {
      clearInterval(pollingInterval);
    };
  }, [formData, actualizarFormData, onCancelar]);

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

import React from 'react';
import ListaConductores from './ListaConductores';
import WaitingScreen from './WaitingScreen';

const PrincipalSelector = ({ formData, seleccionarConductor, nextStep, actualizarFormData, setCurrentStep, userData }) => {
  const eliminarAsignacion = async (id_asignacion) => {
    console.log("Eliminando asignación:", id_asignacion);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/asignaciones/${id_asignacion}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Respuesta del servidor:", result.mensaje);
        actualizarFormData({ conductor: null, asignacion: null });
      } else if (response.status === 404) {
        const error = await response.json();
        console.warn("No encontrada:", error.msg);
      } else {
        // Otro error inesperado
        const error = await response.text();
        console.error("Error al eliminar:", error);
      }
    } catch (err) {
      console.error("Error de red o servidor:", err);
    }
  };
  
  const handleCancelar = () => {
    if (formData.asignacion && formData.asignacion.id_asignacion) {
      eliminarAsignacion(formData.asignacion.id_asignacion);
    }
    setCurrentStep(3);
  };

  return (
    <>
      {!formData.conductor
        ? <ListaConductores
            formData={formData}
            seleccionarConductor={seleccionarConductor}
            nextStep={nextStep}
          />
        : <WaitingScreen 
            onCancelar={handleCancelar}
            actualizarFormData={actualizarFormData}
            formData={formData}
            userData={userData} />
      }
    </>
  );
};

export default PrincipalSelector;
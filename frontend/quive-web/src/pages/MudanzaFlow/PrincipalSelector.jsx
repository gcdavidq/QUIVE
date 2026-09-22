import React, { useEffect, useRef } from 'react';
import ListaConductores from './ListaConductores';
import WaitingScreen from './WaitingScreen';
import API_URL, { apiFetch } from '../../api'; 

const PrincipalSelector = ({ formData, seleccionarConductor, nextStep, actualizarFormData, prevStep, userData, handleCancelar }) => {
  const asignacionEnviada = useRef(false);
  const crearAsignacion = async () => {
    if (!formData.conductor || formData.asignacion?.id_asignacion || asignacionEnviada.current) return;

    asignacionEnviada.current = true;

    try {
      const bodyAsignacion = {
        id_solicitud: formData.id_solicitud,
        id_transportista: formData.conductor.id_transportista,
        // El precio lo fija el servidor a partir de la tarifa del transportista.
      };

      const response = await apiFetch(`${API_URL}/asignaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyAsignacion),
      });

      if (!response.ok) throw new Error("Error al crear la asignación");

      const resultado = await response.json();

      if (actualizarFormData && resultado.id_asignacion) {
        actualizarFormData({
          conductor: { ...formData.conductor, precio: resultado.precio },
          asignacion: {
            id_asignacion: resultado.id_asignacion,
            estado: resultado.estado,
          },
        });
      }
    } catch (error) {
      console.error("Error en la solicitud de asignación:", error);
      asignacionEnviada.current = false;
      alert("Hubo un error al crear la asignación.");
      handleCancelar();
    }
  };

  useEffect(() => {
    if (formData.conductor && !formData.asignacion?.id_asignacion) {
      crearAsignacion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.conductor, formData.asignacion?.id_asignacion]);

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
            userData={userData}
            nextStep={nextStep} />
      }
    </>
  );
};

export default PrincipalSelector;

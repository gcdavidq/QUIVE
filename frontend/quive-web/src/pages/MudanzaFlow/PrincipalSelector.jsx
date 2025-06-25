import React, { useRef } from 'react';
import ListaConductores from './ListaConductores';
import WaitingScreen from './WaitingScreen';

const PrincipalSelector = ({ formData, seleccionarConductor, nextStep, actualizarFormData, prevStep, userData, handleCancelar }) => {
  const asignacionEnviada = useRef(false);
  const crearAsignacion = async () => {
    if (!formData.conductor || formData.asignacion?.id_asignacion || asignacionEnviada.current) return;

    asignacionEnviada.current = true;

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
      }
    } catch (error) {
      console.error("Error en la solicitud de asignación:", error);
      alert("Hubo un error al crear la asignación.");
      handleCancelar();
    }
  };

if (formData.conductor && !formData.asignacion?.id_asignacion) {
      crearAsignacion();
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
            userData={userData}
            nextStep={nextStep} />
      }
    </>
  );
};

export default PrincipalSelector;

import React from 'react';
import ListaConductores from './ListaConductores';
import WaitingScreen from './WaitingScreen';

const PrincipalSelector = ({ formData, seleccionarConductor, nextStep, actualizarFormData, setCurrentStep, userData }) => {
  const handleCancelar = () => {
    actualizarFormData({ conductor: null });
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
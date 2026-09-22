import React from 'react';
import CodigoVerificacion from '../CodigoVerificacion';

const Paso2VerificacionCorreo = ({ email, setCurrentStep }) => {
  return (
    <CodigoVerificacion
      email={email}
      onVerificado={() => setCurrentStep(3)}
      onReintentar={() => setCurrentStep(1)}
    />
  );
};

export default Paso2VerificacionCorreo;

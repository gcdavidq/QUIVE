import React from 'react';
import CodigoVerificacion from '../CodigoVerificacion';

const Paso2VerificacionCorreo = ({ email, codigoGenerado, setCurrentStep }) => {
  return (
    <CodigoVerificacion
      email={email}
      codigoGenerado={codigoGenerado}
      onVerificado={() => setCurrentStep(3)}
      onReintentar={() => setCurrentStep(1)}
    />
  );
};

export default Paso2VerificacionCorreo;

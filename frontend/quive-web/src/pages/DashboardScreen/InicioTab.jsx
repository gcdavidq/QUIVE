import React from 'react';
import InicioCliente from './cliente/InicioCliente';
import InicioTransportista from './transportista/InicioTransportista';

// Antes un solo componente de 600 líneas resolvía ambos roles con ternarios en cada texto,
// cifra y botón. Cada rol tiene ahora su panel; lo común vive en compartido/InicioPartes.
const InicioTab = ({ userData, setActiveTab }) => (
  userData?.tipo_usuario === 'transportista'
    ? <InicioTransportista userData={userData} setActiveTab={setActiveTab} />
    : <InicioCliente userData={userData} setActiveTab={setActiveTab} />
);

export default InicioTab;

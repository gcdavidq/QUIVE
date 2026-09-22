import React from 'react';
import MudanzasCliente from './cliente/MudanzasCliente';
import BandejaTransportista from './transportista/BandejaTransportista';

// Esta pantalla mezclaba en un solo componente la lista del cliente y la bandeja del
// transportista (con su modal de cobro), y además detectaba el rol con
// tipo_usuario === 'conductor', valor que no existe: los rótulos salían invertidos.
// Ahora solo enruta; cada rol tiene su propia pantalla.
const PedidosTab = ({ userData, setActiveTab }) => (
  userData?.tipo_usuario === 'transportista'
    ? <BandejaTransportista userData={userData} setActiveTab={setActiveTab} />
    : <MudanzasCliente userData={userData} setActiveTab={setActiveTab} />
);

export default PedidosTab;

import React, { useState } from 'react';
import {Home, Package, Navigation, User} from 'lucide-react';

import InicioTabTransportista from './DashboardScreenTransportista/InicioTabTransportista';
import PedidosTabTransportista from './DashboardScreenTransportista/PedidosTabTransportista';
import SeguimientoTabTransportista from './DashboardScreenTransportista/SeguimientoTabTransportista';
import PerfilTabTransportista from './DashboardScreenTransportista/PerfilTabTransportista';

const DashboardScreen = ({ userData, onNavigate, userType, setUserData }) => {
    const [activeTab, setActiveTab] = useState('inicio');

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <InicioTabTransportista userData={userData} 
        userType={userType} />;
      case 'pedidos':
        return <PedidosTabTransportista userType={userType} userData={userData}
         />;
      case 'seguimiento':
        return <SeguimientoTabTransportista />;
      case 'perfil':
        return <PerfilTabTransportista userData={userData} onNavigate={onNavigate} setUserData={setUserData}/>;
      default:
        return <InicioTabTransportista userData={userData} userType={userType} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">QUIVE</div>
        <div className="flex space-x-4">
          <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <User size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-2">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'inicio' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            } rounded-lg transition-colors`}
          >
            <Home size={24} />
            <span className="text-xs mt-1 font-semibold">INICIO</span>
          </button>
          
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'pedidos' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            } rounded-lg transition-colors`}
          >
            <Package size={24} />
            <span className="text-xs mt-1 font-semibold">PEDIDOS</span>
          </button>
          
          <button
            onClick={() => setActiveTab('seguimiento')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'seguimiento' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            } rounded-lg transition-colors`}
          >
            <Navigation size={24} />
            <span className="text-xs mt-1 font-semibold">SEGUIMIENTO</span>
          </button>
          
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'perfil' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            } rounded-lg transition-colors`}
          >
            <User size={24} />
            <span className="text-xs mt-1 font-semibold">PERFIL</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen; // Exporta el componente DashboardScreen para su uso en otros archivos
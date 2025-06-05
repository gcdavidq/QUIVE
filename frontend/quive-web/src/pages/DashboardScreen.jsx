import React from 'react';
import { Home, Package, Navigation, User } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

import InicioTab from './DashboardScreen/InicioTab';
import PedidosTab from './DashboardScreen/PedidosTab';
import SeguimientoTab from './DashboardScreen/SeguimientoTab';
import PerfilTab from './DashboardScreen/PerfilTab';
import MudanzaFlow from './MudanzaFlow';

const DashboardScreen = ({ userData, onNavigate, userType, setUserData}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.split('/')[2] || 'inicio';

  const handleTabChange = (tab) => {
    navigate(`/dashboard/${tab}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">QUIVE</div>
        <div className="flex space-x-4">
          <button  
            onClick={() => handleTabChange('perfil')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'perfil' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            } rounded-lg transition-colors`}
          >
            <User size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/dashboard/inicio" replace />}
          />
          <Route
            path="inicio"
            element={
              <InicioTab
                userData={userData}
                setActiveTab={handleTabChange}
                onNavigate={onNavigate}
                userType={userType}
              />
            }
          />
          <Route
            path="pedidos"
            element={
              <PedidosTab userType={userType} userData={userData} />
            }
          />
          <Route path="seguimiento" element={<SeguimientoTab />} />
          <Route
            path="perfil/*"
            element={
              <PerfilTab 
                userData={userData} 
                onNavigate={onNavigate}
                setUserData={setUserData}
                setActiveTab={handleTabChange}// esto navega en el dashboard general
              />
            }
          />
          <Route
            path="mudanza"
            element={
              <MudanzaFlow
                userData={userData}
                onNavigate={onNavigate}
                setActiveTab={handleTabChange}
              />
            }
          />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-2">
          <button
            onClick={() => handleTabChange('inicio')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'inicio' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            } rounded-lg transition-colors`}
          >
            <Home size={24} />
            <span className="text-xs mt-1 font-semibold">INICIO</span>
          </button>

          <button
            onClick={() => handleTabChange('pedidos')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'pedidos' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            } rounded-lg transition-colors`}
          >
            <Package size={24} />
            <span className="text-xs mt-1 font-semibold">PEDIDOS</span>
          </button>

          <button
            onClick={() => handleTabChange('seguimiento')}
            className={`flex flex-col items-center py-3 px-4 ${
              activeTab === 'seguimiento' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            } rounded-lg transition-colors`}
          >
            <Navigation size={24} />
            <span className="text-xs mt-1 font-semibold">SEGUIMIENTO</span>
          </button>

          <button
            onClick={() => handleTabChange('perfil')}
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

export default DashboardScreen;

import React, { useEffect, useState } from 'react';
import { Home, Package, Navigation, User, Bell } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';

import InicioTab from './DashboardScreen/InicioTab';
import PedidosTab from './DashboardScreen/PedidosTab';
import SeguimientoTab from './DashboardScreen/SeguimientoTab';
import PerfilTab from './DashboardScreen/PerfilTab';
import MudanzaFlow from './MudanzaFlow';
import Notificaciones from './DashboardScreen/Notificaciones';

const DashboardScreen = ({ userData, onNavigate, setUserData}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

  const activeTab = location.pathname.split('/')[2] || 'inicio';

  // Obtener el conteo de notificaciones no leídas
  useEffect(() => {
    if (!userData?.id_usuario) return;
    
    const obtenerNotificacionesNoLeidas = () => {
      axios
        .get(`http://localhost:5000/notificaciones/${userData.id_usuario}`)
        .then((res) => {
          const noLeidas = res.data.filter(n => !n.leido).length;
          setNotificacionesNoLeidas(noLeidas);
        })
        .catch((err) => console.error("Error al obtener notificaciones:", err));
    };

    obtenerNotificacionesNoLeidas();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(obtenerNotificacionesNoLeidas, 30000);
    
    return () => clearInterval(interval);
  }, [userData]);

  // Actualizar contador cuando se marque una notificación como leída
  useEffect(() => {
    if (activeTab !== 'notificaciones') return;
    
    // Cuando salimos de la pestaña de notificaciones, actualizamos el contador
    const handleRouteChange = () => {
      if (userData?.id_usuario) {
        axios
          .get(`http://localhost:5000/notificaciones/${userData.id_usuario}`)
          .then((res) => {
            const noLeidas = res.data.filter(n => !n.leido).length;
            setNotificacionesNoLeidas(noLeidas);
          })
          .catch((err) => console.error("Error al obtener notificaciones:", err));
      }
    };

    // Pequeño delay para asegurar que el estado se actualice
    const timer = setTimeout(handleRouteChange, 100);
    return () => clearTimeout(timer);
  }, [activeTab, userData]);

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
            onClick={() => handleTabChange('notificaciones')}
            className={`relative flex flex-col items-center py-3 px-4 ${
              activeTab === 'notificaciones' ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
            } rounded-lg transition-colors`}
          >
            <Bell size={24} />
            {/* Indicador de notificaciones no leídas */}
            {notificacionesNoLeidas > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {notificacionesNoLeidas > 99 ? '99+' : notificacionesNoLeidas}
              </div>
            )}
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
              />
            }
          />
          <Route
            path="pedidos"
            element={
              <PedidosTab 
                userData={userData}
                setActiveTab={handleTabChange} 
              />
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
              />
            }
          />
          <Route
            path="mudanza"
            element={
              <MudanzaFlow
                userData={userData}
                setUserData={setUserData}
                onNavigate={onNavigate}
                setActiveTab={handleTabChange}
              />
            }
          />
          <Route
            path="notificaciones"
            element={
              <Notificaciones
                userData={userData}
                setUserData={setUserData}
                onNavigate={onNavigate}
                // Callback para actualizar el contador cuando se marque como leída
                onNotificacionLeida={() => {
                  setNotificacionesNoLeidas(prev => Math.max(0, prev - 1));
                }}
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
import React, { useEffect, useState } from 'react';
import { Home, Package, Navigation, User, Bell } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

import InicioTab from './DashboardScreen/InicioTab';
import PedidosTab from './DashboardScreen/PedidosTab';
import SeguimientoTab from './DashboardScreen/SeguimientoTab';
import PerfilTab from './DashboardScreen/PerfilTab';
import MudanzaFlow from './MudanzaFlow';
import Notificaciones from './DashboardScreen/Notificaciones';

const DashboardScreen = ({ userData, onNavigate, setUserData }) => {
  console.log('userData en DashboardScreen:', userData);
  const navigate = useNavigate();
  const location = useLocation();
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [isHorizontal, setIsHorizontal] = useState(window.innerWidth > 768);

  const activeTab = location.pathname.split('/')[2] || 'inicio';

  useEffect(() => {
    const handleResize = () => setIsHorizontal(window.innerWidth > 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!userData?.id_usuario) return;
    const obtenerNotificacionesNoLeidas = () => {
      axios
        .get(`${API_URL}/notificaciones/${userData.id_usuario}`)
        .then((res) => {
          const noLeidas = res.data.filter(n => !n.leido).length;
          setNotificacionesNoLeidas(noLeidas);
        })
        .catch((err) => console.error("Error al obtener notificaciones:", err));
    };
    obtenerNotificacionesNoLeidas();
    const interval = setInterval(obtenerNotificacionesNoLeidas, 30000);
    return () => clearInterval(interval);
  }, [userData]);

  useEffect(() => {
    if (activeTab !== 'notificaciones') return;
    const timer = setTimeout(() => {
      if (userData?.id_usuario) {
        axios
          .get(`${API_URL}/notificaciones/${userData.id_usuario}`)
          .then((res) => {
            const noLeidas = res.data.filter(n => !n.leido).length;
            setNotificacionesNoLeidas(noLeidas);
          })
          .catch((err) => console.error("Error al obtener notificaciones:", err));
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [activeTab, userData]);

  const handleTabChange = (tab) => navigate(`/dashboard/${tab}`);

  const NavigationItem = ({ icon: Icon, label, tabKey, showBadge = false, badgeCount = 0, className = '' }) => (
    <button
      onClick={() => handleTabChange(tabKey)}
      className={`navigation-button ${activeTab === tabKey ? 'active' : ''} ${className}`}
    >
      <Icon size={24} />
      <span className="navigation-label">{label}</span>
      {showBadge && badgeCount > 0 && (
        <div className="notification-badge">
          {badgeCount > 99 ? '99+' : badgeCount}
        </div>
      )}
    </button>
  );

  const routes = (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/inicio" replace />} />
      <Route path="inicio" element={<InicioTab userData={userData} setActiveTab={handleTabChange} onNavigate={onNavigate} />} />
      <Route path="pedidos" element={<PedidosTab userData={userData} setActiveTab={handleTabChange} />} />
      <Route path="seguimiento" element={<SeguimientoTab />} />
      <Route path="perfil/*" element={<PerfilTab userData={userData} onNavigate={onNavigate} setUserData={setUserData} />} />
      <Route path="mudanza" element={
        <MudanzaFlow 
        userData={userData} 
        setUserData={setUserData} 
        onNavigate={onNavigate} 
        setActiveTab={handleTabChange} 
      />} />
      <Route path="notificaciones" element={
        <Notificaciones
          userData={userData}
          setUserData={setUserData}
          onNavigate={onNavigate}
          onNotificacionLeida={() => setNotificacionesNoLeidas(prev => Math.max(0, prev - 1))}
        />
      } />
    </Routes>
  );

  if (isHorizontal) {
    return (
      <div className="dashboard-container theme-bg-primary">
        <aside className="fixed top-0 left-0 h-screen w-[250px] theme-card z-40">
          <div className="sidebar-header">
            <div className="sidebar-title">QUIVE</div>
          </div>
          <nav className="sidebar-nav">
            <NavigationItem icon={Home} label="INICIO" tabKey="inicio" />
            <NavigationItem icon={Package} label="PEDIDOS" tabKey="pedidos" />
            <NavigationItem icon={Navigation} label="SEGUIMIENTO" tabKey="seguimiento" />
            <NavigationItem icon={User} label="PERFIL" tabKey="perfil" />
            <NavigationItem icon={Bell} label="NOTIFICACIONES" tabKey="notificaciones" showBadge badgeCount={notificacionesNoLeidas} />
          </nav>
        </aside>

        <main className="ml-[250px] flex-1">
          <header className="sticky top-0 z-[100] dashboard-header theme-card">
            <div className="header-title">Dashboard</div>
            <div className="header-user">{userData?.tipo_usuario}</div>
          </header>

          <section className="dashboard-content relative">
            {routes}
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-mobile theme-bg-primary">
      <header className="mobile-header theme-card">
        <div className="sidebar-title">QUIVE</div>
        <NavigationItem
          icon={Bell}
          label=""
          tabKey="notificaciones"
          showBadge={true}
          badgeCount={notificacionesNoLeidas}
          className="mobile-notification-btn"
        />
      </header>

      <main className="dashboard-mobile-content pb-20">{routes}</main>
      
      <nav className="bottom-nav theme-card fixed bottom-0 left-0 right-0 z-[100]">
        <NavigationItem icon={Home} label="INICIO" tabKey="inicio" />
        <NavigationItem icon={Package} label="PEDIDOS" tabKey="pedidos" />
        <NavigationItem icon={Navigation} label="SEGUIMIENTO" tabKey="seguimiento" />
        <NavigationItem icon={User} label="PERFIL" tabKey="perfil" />
      </nav>
    </div>
  );
};

export default DashboardScreen;
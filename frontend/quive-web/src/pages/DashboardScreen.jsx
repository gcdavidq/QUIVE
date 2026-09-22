import React, { useEffect, useState, useMemo } from 'react';
import { 
  Home, 
  Package, 
  Navigation, 
  User, 
  Bell, 
  Boxes, 
  Plus, 
  LogOut, 
  Sun, 
  Moon, 
  Menu,
  X,
  Truck
} from 'lucide-react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { useTheme } from '../ThemeContext';

import InicioTab from './DashboardScreen/InicioTab';
import PedidosTab from './DashboardScreen/PedidosTab';
import SeguimientoTab from './DashboardScreen/SeguimientoTab';
import PerfilTab from './DashboardScreen/PerfilTab';
import MudanzaFlow from './MudanzaFlow';
import Notificaciones from './DashboardScreen/Notificaciones';

const tabMetaComun = {
  seguimiento: { eyebrow: "Seguimiento", title: "Ruta y GPS", desc: "Traslado en curso o próximo servicio confirmado." },
  notificaciones: { eyebrow: "Comunicación", title: "Notificaciones", desc: "Avisos generados por los cambios de estado de tus servicios." },
};

const tabMetaPorRol = {
  cliente: {
    ...tabMetaComun,
    inicio: { eyebrow: "Panel del cliente", desc: "Resumen de tus solicitudes de mudanza." },
    pedidos: { eyebrow: "Mis solicitudes", title: "Mis mudanzas", desc: "Estado de cada mudanza que registraste." },
    mudanza: { eyebrow: "Planificación", title: "Nueva mudanza", desc: "Ruta, objetos, transportista y pago." },
    perfil: { eyebrow: "Cuenta", title: "Mi perfil", desc: "Tus datos, direcciones y métodos de pago." },
  },
  transportista: {
    ...tabMetaComun,
    inicio: { eyebrow: "Panel del transportista", desc: "Resumen de las solicitudes que te asignaron." },
    pedidos: { eyebrow: "Bandeja operativa", title: "Solicitudes asignadas", desc: "Acepta, ejecuta y cierra cada traslado." },
    perfil: { eyebrow: "Cuenta", title: "Mi perfil", desc: "Tus datos, vehículo, documentos y métodos de cobro." },
  },
};

const DashboardScreen = ({ userData, onNavigate, setUserData, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme, setThemePreference } = useTheme();

  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTab = useMemo(() => {
    const segment = location.pathname.split('/')[2] || 'inicio';
    return segment.startsWith('perfil') ? 'perfil' : segment;
  }, [location.pathname]);


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

  const handleTabChange = (tab) => {
    navigate(`/dashboard/${tab}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    onNavigate('/');
  };

  // Iniciales para el avatar
  const initials = useMemo(() => {
    const name = userData?.nombre_completo || '';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [userData]);

  const isDriver = userData?.tipo_usuario === 'transportista';
  const tabMeta = tabMetaPorRol[isDriver ? 'transportista' : 'cliente'];
  const currentMeta = tabMeta[activeTab] || tabMeta.inicio;

  const navGroups = useMemo(() => [
    {
      label: "Workspace",
      items: isDriver ? [
        { key: "inicio", label: "Resumen", icon: Home },
        { key: "pedidos", label: "Bandeja de Pedidos", icon: Package },
        { key: "perfil/vehiculo", label: "Mi Vehículo", icon: Truck },
        { key: "seguimiento", label: "Rutas & GPS", icon: Navigation, live: true },
      ] : [
        { key: "inicio", label: "Resumen", icon: Home },
        { key: "pedidos", label: "Mis Mudanzas", icon: Package },
        { key: "mudanza", label: "Nueva Mudanza", icon: Boxes, highlight: true },
        { key: "seguimiento", label: "Rutas & GPS", icon: Navigation, live: true },
      ],
    },
    {
      label: "Cuenta & Gestión",
      items: [
        { key: "notificaciones", label: "Notificaciones", icon: Bell, badgeCount: notificacionesNoLeidas },
        { key: "perfil", label: "Mi Perfil", icon: User },
      ],
    },
  ], [isDriver, notificacionesNoLeidas]);

  const routes = (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard/inicio" replace />} />
      <Route path="inicio" element={<InicioTab userData={userData} setActiveTab={handleTabChange} onNavigate={onNavigate} />} />
      <Route path="pedidos" element={<PedidosTab userData={userData} setActiveTab={handleTabChange} />} />
      <Route path="seguimiento" element={<SeguimientoTab userData={userData} setActiveTab={handleTabChange} />} />
      <Route path="perfil/*" element={<PerfilTab userData={userData} onNavigate={onNavigate} setUserData={setUserData} onLogout={onLogout} />} />
      <Route path="mudanza" element={
        isDriver ? (
          <Navigate to="/dashboard/pedidos" replace />
        ) : (
          <MudanzaFlow 
            userData={userData} 
            setUserData={setUserData} 
            onNavigate={onNavigate} 
            setActiveTab={handleTabChange} 
          />
        )
      } />
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

  return (
    <div className="min-h-screen bg-[#f7faff] dark:bg-[#0b1523] text-[#16365f] dark:text-[#f0f6fc] flex flex-col lg:flex-row transition-colors duration-200">
      
      {/* SIDEBAR DESKTOP estilo MoveFlow */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-[260px] flex-col border-r border-[#e2ebf5] dark:border-[#1d314d] bg-white dark:bg-[#0e1b2c] px-5 py-6">
        {/* Brand Header */}
        <div className="px-2 flex items-center gap-3 cursor-pointer" onClick={() => handleTabChange('inicio')}>
          <div className="brand-mark">
            <span className="brand-mark-shape" />
            <span className="brand-mark-dot" />
          </div>
          <div className="leading-tight">
            <span className="block font-display text-[18px] font-extrabold tracking-tight text-[#102c53] dark:text-white">
              QUIVE<span className="text-[#4d93f5]">.</span>
            </span>
            <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#8ea6c5]">
              Logística simple
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="mt-8 flex-1 space-y-7 overflow-y-auto pr-1">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9bb0c9] dark:text-[#6782a4]">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleTabChange(item.key)}
                      className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} className={isActive ? 'text-[#4d93f5]' : 'text-[#8aa0ba]'} />
                      <span className="flex-1 text-left">{item.label}</span>
                      
                      {item.live && (
                        <span className="live-pill">
                          <span className="live-dot" /> LIVE
                        </span>
                      )}

                      {Boolean(item.badgeCount && item.badgeCount > 0) && (
                        <span className="ml-auto rounded-full bg-[#e8f2ff] dark:bg-[#1b3658] text-[#3e85e9] dark:text-[#7bb0f8] px-2 py-0.5 text-[10px] font-bold">
                          {item.badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Rol real de la sesión (y distintivo de cuenta demo) */}
        <div className="rounded-2xl bg-[#f4f8fc] dark:bg-[#132338] border border-[#e5eef7] dark:border-[#1e3450] p-3.5 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#8ea6c2]">Rol</span>
            {userData?.es_demo && (
              <span className="status-pill status-orange !text-[9px] !py-0.5">CUENTA DEMO</span>
            )}
          </div>
          <p className="mt-1 text-xs font-bold text-[#1a385f] dark:text-[#e0edfc] capitalize">
            {userData?.tipo_usuario}
          </p>
        </div>

        {/* User Card Footer */}
        <div className="pt-3 border-t border-[#edf2f7] dark:border-[#1b2f47] flex items-center gap-3">
          <div className="avatar stat-blue text-[#4d93f5] font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-xs font-bold text-[#16365f] dark:text-white">
              {userData?.nombre_completo}
            </p>
            <p className="truncate text-[10px] text-[#8ea6c2]">
              {userData?.email}
            </p>
          </div>
          <button 
            onClick={handleLogout}
            title="Cerrar sesión"
            className="text-[#9bb0c9] hover:text-red-500 transition-colors p-1"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* HEADER MÓVIL */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-[#e2ebf5] dark:border-[#1e334e] bg-white dark:bg-[#0e1b2c] px-5 py-3.5 backdrop-blur">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="icon-button h-9 w-9"
          aria-label="Abrir menú"
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2" onClick={() => handleTabChange('inicio')}>
          <div className="brand-mark h-7 w-7 !rounded-lg">
            <span className="brand-mark-shape !h-3 !w-3 !top-1.5 !left-1.5" />
            <span className="brand-mark-dot !h-1 !w-1 !bottom-1.5 !left-1.5" />
          </div>
          <span className="font-display font-extrabold text-base text-[#102c53] dark:text-white">QUIVE</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="icon-button h-8 w-8"
          >
            {resolvedTheme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>
          <button 
            onClick={() => handleTabChange('notificaciones')} 
            className="icon-button relative h-8 w-8"
          >
            <Bell size={15} />
            {notificacionesNoLeidas > 0 && <span className="notification-dot" />}
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 lg:pl-[260px] flex flex-col min-w-0">
        
        {/* HEADER SUPERIOR DESKTOP estilo MoveFlow */}
        <header className="hidden lg:flex items-center justify-between border-b border-[#e5edf7] dark:border-[#1a2c42] bg-[#fbfdff] dark:bg-[#0e1b2b] px-8 py-5 transition-colors">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold text-[#8ea6c3]">
              <span>Workspace</span>
              <span className="text-[#c7d5e4] dark:text-[#385172]">/</span>
              <span className="text-[#4574a4] dark:text-[#7ba9dc] font-bold">{currentMeta.eyebrow}</span>
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-[#102c53] dark:text-white">
              {activeTab === 'inicio' ? `¡Hola, ${(userData?.nombre_completo || '').split(' ')[0]}!` : currentMeta.title}
              <span className="text-[#4d93f5]">.</span>
            </h1>
            <p className="mt-0.5 text-xs text-[#8098b3] dark:text-[#8ba2be]">
              {currentMeta.desc}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme switch */}
            <button
              onClick={() => setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="icon-button h-9 w-9 shadow-sm"
              aria-label="Cambiar tema"
            >
              {resolvedTheme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            {/* Bell button */}
            <button 
              onClick={() => handleTabChange('notificaciones')} 
              className="icon-button relative h-9 w-9 shadow-sm"
            >
              <Bell size={16} />
              {notificacionesNoLeidas > 0 && <span className="notification-dot" />}
            </button>

            {/* Main Action Button */}
            <button 
              onClick={() => handleTabChange(isDriver ? 'pedidos' : 'mudanza')}
              className="primary-button text-xs !py-2.5 !px-4"
            >
              {isDriver ? <Package size={15} strokeWidth={2.5} /> : <Plus size={15} strokeWidth={2.5} />}
              <span>{isDriver ? 'Ver solicitudes' : 'Solicitar mudanza'}</span>
            </button>
          </div>
        </header>

        {/* CUERPO DEL TAB SELECCIONADO */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {routes}
        </main>
      </div>

      {/* DRAWER MÓVIL estilo MoveFlow */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-[#0c1f36]/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="h-full w-[280px] bg-white dark:bg-[#0e1b2c] p-6 shadow-2xl flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2.5">
                  <div className="brand-mark h-7 w-7 !rounded-lg">
                    <span className="brand-mark-shape !h-3 !w-3 !top-1.5 !left-1.5" />
                    <span className="brand-mark-dot !h-1 !w-1 !bottom-1.5 !left-1.5" />
                  </div>
                  <span className="font-display font-bold text-lg text-[#102c53] dark:text-white">QUIVE</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="icon-button h-8 w-8">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9bb0c9]">
                      {group.label}
                    </div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.key;
                        return (
                          <button
                            key={item.key}
                            onClick={() => handleTabChange(item.key)}
                            className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                          >
                            <Icon size={18} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#edf2f7] dark:border-[#1e3450] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="avatar avatar-small stat-blue font-bold">{initials}</div>
                <span className="text-xs font-bold truncate max-w-[120px]">{userData?.nombre_completo}</span>
              </div>
              <button onClick={handleLogout} className="text-red-500 text-xs font-bold">
                Salir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV MÓVIL */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#0e1b2c]/95 backdrop-blur border-t border-[#e2ebf5] dark:border-[#1e334e] px-4 py-2 flex items-center justify-around">
        <button 
          onClick={() => handleTabChange('inicio')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 ${activeTab === 'inicio' ? 'text-[#4d93f5]' : 'text-[#8da3bd]'}`}
        >
          <Home size={18} />
          <span>Inicio</span>
        </button>
        <button 
          onClick={() => handleTabChange('pedidos')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 ${activeTab === 'pedidos' ? 'text-[#4d93f5]' : 'text-[#8da3bd]'}`}
        >
          <Package size={18} />
          <span>{isDriver ? 'Bandeja' : 'Mudanzas'}</span>
        </button>
        {isDriver ? (
          <button 
            onClick={() => handleTabChange('perfil/vehiculo')}
            className="flex flex-col items-center gap-1 -mt-5"
          >
            <div className="h-11 w-11 rounded-full bg-[#4d93f5] text-white shadow-lg flex items-center justify-center">
              <Truck size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold text-[#4d93f5]">Unidad</span>
          </button>
        ) : (
          <button 
            onClick={() => handleTabChange('mudanza')}
            className="flex flex-col items-center gap-1 -mt-5"
          >
            <div className="h-11 w-11 rounded-full bg-[#4d93f5] text-white shadow-lg flex items-center justify-center">
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold text-[#4d93f5]">Mudar</span>
          </button>
        )}
        <button 
          onClick={() => handleTabChange('seguimiento')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 ${activeTab === 'seguimiento' ? 'text-[#4d93f5]' : 'text-[#8da3bd]'}`}
        >
          <Navigation size={18} />
          <span>GPS</span>
        </button>
        <button 
          onClick={() => handleTabChange('perfil')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold p-1 ${activeTab === 'perfil' ? 'text-[#4d93f5]' : 'text-[#8da3bd]'}`}
        >
          <User size={18} />
          <span>Perfil</span>
        </button>
      </nav>

    </div>
  );
};

export default DashboardScreen;
import React from 'react';
import { useNavigate, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { 
  MapPin, 
  CreditCard, 
  Clock, 
  Settings, 
  HelpCircle, 
  Truck, 
  LogOut, 
  ChevronRight, 
  Edit3
} from 'lucide-react';
import EditarPerfilTab from './Perfilopcions/EditarPerfilTab';
import MisDirecciones from './Perfilopcions/MisDirecciones';
import MetodosPago from './Perfilopcions/MetodosPago';
import HistorialMudanzas from './Perfilopcions/HistorialMudanzas';
import Configuracion from './Perfilopcions/Configuracion';
import AyudaSoporte from './Perfilopcions/AyudaSoporte';
import MiVehiculoTab from './Perfilopcions/MiVehiculoTab';
import SubirImagen from '../utils/SubirImagen';

const PerfilTab = ({ userData, setUserData, onLogout, onNavigate }) => {
  const navigate = useNavigate();
  const isDriver = userData?.tipo_usuario === 'transportista';

  const menuOptions = isDriver ? [
    { 
            label: "Mi vehículo y documentos",
      desc: "Unidad registrada y estado de verificación",  
      route: "vehiculo", 
      icon: Truck, 
      tone: "stat-blue" 
    },
    { 
            label: "Métodos de cobro",
      desc: "Tarjeta, Yape o PayPal donde recibes tus pagos",  
      route: "pagos", 
      icon: CreditCard, 
      tone: "stat-peach" 
    },
    { 
      label: "Historial de Traslados", 
      desc: "Registro de servicios completados", 
      route: "historial", 
      icon: Clock, 
      tone: "stat-mint" 
    },
    { 
      label: "Configuración del Sistema", 
      desc: "Tema visual de la aplicación", 
      route: "configuracion", 
      icon: Settings, 
      tone: "stat-lilac" 
    },
    { 
      label: "Centro de Ayuda y Soporte", 
      desc: "Contacto y preguntas frecuentes", 
      route: "soporte", 
      icon: HelpCircle, 
      tone: "stat-blue" 
    },
  ] : [
    { 
      label: "Mis Direcciones Guardadas", 
      desc: "Punto de partida y ubicaciones frecuentes", 
      route: "direcciones", 
      icon: MapPin, 
      tone: "stat-blue" 
    },
    { 
      label: "Métodos de Pago", 
      desc: "Tarjeta, Yape o PayPal", 
      route: "pagos", 
      icon: CreditCard, 
      tone: "stat-peach" 
    },
    { 
      label: "Historial de Mudanzas", 
      desc: "Servicios finalizados", 
      route: "historial", 
      icon: Clock, 
      tone: "stat-mint" 
    },
    { 
      label: "Configuración del Sistema", 
      desc: "Tema visual de la aplicación", 
      route: "configuracion", 
      icon: Settings, 
      tone: "stat-lilac" 
    },
    { 
      label: "Centro de Ayuda y Soporte", 
      desc: "Contacto y preguntas frecuentes", 
      route: "soporte", 
      icon: HelpCircle, 
      tone: "stat-blue" 
    },
  ];

  const handleLogout = () => {
    onLogout();
    onNavigate('/');
  };

  return (
    <div className="space-y-6">
      <Routes>
        <Route
          path="/"
          element={
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Header */}
              <div className="surface-card p-6">
                <span className="section-kicker">GESTIÓN DE CUENTA</span>
                <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white mt-0.5">
                  Mi Perfil y Preferencias
                </h1>
                <p className="text-xs text-[#8da3bd] mt-1">
                  Administra tu información personal, credenciales y opciones de cuenta
                </p>
              </div>

              {/* Profile Card principal */}
              <div className="surface-card p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-900/50 shadow-md flex-shrink-0">
                      <SubirImagen
                        defaultPreview={userData?.foto_perfil_url}
                        editable={false}
                        imgClassName="w-20 h-20 rounded-2xl object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`status-pill ${isDriver ? 'status-blue' : 'status-green'} text-[10px] font-bold capitalize`}>
                          {userData?.tipo_usuario}
                        </span>
                        {userData?.es_demo && (
                          <span className="status-pill status-orange text-[10px] font-bold">CUENTA DEMO</span>
                        )}
                      </div>
                      <h2 className="font-display text-xl font-extrabold text-[#16365f] dark:text-white mt-1">
                        {userData?.nombre_completo}
                      </h2>
                      <p className="text-xs text-[#8da3bd] mt-0.5">
                        {userData?.email}
                      </p>
                      {userData?.telefono && (
                        <p className="text-xs font-semibold text-[#4d93f5] mt-1">
                          Tel: {userData.telefono}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('editar')}
                    className="primary-button text-xs !py-2.5 !px-5 flex items-center justify-center gap-2 self-start sm:self-auto shadow-md"
                  >
                    <Edit3 size={14} />
                    <span>Editar Perfil</span>
                  </button>
                </div>
              </div>

              {/* Menu de Opciones con MoveFlow Style */}
              <div className="surface-card rounded-2xl overflow-hidden divide-y divide-[var(--color-border)]">
                {menuOptions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.route}
                      onClick={() => navigate(item.route)}
                      className="w-full flex items-center justify-between p-5 hover:bg-[#f8faff] dark:hover:bg-[#112136] transition-colors text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`stat-icon ${item.tone} !h-10 !w-10 group-hover:scale-105 transition-transform`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[#16365f] dark:text-white group-hover:text-[#4d93f5] transition-colors">
                            {item.label}
                          </h4>
                          <p className="text-[11px] text-[#8da3bd] mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-[#8da3bd] group-hover:text-[#4d93f5] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>

              {/* Cerrar Sesión */}
              <div className="surface-card p-4 rounded-2xl">
                <button
                  onClick={handleLogout}
                  className="w-full p-3.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          }
        />

        <Route path="editar" element={<EditarPerfilTab userData={userData} setUserData={setUserData} />} />
        <Route path="direcciones" element={isDriver ? <Navigate to=".." replace /> : <MisDirecciones userData={userData} />} />
        <Route path="vehiculo" element={isDriver ? <MiVehiculoTab userData={userData} /> : <Navigate to=".." replace />} />
        <Route path="pagos" element={<MetodosPago userData={userData} />} />
        <Route path="historial" element={<HistorialMudanzas userData={userData} />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="soporte" element={<AyudaSoporte />} />
      </Routes>

      <Outlet />
    </div>
  );
};

export default PerfilTab;

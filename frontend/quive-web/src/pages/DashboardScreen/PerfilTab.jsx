import React from 'react';
import { useNavigate, Routes, Route, Outlet } from 'react-router-dom';
import EditarPerfilTab from './Perfilopcions/EditarPerfilTab';
import MisDirecciones from './Perfilopcions/MisDirecciones';
import MetodosPago from './Perfilopcions/MetodosPago';
import HistorialMudanzas from './Perfilopcions/HistorialMudanzas';
import Configuracion from './Perfilopcions/Configuracion';
import AyudaSoporte from './Perfilopcions/AyudaSoporte';
import SubirImagen from '../utils/SubirImagen';


const PerfilTab = ({ userData, onNavigate, setUserData}) => {
  const navigate = useNavigate();

  return (
    <div className="theme-bg-primary min-h-screen px-4 py-6">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h2 className="text-2xl font-bold theme-text-primary mb-6">Mi Perfil</h2>

              <div className="space-y-6">
                {/* Profile Info */}
                <div className="theme-card p-6 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 shadow-md">
                      <SubirImagen
                        defaultPreview={userData.foto_perfil_url}
                        editable={false}
                        imgClassName="w-16 h-16 rounded-full overflow-hidden border-2 shadow-md"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold theme-text-primary">
                        {userData.nombre_completo || 'Usuario'}
                      </h3>
                      <p className="theme-text-secondary">{userData.email || 'email@ejemplo.com'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('editar')}
                    className="w-full btn-primary py-3 rounded-lg"
                  >
                    Editar Perfil
                  </button>
                </div>

                {/* Menu Options */}
                <div className="theme-card rounded-lg shadow-sm">
                  <div className="divide-y theme-border">
                    {[
                      { label: "Mis Direcciones", route: "direcciones" },
                      { label: "Métodos de Pago", route: "pagos" },
                      { label: "Historial de Mudanzas", route: "historial" },
                      { label: "Configuración", route: "configuracion" },
                      { label: "Ayuda y Soporte", route: "soporte" },
                    ].map(({ label, route }) => (
                      <button
                        key={route}
                        onClick={() => navigate(route)}
                        className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className="theme-text-primary">{label}</span>
                        <span className="theme-text-secondary">›</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    localStorage.removeItem('userData');
                    setUserData({});
                    onNavigate('landing');
                  }}
                  className="w-full p-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-lg"
                >
                  Cerrar Sesión
                </button>
              </div>
            </>
          }
        />

        <Route path="editar" element={<EditarPerfilTab userData={userData} setUserData={setUserData} />} />
        <Route path="direcciones" element={<MisDirecciones />} />
        <Route path="pagos" element={<MetodosPago userData={userData} />} />
        <Route path="historial" element={<HistorialMudanzas />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="soporte" element={<AyudaSoporte />} />
      </Routes>

      <Outlet />
    </div>

  );
};

export default PerfilTab;

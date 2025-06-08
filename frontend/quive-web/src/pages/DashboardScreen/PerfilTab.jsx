import React from 'react';
import { useNavigate, Routes, Route, Outlet } from 'react-router-dom';
import EditarPerfilTab from './Perfilopcions/EditarPerfilTab';
import MisDirecciones from './Perfilopcions/MisDirecciones';
import MetodosPago from './Perfilopcions/MetodosPago';
import HistorialMudanzas from './Perfilopcions/HistorialMudanzas';
import Configuracion from './Perfilopcions/Configuracion';
import AyudaSoporte from './Perfilopcions/AyudaSoporte';
import ImagenPerfil from '../utils/ImagenPerfil';


const PerfilTab = ({ userData, onNavigate, setUserData}) => {
  const navigate = useNavigate();

  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h2 className="text-2xl font-bold text-blue-600 mb-6">Mi Perfil</h2>

              <div className="space-y-6">
                {/* Profile Info */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 shadow-md">
                      <ImagenPerfil fotoUrl={userData.foto_perfil_url} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{userData.nombre_completo || 'Usuario'}</h3>
                      <p className="text-gray-600">{userData.email || 'email@ejemplo.com'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('editar')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Editar Perfil
                  </button>
                </div>

                {/* Menu Options */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="divide-y divide-gray-100">
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
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-700">{label}</span>
                        <span className="text-gray-400">›</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logout */}
                  <button
                    onClick={() => {
                      // Limpiar localStorage
                      localStorage.removeItem('userData');
                      localStorage.removeItem('userType');

                      // Limpiar el estado
                      setUserData({});
                      
                      // Navegar a la pantalla de inicio
                      onNavigate('landing');
                    }}
                    className="w-full p-4 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                  >
                    Cerrar Sesión
                  </button>
              </div>
            </>
          }
        />

        <Route path="editar" element={<EditarPerfilTab userData={userData} setUserData={setUserData}/>} />
        <Route path="direcciones" element={<MisDirecciones />} />
        <Route path="pagos" element={<MetodosPago />} />
        <Route path="historial" element={<HistorialMudanzas />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="soporte" element={<AyudaSoporte />} />
      </Routes>

      {/* Mostrar subcomponentes si hay alguna ruta anidada */}
      <Outlet />
    </div>
  );
};

export default PerfilTab;

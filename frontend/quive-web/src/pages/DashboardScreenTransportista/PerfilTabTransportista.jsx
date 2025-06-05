import React from 'react';
import {User} from 'lucide-react';
const PerfilTabTransportista = ({ userData, onNavigate }) => {
    return (
    <div>
      <h2 className="text-2xl font-bold text-blue-600 mb-6">Mi Perfil</h2>
      
      <div className="space-y-6">
        {/* Profile Info */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{userData.name || 'Usuario'}</h3>
              <p className="text-gray-600">{userData.email || 'email@ejemplo.com'}</p>
            </div>
          </div>
          
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Editar Perfil
          </button>
        </div>

        {/* Menu Options */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">Mis Direcciones</span>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">Métodos de Pago</span>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">Historial de Mudanzas</span>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">Configuración</span>
              <span className="text-gray-400">›</span>
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <span className="text-gray-700">Ayuda y Soporte</span>
              <span className="text-gray-400">›</span>
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-lg shadow-sm">
          <button 
            onClick={() => onNavigate('landing')}
            className="w-full p-4 text-red-600 hover:bg-red-50 transition-colors rounded-lg"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};
export default PerfilTabTransportista;
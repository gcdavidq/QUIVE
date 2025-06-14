import React from 'react';
import {Shield, Clock, MapPin, Package} from 'lucide-react';

const InicioTab = ({ userData, setActiveTab}) => {
  return(
    <>
    {/* Welcome Card */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-8">
      <h2 className="text-2xl font-bold mb-2">¡Hola, {userData.nombre_completo  || userData.tipo_usuario}!</h2>
      <p className="text-blue-100 mb-4">
        ¿Necesitas mudarte? Encuentra el camión perfecto para ti.'
      </p>
      <button 
        onClick={() => setActiveTab(userData.tipo_usuario === 'transportista' ? 'pedidos' : 'mudanza')}
        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
      >
        {userData.tipo_usuario === 'transportista' ? 'Ver Pedidos' : 'Solicitar Mudanza'}
      </button>
    </div>

    {/* Why Us Section */}
    <div className="mb-8">
      <h3 className="text-xl font-bold text-blue-600 mb-6">¿POR QUÉ NOSOTROS?</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <Shield className="text-blue-600 mr-3" size={24} />
            <h4 className="font-semibold text-gray-800">Seguridad Garantizada</h4>
          </div>
          <p className="text-gray-600 text-sm">Todos los servicios están asegurados y verificados</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <Clock className="text-blue-600 mr-3" size={24} />
            <h4 className="font-semibold text-gray-800">Servicio 24/7</h4>
          </div>
          <p className="text-gray-600 text-sm">Disponible cuando lo necesites</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <Clock className="text-blue-600 mr-3" size={24} />
            <h4 className="font-semibold text-gray-800">Servicio 24/7</h4>
          </div>
          <p className="text-gray-600 text-sm">Disponible cuando lo necesites</p>
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div>
      <h3 className="text-xl font-bold text-blue-600 mb-4">Acciones Rápidas</h3>
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <MapPin className="text-blue-600 mb-2" size={24} />
          <p className="text-sm font-semibold text-gray-800">Ver Mapa</p>
        </button>
        <button 
          onClick={() => setActiveTab('perfil/historial')} 
          className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <Package className="text-blue-600 mb-2" size={24} />
            <p className="text-sm font-semibold text-gray-800">Historial</p>
        </button>
      </div>
    </div>
  </>

  );
    
};
export default InicioTab;
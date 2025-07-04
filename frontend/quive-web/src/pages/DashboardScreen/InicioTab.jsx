import React from 'react';
import {Shield, Clock, MapPin, Package} from 'lucide-react';

const InicioTab = ({ userData, setActiveTab}) => {
  return (
    <>
      {/* Welcome Card */}
      <div className="theme-card bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-8">
        <h2 className="text-2xl font-bold mb-2">
          ¡Hola, {userData.nombre_completo || userData.tipo_usuario}!
        </h2>
        <p className="text-blue-100 mb-4">
          ¿Necesitas mudarte? Encuentra el camión perfecto para ti.
        </p>
        <button 
          onClick={() => setActiveTab(userData.tipo_usuario === 'transportista' ? 'pedidos' : 'mudanza')}
          className="theme-toggle bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          style={{ 
            backgroundColor: 'white', 
            color: '#2563eb',
            minHeight: 'auto'
          }}
        >
          {userData.tipo_usuario === 'transportista' ? 'Ver Pedidos' : 'Solicitar Mudanza'}
        </button>
      </div>

      {/* Why Us Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold theme-text-primary mb-6" style={{ color: '#2563eb' }}>
          ¿POR QUÉ NOSOTROS?
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="theme-card rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Shield className="text-blue-600 mr-3" size={24} />
              <h4 className="font-semibold theme-text-primary">Seguridad Garantizada</h4>
            </div>
            <p className="theme-text-secondary text-sm">
              Todos los servicios están asegurados y verificados
            </p>
          </div>
          
          <div className="theme-card rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Clock className="text-blue-600 mr-3" size={24} />
              <h4 className="font-semibold theme-text-primary">Servicio 24/7</h4>
            </div>
            <p className="theme-text-secondary text-sm">
              Disponible cuando lo necesites
            </p>
          </div>
          
          <div className="theme-card rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Package className="text-blue-600 mr-3" size={24} />
              <h4 className="font-semibold theme-text-primary">Precios Competitivos</h4>
            </div>
            <p className="theme-text-secondary text-sm">
              Las mejores tarifas del mercado
            </p>
          </div>
          
          <div className="theme-card rounded-lg p-4">
            <div className="flex items-center mb-3">
              <MapPin className="text-blue-600 mr-3" size={24} />
              <h4 className="font-semibold theme-text-primary">Cobertura Nacional</h4>
            </div>
            <p className="theme-text-secondary text-sm">
              Servicios en todo el país
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl font-bold theme-text-primary mb-4" style={{ color: '#2563eb' }}>
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="theme-card rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:transform hover:scale-105">
            <MapPin className="text-blue-600 mb-2 mx-auto" size={24} />
            <p className="text-sm font-semibold theme-text-primary text-center">Ver Mapa</p>
          </button>
          
          <button 
            onClick={() => setActiveTab('perfil/historial')} 
            className="theme-card rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:transform hover:scale-105"
          >
            <Package className="text-blue-600 mb-2 mx-auto" size={24} />
            <p className="text-sm font-semibold theme-text-primary text-center">Historial</p>
          </button>
        </div>
      </div>
    </>
  );
    
};
export default InicioTab;
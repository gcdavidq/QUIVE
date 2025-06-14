import React, {useState} from 'react';
import {MapPin, Truck} from 'lucide-react';

const PedidosTab = ({userData, setActiveTab}) => {
    const [pedidos] = useState([
    {
      id: 1,
      origen: 'San Isidro, Lima',
      destino: 'Miraflores, Lima',
      clienteEmail: 'a@a.com',
      fecha: '2024-05-30',
      estado: 'en_proceso',
      precio: 150,
      tipoVehiculo: 'camioneta'
    },
    {
      id: 2,
      origen: 'Surco, Lima',
      destino: 'La Molina, Lima',
      clienteEmail: 'otro@cliuente.com',
      fecha: '2024-05-31',
      estado: 'cancelado',
      precio: 200,
      tipoVehiculo: 'camion-pequeno'
    },
    {
      id: 3,
      origen: 'San Borja, Lima',
      destino: 'San Miguel, Lima',
      fecha: '2024-06-01',
      estado: 'completado',
      precio: 120,
      tipoVehiculo: 'camioneta'
    }
  ]);
  const pedidosFiltrados = pedidos;

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'completado': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">
          Mis Pedidos
        </h2>
        {userData.tipo_usuario === 'transportista' ? (
          <button 
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            onClick={() => alert("Aquí se pueden aplicar filtros de pedidos")}
          >
            Filtros
          </button>
        ) : (
          <button 
            onClick={() => setActiveTab('mudanza')}  
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nuevo Pedido
          </button>
        )}

      </div>

      <div className="space-y-4">
        {pedidosFiltrados.map(pedido => (
          <div key={pedido.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <MapPin className="text-blue-600 mr-2" size={16} />
                  <span className="text-sm text-gray-600">Desde: {pedido.origen}</span>
                </div>
                <div className="flex items-center mb-2">
                  <MapPin className="text-green-600 mr-2" size={16} />
                  <span className="text-sm text-gray-600">Hasta: {pedido.destino}</span>
                </div>
                <div className="flex items-center mb-2">
                  <Truck className="text-gray-600 mr-2" size={16} />
                  <span className="text-sm text-gray-600 capitalize">{pedido.tipoVehiculo.replace('-', ' ')}</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(pedido.estado)}`}>
                  {getEstadoTexto(pedido.estado)}
                </span>
                <p className="text-xl font-bold text-blue-600 mt-2">S/ {pedido.precio}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Fecha: {pedido.fecha}</span>
              <div className="space-x-2">
                {userData.tipo_usuario === 'transportista' ? (
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Aceptar
                  </button>
                ) : (
                  <>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Ver Detalles
                    </button>
                    {pedido.estado === 'pendiente' && (
                      <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm">
                        Cancelar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PedidosTab;

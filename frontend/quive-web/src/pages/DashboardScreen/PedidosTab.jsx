import React, { useEffect, useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import axios from 'axios';

const PedidosTab = ({ userData, setActiveTab }) => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenFecha, setOrdenFecha] = useState('recientes');
  const [ordenPrecio, setOrdenPrecio] = useState('ninguno');

  useEffect(() => {
    if (!userData?.id_usuario || !userData?.tipo_usuario) return;
    axios.get(`http://localhost:5000/asignaciones/${userData.id_usuario}/${userData.tipo_usuario}`)
      .then(res => setAsignaciones(res.data));
  }, [userData]);

  const responder = (id_asignacion, estado) => {
    axios.post(`http://localhost:5000/asignaciones/${id_asignacion}/respuesta`, { estado })
      .then(() => {
        setAsignaciones(prev =>
          prev.map(a => a.id_asignacion === id_asignacion ? { ...a, estado } : a)
        );
      });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'confirmado': return 'Confirmado';
      case 'rechazado': return 'Rechazado';
      case 'cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const pedidosFiltrados = asignaciones
    .filter(p => {
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
      return true;
    })
    .sort((a, b) => {
      if (ordenFecha === 'recientes') return new Date(b.fecha_hora) - new Date(a.fecha_hora);
      if (ordenFecha === 'antiguos') return new Date(a.fecha_hora) - new Date(b.fecha_hora);
      return 0;
    })
    .sort((a, b) => {
      if (ordenPrecio === 'menor') return a.precio - b.precio;
      if (ordenPrecio === 'mayor') return b.precio - a.precio;
      return 0;
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Mis Pedidos</h2>
        {userData.tipo_usuario !== 'transportista' && (
          <button
            onClick={() => setActiveTab('mudanza')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            Nuevo Pedido
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mt-4 mb-6">
        <div>
          <label className="text-sm text-gray-600 font-medium">Orden por Fecha</label>
          <select
            value={ordenFecha}
            onChange={(e) => setOrdenFecha(e.target.value)}
            className="block mt-1 px-3 py-2 border rounded-lg text-sm bg-white shadow-sm focus:ring focus:ring-blue-200"
          >
            <option value="recientes">Más recientes primero</option>
            <option value="antiguos">Más antiguos primero</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 font-medium">Filtrar por Estado</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="block mt-1 px-3 py-2 border rounded-lg text-sm bg-white shadow-sm focus:ring focus:ring-blue-200"
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="rechazado">Rechazado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600 font-medium">Orden por Precio</label>
          <select
            value={ordenPrecio}
            onChange={(e) => setOrdenPrecio(e.target.value)}
            className="block mt-1 px-3 py-2 border rounded-lg text-sm bg-white shadow-sm focus:ring focus:ring-blue-200"
          >
            <option value="ninguno">Sin ordenar</option>
            <option value="menor">Precio menor a mayor</option>
            <option value="mayor">Precio mayor a menor</option>
          </select>
        </div>
      </div>

      {/* Pedidos */}
      <div className="space-y-4">
        {pedidosFiltrados.map(pedido => (
          <div key={pedido.id_asignacion} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <MapPin className="text-blue-600 mr-2" size={16} />
                  <span className="text-sm text-gray-600">Desde: {pedido.origen.split(';')[0]}</span>
                </div>
                <div className="flex items-center mb-2">
                  <MapPin className="text-green-600 mr-2" size={16} />
                  <span className="text-sm text-gray-600">Hasta: {pedido.destino.split(';')[0]}</span>
                </div>
                <div className="text-sm text-gray-500">Fecha: {new Date(pedido.fecha_hora).toLocaleDateString()}</div>
              </div>

              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(pedido.estado)}`}>
                  {getEstadoTexto(pedido.estado)}
                </span>
                <p className="text-xl font-bold text-blue-600 mt-2">S/ {pedido.precio}</p>
              </div>
            </div>

            {/* Info adicional del cliente */}
            {userData.tipo_usuario === 'transportista' && (
              <div className="flex items-center space-x-4 mb-4">
                <img src={pedido.usuario_foto} alt="Foto usuario" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{pedido.usuario_nombre}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone size={14} className="mr-1" /> {pedido.usuario_telefono}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              {pedido.estado === 'pendiente' && userData.tipo_usuario === 'transportista' && (
                <>
                  <button
                    onClick={() => responder(pedido.id_asignacion, 'confirmado')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => responder(pedido.id_asignacion, 'rechazado')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    Rechazar
                  </button>
                </>
              )}
              {pedido.estado !== 'pendiente' && (
                <span className="text-sm text-gray-500 italic">Ya respondido</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PedidosTab;

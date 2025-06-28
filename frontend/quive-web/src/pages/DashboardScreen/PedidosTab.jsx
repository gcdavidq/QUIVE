import React, { useEffect, useState } from 'react';
import { MapPin, Phone, X, CreditCard } from 'lucide-react';
import axios from 'axios';

const PedidosTab = ({ userData, setActiveTab }) => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenFecha, setOrdenFecha] = useState('recientes');
  const [ordenPrecio, setOrdenPrecio] = useState('ninguno');
  const [showModalMetodoPago, setShowModalMetodoPago] = useState(false);
  
  useEffect(() => {
    if (!userData?.id_usuario || !userData?.tipo_usuario) return;
    axios.get(`http://localhost:5000/asignaciones/${userData.id_usuario}/${userData.tipo_usuario}`)
      .then(res => setAsignaciones(res.data));
  }, [userData]);

  // Función para verificar si el transportista tiene método de pago
  const tieneMetodoPago = () => {
    const metodosSeleccionados = localStorage.getItem('metodosSeleccionados');
    console.log(metodosSeleccionados);
    return metodosSeleccionados !== null;
  };

  const responder = (id_asignacion, estado) => {
    // Si es transportista y está confirmando, verificar método de pago
    if (estado === 'confirmada' && !tieneMetodoPago()) {
      setShowModalMetodoPago(true);
      return;
    }

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
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'rechazada': return 'bg-red-100 text-red-800';
      case 'cancelada': return 'bg-gray-200 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'confirmada': return 'Confirmada';
      case 'rechazada': return 'Rechazada';
      case 'cancelada': return 'Cancelada';
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

  const irAMetodosPago = () => {
    setShowModalMetodoPago(false);
    setActiveTab('perfil/pagos'); // Ajusta la ruta según tu configuración
  };

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
            <option value="confirmada">Confirmado</option>
            <option value="rechazada">Rechazado</option>
            <option value="cancelada">Cancelado</option>
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
            <div className="flex items-center space-x-4 mb-4">
              <img src={pedido.usuario_foto} alt="Foto usuario" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium text-gray-700">{pedido.usuario_nombre}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone size={14} className="mr-1" /> {pedido.usuario_telefono}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {pedido.estado === 'pendiente' && userData.tipo_usuario === 'transportista' && (
                <>
                  <button
                    onClick={() => responder(pedido.id_asignacion, 'confirmada')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => responder(pedido.id_asignacion, 'rechazada')}
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

      {/* Modal de Método de Pago Requerido */}
      {showModalMetodoPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            {/* Botón cerrar */}
            <button
              onClick={() => setShowModalMetodoPago(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            {/* Contenido del modal */}
            <div className="text-center">
              <div className="mb-4">
                <CreditCard className="mx-auto text-blue-600" size={48} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Método de Pago Requerido
              </h3>
              
              <p className="text-gray-600 mb-6">
                Para confirmar servicios como transportista, debes tener al menos un método de pago vinculado a tu cuenta.
              </p>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={irAMetodosPago}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Vincular Método de Pago
                </button>
                
                <button
                  onClick={() => setShowModalMetodoPago(false)}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosTab;
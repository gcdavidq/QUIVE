import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapPin, Phone, X, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import PaymentMethodSelector from '../utils/PaymentMethodSelector';

const PedidosTab = ({ userData, setActiveTab }) => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenFecha, setOrdenFecha] = useState('recientes');
  const [ordenPrecio, setOrdenPrecio] = useState('ninguno');
  const [showModalMetodoPago, setShowModalMetodoPago] = useState(false);
  const [showModalSeleccionPago, setShowModalSeleccionPago] = useState(false);
  const [showModalError, setShowModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [metodosSeleccionados, setMetodosSeleccionados] = useState({});
  const [metodoActivo, setMetodoActivo] = useState('');
  const [procesandoRespuesta, setProcesandoRespuesta] = useState(null);
  const [actualizandoDatos, setActualizandoDatos] = useState(false);
  
  const intervalRef = useRef(null);

  // Función para cargar asignaciones
  const cargarAsignaciones = useCallback(async () => {
    if (!userData?.id_usuario || !userData?.tipo_usuario) return;
    
    try {
      setActualizandoDatos(true);
      const response = await axios.get(`http://localhost:5000/asignaciones/${userData.id_usuario}/${userData.tipo_usuario}`);
      setAsignaciones(response.data);
    } catch (error) {
      console.error('Error al cargar asignaciones:', error);
    } finally {
      setActualizandoDatos(false);
    }
  }, [userData]);

  // Cargar asignaciones inicialmente y configurar actualizador automático
  useEffect(() => {
    cargarAsignaciones();
    
    // Configurar actualizador automático cada 30 segundos
    intervalRef.current = setInterval(() => {
      cargarAsignaciones();
    }, 30000);

    // Limpiar intervalo al desmontar componente
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [cargarAsignaciones]);

  // Cargar métodos de pago disponibles
  useEffect(() => {
    const metodosGuardados = localStorage.getItem('metodosSeleccionados');
    if (metodosGuardados) {
      const metodos = JSON.parse(metodosGuardados);
      setMetodosSeleccionados(metodos);
      
      // Establecer el primer método disponible como activo
      const metodosDisponibles = Object.keys(metodos);
      if (metodosDisponibles.length > 0) {
        setMetodoActivo(metodosDisponibles[0]);
      }
    }
  }, []);

  // Función para verificar si el transportista tiene método de pago
  const tieneMetodoPago = () => {
    const metodosGuardados = localStorage.getItem('metodosSeleccionados');
    return metodosGuardados !== null && Object.keys(JSON.parse(metodosGuardados)).length > 0;
  };

  // Función para mostrar error en modal
  const mostrarError = (mensaje) => {
    setMensajeError(mensaje);
    setShowModalError(true);
  };

  // Función mejorada para verificar si la asignación aún existe
  const verificarAsignacionExiste = async (id_asignacion) => {
    try {
      const response = await axios.get(`http://localhost:5000/asignaciones/${id_asignacion}/estado`);
      console.log('Asignación verificada:', response);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Función para determinar el estado actual a mostrar
  const obtenerEstadoActual = (pedido) => {
    // Si el estado_solicitud es diferente de "en espera", usar el estado de la solicitud
    if (pedido.estado_solicitud && pedido.estado_solicitud !== 'en espera') {
      return pedido.estado_solicitud;
    }
    // Si el estado_solicitud es "en espera" o no existe, usar el estado de la asignación
    return pedido.estado;
  };

  const responder = async (id_asignacion, estado) => {
    // Prevenir múltiples clics
    if (procesandoRespuesta === id_asignacion) return;
    
    setProcesandoRespuesta(id_asignacion);

    try {
      // Verificar si la asignación aún existe
      const existe = await verificarAsignacionExiste(id_asignacion);
      if (!existe) {
        mostrarError('Esta solicitud ya no está disponible. Es posible que haya sido cancelada o ya haya sido respondida por otro transportista.');
        // Actualizar datos inmediatamente
        await cargarAsignaciones();
        setProcesandoRespuesta(null);
        return;
      }

      // Si es transportista y está confirmando, verificar método de pago
      if (estado === 'confirmada' && !tieneMetodoPago()) {
        setShowModalMetodoPago(true);
        setProcesandoRespuesta(null);
        return;
      }

      // Si tiene métodos de pago, mostrar modal de selección
      if (estado === 'confirmada' && tieneMetodoPago()) {
        setPedidoSeleccionado(id_asignacion);
        setShowModalSeleccionPago(true);
        setProcesandoRespuesta(null);
        return;
      }

      // Para rechazar o si no es confirmación, proceder directamente
      await axios.post(`http://localhost:5000/asignaciones/${id_asignacion}/respuesta`, { estado });
      
      // Actualizar estado local
      setAsignaciones(prev =>
        prev.map(a => a.id_asignacion === id_asignacion ? { ...a, estado } : a)
      );
      
      // Actualizar datos del servidor para asegurar consistencia
      await cargarAsignaciones();
      
    } catch (error) {
      console.error('Error al responder:', error);
      
      if (error.response?.status === 404) {
        mostrarError('Esta solicitud ya no está disponible.');
      } else if (error.response?.status === 409) {
        mostrarError('Esta solicitud ya ha sido respondida por otro transportista.');
      } else if (error.response?.status === 400) {
        mostrarError('No se puede procesar esta solicitud en su estado actual.');
      } else {
        mostrarError('Error al procesar la solicitud. Por favor, intenta nuevamente.');
      }
      
      // Actualizar datos del servidor en caso de error
      await cargarAsignaciones();
    } finally {
      setProcesandoRespuesta(null);
    }
  };

  const confirmarConMetodo = async () => {
    if (!metodoActivo || !pedidoSeleccionado) return;
    
    try {
      // Verificar si la asignación aún existe antes de confirmar
      const existe = await verificarAsignacionExiste(pedidoSeleccionado);
      if (!existe) {
        setShowModalSeleccionPago(false);
        setPedidoSeleccionado(null);
        mostrarError('Esta solicitud ya no está disponible. Es posible que haya sido cancelada o ya haya sido respondida.');
        await cargarAsignaciones();
        return;
      }

      console.log('Confirmando con método:', metodoActivo, 'para pedido:', metodosSeleccionados[metodoActivo]);

      await axios.post(`http://localhost:5000/asignaciones/${pedidoSeleccionado}/respuesta`, { 
        estado: 'confirmada',
        metodo_pago: metodosSeleccionados[metodoActivo] || null,
        tipo_metodo: metodoActivo
      });

      // Actualizar estado local
      setAsignaciones(prev =>
        prev.map(a => a.id_asignacion === pedidoSeleccionado ? { ...a, estado: 'confirmada' } : a)
      );
      
      setShowModalSeleccionPago(false);
      setPedidoSeleccionado(null);
      
      // Actualizar datos del servidor para asegurar consistencia
      await cargarAsignaciones();
      
    } catch (error) {
      console.error('Error al confirmar:', error);
      
      setShowModalSeleccionPago(false);
      setPedidoSeleccionado(null);
      
      if (error.response?.status === 404) {
        mostrarError('Esta solicitud ya no está disponible.');
      } else if (error.response?.status === 409) {
        mostrarError('Esta solicitud ya ha sido respondida por otro transportista.');
      } else {
        mostrarError('Error al confirmar el pedido. Por favor, intenta nuevamente.');
      }
      
      await cargarAsignaciones();
    }
  };

  const handleSeleccionarMetodo = (tipo) => {
    if (metodosSeleccionados[tipo]) {
      setMetodoActivo(tipo);
    }
  };

  const irAMetodosPago = () => {
    setShowModalMetodoPago(false);
    setActiveTab('perfil/pagos');
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en espera': return 'bg-blue-100 text-blue-800';
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'activa': return 'bg-purple-100 text-purple-800';
      case 'finalizada': return 'bg-gray-100 text-gray-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'rechazada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en espera': return 'En Espera';
      case 'confirmada': return 'Confirmada';
      case 'activa': return 'En Progreso';
      case 'finalizada': return 'Finalizada';
      case 'cancelada': return 'Cancelada';
      case 'rechazada': return 'Rechazada';
      default: return estado;
    }
  };

  // Función para determinar si se pueden mostrar botones de acción
  const puedeResponder = (pedido) => {
    const estadoActual = obtenerEstadoActual(pedido);
    return estadoActual === 'pendiente' && userData.tipo_usuario === 'transportista';
  };

  const pedidosFiltrados = asignaciones
    .filter(p => {
      const estadoActual = obtenerEstadoActual(p);
      if (filtroEstado !== 'todos' && estadoActual !== filtroEstado) return false;
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
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-blue-600">Mis Pedidos</h2>
          {actualizandoDatos && (
            <RefreshCw className="text-blue-500 animate-spin" size={20} />
          )}
        </div>
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
            <option value="en espera">En Espera</option>
            <option value="confirmada">Confirmado</option>
            <option value="activa">En Progreso</option>
            <option value="finalizada">Finalizado</option>
            <option value="cancelada">Cancelado</option>
            <option value="rechazada">Rechazado</option>
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
        {pedidosFiltrados.map(pedido => {
          const estadoActual = obtenerEstadoActual(pedido);
          
          return (
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
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(estadoActual)}`}>
                    {getEstadoTexto(estadoActual)}
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
                {puedeResponder(pedido) && (
                  <>
                    <button
                      onClick={() => responder(pedido.id_asignacion, 'confirmada')}
                      disabled={procesandoRespuesta === pedido.id_asignacion}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        procesandoRespuesta === pedido.id_asignacion
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {procesandoRespuesta === pedido.id_asignacion ? 'Procesando...' : 'Aceptar'}
                    </button>
                    <button
                      onClick={() => responder(pedido.id_asignacion, 'rechazada')}
                      disabled={procesandoRespuesta === pedido.id_asignacion}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        procesandoRespuesta === pedido.id_asignacion
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {procesandoRespuesta === pedido.id_asignacion ? 'Procesando...' : 'Rechazar'}
                    </button>
                  </>
                )}
                {!puedeResponder(pedido) && (
                  <span className="text-sm text-gray-500 italic">
                    {estadoActual === 'pendiente' ? 'Esperando respuesta' : 'Ya procesado'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Error */}
      {showModalError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowModalError(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="text-center">
              <div className="mb-4">
                <AlertCircle className="mx-auto text-red-500" size={48} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Solicitud No Disponible
              </h3>
              
              <p className="text-gray-600 mb-6">
                {mensajeError}
              </p>

              <button
                onClick={() => setShowModalError(false)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Método de Pago Requerido */}
      {showModalMetodoPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowModalMetodoPago(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

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

      {/* Modal de Selección de Método de Pago */}
      {showModalSeleccionPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 relative max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowModalSeleccionPago(false);
                setPedidoSeleccionado(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-blue-600 mb-2 text-center">
                Seleccionar Método de Pago
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Elige el método de pago para recibir el cobro de este servicio
              </p>
            </div>

            {/* Componente reutilizable PaymentMethodSelector */}
            <PaymentMethodSelector
              metodosSeleccionados={metodosSeleccionados}
              metodoActivo={metodoActivo}
              onSeleccionarMetodo={handleSeleccionarMetodo}
              onGestionarMetodos={() => {
                setShowModalSeleccionPago(false);
                setPedidoSeleccionado(null);
                setActiveTab('perfil/pagos');
              }}
              showGestionarButton={true}
              showSelectedMethod={true}
              className="mb-6"
            />

            {/* Botones de acción */}
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowModalSeleccionPago(false);
                  setPedidoSeleccionado(null);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarConMetodo}
                disabled={!metodoActivo}
                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                  metodoActivo 
                    ? "bg-green-600 text-white hover:bg-green-700" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PedidosTab;
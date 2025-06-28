import React, { useState, useEffect } from 'react';
import { Star, MapPin, CreditCard, Smartphone, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const MetodosPago = ({ formData, actualizarFormData, volver, handleCancelar }) => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [metodosSeleccionados, setMetodosSeleccionados] = useState({});
  const [metodoActivo, setMetodoActivo] = useState(''); // Método de pago seleccionado actualmente
  const [datosTarjeta, setDatosTarjeta] = useState({ numero: '', vencimiento: '', titular: '', cvc: '' });
  const [datosYape, setDatosYape] = useState({ dni: '', numero: '', codigo: '' });
  const [datosPaypal, setDatosPaypal] = useState({ email: '', password: '' });
  const [terminos, setTerminos] = useState({ marketing: false, privacidad: false });
  const [vibrarTerminos, setVibrarTerminos] = useState(false);

  // Cargar métodos seleccionados desde localStorage al montar el componente
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
      
      // Llenar los datos según los métodos seleccionados
      if (metodos.Tarjeta) {
        setDatosTarjeta({
          numero: metodos.Tarjeta.detalle.numero || '',
          vencimiento: metodos.Tarjeta.detalle.vencimiento || '',
          titular: metodos.Tarjeta.detalle.nombre || '',
          cvc: metodos.Tarjeta.detalle.cvv || ''
        });
      }
      
      if (metodos.Yape) {
        setDatosYape({
          dni: '',
          numero: '',
          codigo: metodos.Yape.detalle.codigo || ''
        });
      }
      
      if (metodos.PayPal) {
        setDatosPaypal({
          email: metodos.PayPal.detalle.correo || '',
          password: metodos.PayPal.detalle.contrasena || ''
        });
      }
    }
  }, []);

  const handleSeleccionarMetodo = (tipo) => {
    // Solo permitir seleccionar si el método está disponible
    if (metodosSeleccionados[tipo]) {
      setMetodoActivo(tipo);
    }
  };

  const handleConfirmar = async () => {
    // Validar términos y condiciones
    if (!terminos.marketing || !terminos.privacidad) {
      setVibrarTerminos(true);
      setTimeout(() => setVibrarTerminos(false), 600);
      return;
    }

    // Verificar que hay al menos un método de pago seleccionado
    if (Object.keys(metodosSeleccionados).length === 0) {
      alert('Debes seleccionar al menos un método de pago');
      return;
    }

    // Verificar que hay un método activo seleccionado
    if (!metodoActivo) {
      alert('Debes seleccionar un método de pago para proceder');
      return;
    }

    try {
      // Actualizar el estado de la solicitud a 'confirmado'
      const solicitudActualizada = {
        ...formData,
        estado: 'confirmado'
      };

      // Usar el método activo seleccionado
      const metodoPrincipal = metodoActivo === 'Tarjeta' ? 'card' : 
                              metodoActivo === 'Yape' ? 'yape' : 
                              metodoActivo === 'PayPal' ? 'paypal' : null;

      const datosPago = metodoPrincipal === 'card' ? datosTarjeta : 
                        metodoPrincipal === 'yape' ? datosYape : datosPaypal;

      const response = await fetch(`http://127.0.0.1:5000/solicitudes/${formData?.id_solicitud}/confirmar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metodo_pago: metodoPrincipal,
          datos_pago: datosPago,
          estado: 'confirmado'
        })
      });

      if (!response.ok) throw new Error("Error al confirmar la solicitud");

      // Actualizar el formData con el nuevo estado
      actualizarFormData(solicitudActualizada);
      
      setMensaje("Servicio confirmado correctamente.");
      
      // Redirigir al inicio después de 2 segundos
      setTimeout(() => {
        volver();
      }, 2000);

    } catch (err) {
      alert(err.message);
    }
  };

  const handleGestionarMetodos = () => {
    navigate('../perfil/pagos');
  };

  const getMethodIcon = (tipo) => {
    switch (tipo) {
      case 'Tarjeta':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'Yape':
        return <Smartphone className="w-5 h-5 text-purple-600" />;
      case 'PayPal':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCardNumber = (numero) => {
    if (!numero) return '';
    const lastFour = numero.slice(-4);
    return `•••• ${lastFour}`;
  };

  const getMethodDisplayName = (metodo) => {
    switch (metodo.tipo) {
      case 'Tarjeta':
        return `Tarjeta ${formatCardNumber(metodo.detalle.numero)}`;
      case 'Yape':
        return `Yape - ${metodo.detalle.codigo}`;
      case 'PayPal':
        return `PayPal - ${metodo.detalle.correo}`;
      default:
        return metodo.tipo;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: '2-digit', year: '2-digit' });
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-blue-600 mb-4 text-center">RESUMEN</h3>

            <div className="bg-blue-100 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-blue-900">{formData.conductor?.nombre || 'Sin conductor'}</span>
                <span className="font-bold text-xl">S/ {Number(formData.conductor?.precio).toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                {formData.conductor?.foto && (
                  <img
                    src={formData.conductor.foto}
                    alt="Foto del conductor"
                    className="w-20 h-20 rounded-full object-cover border border-gray-300"
                  />
                )}
                <div className="text-sm space-y-1">
                  <div><span className="text-gray-600">Vehículo: </span>{formData.conductor?.vehiculo}</div>
                  <div><span className="text-gray-600">Capacidad: </span>{formData.conductor?.capacidad} m³</div>
                  <div><span className="text-gray-600">Tiempo estimado: </span>{formData.conductor?.tiempo}</div>
                  <div className="flex items-center">
                    <span className="text-gray-600">Calificación: </span>
                    <span className="flex items-center ml-1">
                      {parseFloat(formData.conductor?.puntaje || 0).toFixed(1)} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-1" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-2 text-sm space-y-2">
                <h3 className="text-blue-800 font-semibold">Detalles de la mudanza</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="text-blue-600 w-4 h-4 mt-1" />
                  <div>
                    <span className="text-gray-600 font-medium">Origen: </span>{formData?.origen?.split(';')[0]}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="text-blue-600 w-4 h-4 mt-1" />
                  <div>
                    <span className="text-gray-600 font-medium">Destino: </span>{formData?.destino?.split(';')[0]}
                  </div>
                </div>
                <div><span className="text-gray-600 font-medium">Fecha:</span> {formData?.fecha}</div>
                <div><span className="text-gray-600 font-medium">Hora:</span> {formData?.hora}</div>
                <div><span className="text-gray-600 font-medium">Distancia:</span> {(formData?.distancia / 1000).toFixed(2)} km</div>
                <div><span className="text-gray-600 font-medium">Tiempo estimado:</span> {formData?.tiempos_estimado} h</div>
                {formData?.notas && <div><span className="text-gray-600 font-medium">Notas:</span> {formData.notas}</div>}
              </div>

              <div className="border-t pt-4 mt-2">
                <h3 className="text-blue-800 font-semibold mb-2">Objetos a transportar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.objetos.map((objeto, index) => (
                    <div key={index} className="flex bg-white rounded-lg shadow-sm overflow-hidden border">
                      <img
                        src={objeto.imagen_url}
                        alt={objeto.descripcion}
                        className="w-24 h-24 object-cover"
                      />
                      <div className="p-2 text-sm flex flex-col justify-between">
                        <div><span className="text-gray-600">Categoría:</span> {objeto.categoria}</div>
                        <div><span className="text-gray-600">Variante:</span> {objeto.variante}</div>
                        <div><span className="text-gray-600">Cantidad:</span> {objeto.cantidad}</div>
                        <div><span className="text-gray-600">Peso:</span> {objeto.peso} kg</div>
                        <div><span className="text-gray-600">Volumen:</span> {objeto.volumen} m³</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button 
                onClick={() => {
                  actualizarFormData({ conductor: null, asignacion: null });
                  handleCancelar();
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Confirmar Servicio
              </button>
            </div>

            {mensaje && (
              <div className="mt-4 text-green-600 text-sm font-medium text-center bg-green-50 p-3 rounded-lg">
                {mensaje}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-blue-600 mb-6 text-center">MÉTODOS DE PAGO</h3>
          
          <div className="space-y-4 mb-6">
            {/* Mostrar métodos de pago con selección circular */}
            {['Tarjeta', 'Yape', 'PayPal'].map(tipo => {
              const metodoSeleccionado = metodosSeleccionados[tipo];
              const estaActivo = metodoActivo === tipo;
              const estaDisponible = !!metodoSeleccionado;
              
              return (
                <div 
                  key={tipo} 
                  className={clsx(
                    "border rounded-lg p-4 transition-all duration-200 cursor-pointer",
                    estaActivo && estaDisponible ? 'bg-blue-50 border-blue-300 shadow-md' : 'bg-gray-50',
                    estaDisponible ? 'hover:bg-blue-25 hover:border-blue-200' : 'opacity-60 cursor-not-allowed'
                  )}
                  onClick={() => estaDisponible && handleSeleccionarMetodo(tipo)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {/* Botón circular de selección */}
                      <div className={clsx(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200",
                        estaActivo && estaDisponible ? 'border-blue-500 bg-blue-500' : 
                        estaDisponible ? 'border-gray-300 hover:border-blue-400' : 'border-gray-200'
                      )}>
                        {estaActivo && estaDisponible && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {getMethodIcon(tipo)}
                      </div>
                      <span className="font-medium text-gray-700">
                        {tipo === 'Tarjeta' ? 'Tarjeta de Crédito/Débito' : 
                         tipo === 'Yape' ? 'Yape/Plin' : 'PayPal'}
                      </span>
                    </div>
                    
                    {estaActivo && estaDisponible && (
                      <span className="text-blue-600 text-sm font-medium bg-blue-100 px-2 py-1 rounded-full">
                        Seleccionado
                      </span>
                    )}
                  </div>
                  
                  {estaActivo && metodoSeleccionado && (
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500 transition-all duration-200 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-800">
                          {getMethodDisplayName(metodoSeleccionado)}
                        </span>
                        <span className="text-green-600 text-sm font-medium">✓ Disponible</span>
                      </div>
                      
                      {/* Detalles específicos por tipo */}
                      {tipo === 'Tarjeta' && metodoSeleccionado.detalle && (
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Titular: {metodoSeleccionado.detalle.nombre || 'No especificado'}</div>
                          {metodoSeleccionado.detalle.vencimiento && (
                            <div>Vence: {formatDate(metodoSeleccionado.detalle.vencimiento)}</div>
                          )}
                        </div>
                      )}
                      
                      {tipo === 'Yape' && metodoSeleccionado.detalle && (
                        <div className="text-sm text-gray-600">
                          Código: {metodoSeleccionado.detalle.codigo}
                        </div>
                      )}
                      
                      {tipo === 'PayPal' && metodoSeleccionado.detalle && (
                        <div className="text-sm text-gray-600">
                          Email: {metodoSeleccionado.detalle.correo}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!metodoSeleccionado && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-yellow-800 text-sm">
                          No tienes ningún método de {tipo} configurado
                        </span>
                      </div>
                      <p className="text-yellow-700 text-xs mt-1">
                        Configura este método desde el botón de gestionar métodos de pago
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Método de pago seleccionado actualmente */}
          {metodoActivo && metodosSeleccionados[metodoActivo] && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Método de pago para el cobro:</h4>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {getMethodIcon(metodoActivo)}
                </div>
                <span className="font-medium text-blue-800">
                  {getMethodDisplayName(metodosSeleccionados[metodoActivo])}
                </span>
              </div>
            </div>
          )}

          {/* Botón para gestionar métodos de pago */}
          <div className="mb-6">
            <button
              onClick={handleGestionarMetodos}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Settings className="w-5 h-5" />
              <span>Gestionar Métodos de Pago</span>
            </button>
          </div>

          {/* Términos y condiciones */}
          <div className={clsx(
            "space-y-3 p-4 rounded-lg transition-all duration-300",
            (!terminos.marketing || !terminos.privacidad) && vibrarTerminos ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'
          )}>
            <h4 className="font-bold text-blue-900">Términos y Condiciones</h4>
            <label className="flex items-start space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={terminos.marketing} 
                onChange={e => setTerminos(prev => ({ ...prev, marketing: e.target.checked }))}
                className="mt-1" 
              />
              <span className="text-sm text-gray-700">Acepto recibir correos electrónicos de marketing y promociones</span>
            </label>
            <label className="flex items-start space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={terminos.privacidad} 
                onChange={e => setTerminos(prev => ({ ...prev, privacidad: e.target.checked }))}
                className="mt-1" 
              />
              <span className="text-sm text-gray-700">Acepto la política de privacidad y términos de servicio</span>
            </label>
            {(!terminos.marketing || !terminos.privacidad) && vibrarTerminos && (
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Debes aceptar ambos términos para continuar
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetodosPago;
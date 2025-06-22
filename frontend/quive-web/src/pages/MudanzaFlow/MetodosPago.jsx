import React, { useState } from 'react';
import { Star, MapPin  } from 'lucide-react';
import clsx from 'clsx';

const MetodosPago = ({ formData, actualizarFormData, volver }) => {
  const [mensaje, setMensaje] = useState('');
  const [metodoSeleccionado, setMetodoSeleccionado] = useState('card');
  const [datosTarjeta, setDatosTarjeta] = useState({ numero: '', vencimiento: '', titular: '', cvc: '' });
  const [datosYape, setDatosYape] = useState({ dni: '', numero: '', codigo: '' });
  const [datosPaypal, setDatosPaypal] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({});
  const [terminos, setTerminos] = useState({ marketing: false, privacidad: false });
  const [vibrarTerminos, setVibrarTerminos] = useState(false);

  const handleInputChange = (e, tipo) => {
    const { name, value } = e.target;
    if (tipo === 'card') {
      setDatosTarjeta(prev => ({ ...prev, [name]: value }));
      // Limpiar error del campo cuando se empiece a escribir
      if (errores[name]) {
        setErrores(prev => ({ ...prev, [name]: '' }));
      }
    }
    if (tipo === 'yape') {
      setDatosYape(prev => ({ ...prev, [name]: value }));
      // Limpiar error del campo cuando se empiece a escribir
      if (errores[name]) {
        setErrores(prev => ({ ...prev, [name]: '' }));
      }
    }
    if (tipo === 'paypal') {
      setDatosPaypal(prev => ({ ...prev, [name]: value }));
      // Limpiar error del campo cuando se empiece a escribir
      if (errores[name]) {
        setErrores(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleConfirmar = async () => {
    let erroresValidacion = {};

    // Validar campos según el método seleccionado
    if (metodoSeleccionado === 'card') {
      Object.entries(datosTarjeta).forEach(([k, v]) => {
        if (!v.trim()) {
          const labels = {
            numero: 'Número de tarjeta',
            vencimiento: 'Fecha de vencimiento',
            titular: 'Nombre del titular',
            cvc: 'CVC'
          };
          erroresValidacion[k] = `${labels[k]} es requerido`;
        }
      });
    } else if (metodoSeleccionado === 'yape') {
      Object.entries(datosYape).forEach(([k, v]) => {
        if (!v.trim()) {
          const labels = {
            dni: 'DNI',
            numero: 'Número de teléfono',
            codigo: 'Código de verificación'
          };
          erroresValidacion[k] = `${labels[k]} es requerido`;
        }
      });
    } else if (metodoSeleccionado === 'paypal') {
      Object.entries(datosPaypal).forEach(([k, v]) => {
        if (!v.trim()) {
          const labels = {
            email: 'Email de PayPal',
            password: 'Contraseña'
          };
          erroresValidacion[k] = `${labels[k]} es requerido`;
        }
      });
    }

    // Validar términos y condiciones
    if (!terminos.marketing || !terminos.privacidad) {
      setVibrarTerminos(true);
      setTimeout(() => setVibrarTerminos(false), 600);
      return;
    }

    // Si hay errores de validación, mostrarlos
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }

    try {
      // Actualizar el estado de la solicitud a 'confirmado'
      const solicitudActualizada = {
        ...formData,
        estado: 'confirmado'
      };

      const response = await fetch(`http://127.0.0.1:5000/solicitudes/${formData?.id_solicitud}/confirmar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metodo_pago: metodoSeleccionado,
          datos_pago: metodoSeleccionado === 'card' ? datosTarjeta : 
                      metodoSeleccionado === 'yape' ? datosYape : datosPaypal,
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

  const limpiarErrores = () => {
    setErrores({});
  };

  const handleMetodoChange = (metodo) => {
    setMetodoSeleccionado(metodo);
    limpiarErrores();
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
                <span className="font-bold text-xl">S/ {formData.conductor?.precio?.toFixed(2) || '0.00'}</span>
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
                onClick={volver} 
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

          {/* Selección de método de pago */}
          <div className="space-y-4 mb-6">
            <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input 
                type="radio" 
                name="pago" 
                value="card" 
                checked={metodoSeleccionado === 'card'} 
                onChange={() => handleMetodoChange('card')} 
                className="mr-3 text-blue-600" 
              />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">💳</span>
                </div>
                <span className="text-gray-700 font-medium">Tarjeta de Crédito/Débito</span>
              </div>
            </label>
            {/* Formulario de tarjeta */}
            {metodoSeleccionado === 'card' && (
              <div className="space-y-4 bg-gray-50 p-6 rounded-xl border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Información de la Tarjeta</h4>
                  <div className="flex space-x-2">
                    <div className="w-8 h-5 bg-blue-600 rounded"></div>
                    <div className="w-8 h-5 bg-red-600 rounded"></div>
                    <div className="w-8 h-5 bg-yellow-400 rounded"></div>
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Tarjeta</label>
                  <input
                    name="numero"
                    placeholder="1234 5678 9012 3456"
                    value={datosTarjeta.numero}
                    onChange={(e) => handleInputChange(e, 'card')}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all",
                      errores.numero ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                    )}
                    maxLength="19"
                  />
                  {errores.numero && <p className="text-sm text-red-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{errores.numero}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento</label>
                    <input
                      name="vencimiento"
                      placeholder="MM/AA"
                      value={datosTarjeta.vencimiento}
                      onChange={(e) => handleInputChange(e, 'card')}
                      className={clsx(
                        "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all",
                        errores.vencimiento ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                      )}
                      maxLength="5"
                    />
                    {errores.vencimiento && <p className="text-sm text-red-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{errores.vencimiento}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                    <input
                      name="cvc"
                      placeholder="123"
                      value={datosTarjeta.cvc}
                      onChange={(e) => handleInputChange(e, 'card')}
                      className={clsx(
                        "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all",
                        errores.cvc ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                      )}
                      maxLength="4"
                    />
                    {errores.cvc && <p className="text-sm text-red-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{errores.cvc}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Titular</label>
                  <input
                    name="titular"
                    placeholder="Juan Pérez"
                    value={datosTarjeta.titular}
                    onChange={(e) => handleInputChange(e, 'card')}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all",
                      errores.titular ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                    )}
                  />
                  {errores.titular && <p className="text-sm text-red-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{errores.titular}</p>}
                </div>

                <div className="flex items-center space-x-2 mt-4 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-600">🔒</span>
                  <span className="text-sm text-blue-700">Tus datos están protegidos con encriptación SSL</span>
                </div>
              </div>
            )}
            <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input 
                type="radio" 
                name="pago" 
                value="yape" 
                checked={metodoSeleccionado === 'yape'} 
                onChange={() => handleMetodoChange('yape')} 
                className="mr-3 text-blue-600" 
              />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">📱</span>
                </div>
                <span className="text-gray-700 font-medium">Yape/Plin</span>
              </div>
            </label>

            {/* Formulario de Yape */}
            {metodoSeleccionado === 'yape' && (
              <div className="space-y-4 bg-purple-50 p-6 rounded-xl border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Información de Yape/Plin</h4>
                  <div className="flex space-x-2">
                    <div className="w-10 h-6 bg-purple-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">YAPE</span>
                    </div>
                    <div className="w-10 h-6 bg-pink-600 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-bold">PLIN</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DNI</label>
                  <input
                    name="dni"
                    placeholder="12345678"
                    value={datosYape.dni}
                    onChange={(e) => handleInputChange(e, 'yape')}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all",
                      errores.dni ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                    )}
                    maxLength="8"
                  />
                  {errores.dni && <p className="text-sm text-red-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{errores.dni}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Teléfono</label>
                  <input
                    name="numero"
                    placeholder="987654321"
                    value={datosYape.numero}
                    onChange={(e) => handleInputChange(e, 'yape')}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all",
                      errores.numero ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                    )}
                    maxLength="9"
                  />
                  {errores.numero && <p className="text-sm text-red-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{errores.numero}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código de Verificación</label>
                  <input
                    name="codigo"
                    placeholder="123456"
                    value={datosYape.codigo}
                    onChange={(e) => handleInputChange(e, 'yape')}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white transition-all",
                      errores.codigo ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                    )}
                    maxLength="6"
                  />
                </div>

                <div className="flex items-center space-x-2 mt-4 p-3 bg-purple-100 rounded-lg">
                  <span className="text-purple-600">📱</span>
                  <span className="text-sm text-purple-700">Se enviará un código de verificación a tu número registrado</span>
                </div>
              </div>
            )}
            <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input 
                type="radio" 
                name="pago" 
                value="paypal" 
                checked={metodoSeleccionado === 'paypal'} 
                onChange={() => handleMetodoChange('paypal')} 
                className="mr-3 text-blue-600" 
              />
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded mr-3 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">PP</span>
                </div>
                <span className="text-gray-700 font-medium">PayPal</span>
              </div>
            </label>

            {/* Formulario de PayPal */}
            {metodoSeleccionado === 'paypal' && (
              <div className="space-y-4 bg-blue-50 p-6 rounded-xl border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Información de PayPal</h4>
                  <div className="w-16 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-sm font-bold">PayPal</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email de PayPal</label>
                  <input
                    name="email"
                    type="email"
                    placeholder="ejemplo@email.com"
                    value={datosPaypal.email}
                    onChange={(e) => handleInputChange(e, 'paypal')}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all",
                      errores.email ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                    )}
                  />
                  {errores.email && <p className="text-sm text-red-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{errores.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={datosPaypal.password}
                    onChange={(e) => handleInputChange(e, 'paypal')}
                    className={clsx(
                      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all",
                      errores.password ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300'
                    )}
                  />
                  {errores.password && <p className="text-sm text-red-500 mt-1 flex items-center"><span className="mr-1">⚠️</span>{errores.password}</p>}
                </div>

                <div className="flex items-center space-x-2 mt-4 p-3 bg-blue-100 rounded-lg">
                  <span className="text-blue-600">🔐</span>
                  <span className="text-sm text-blue-700">Serás redirigido a PayPal para completar el pago de forma segura</span>
                </div>
              </div>
            )}
          </div>

          <div className={clsx(
            "space-y-3 mt-6 p-4 rounded-lg transition-all duration-300",
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
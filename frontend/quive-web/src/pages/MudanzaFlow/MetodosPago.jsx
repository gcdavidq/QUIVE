import React, { useState } from 'react';
import { Star, MapPin  } from 'lucide-react';
import clsx from 'clsx';
import PaymentDetails from '../utils/PaymentDetails';

const MetodosPago = ({ formData, actualizarFormData, volver, handleCancelar }) => {
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
    const setters = {
      card: setDatosTarjeta,
      yape: setDatosYape,
      paypal: setDatosPaypal
    };
    const setter = setters[tipo];
    setter(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
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

  const limpiarErrores = () => setErrores({});
  const handleMetodoChange = metodo => {	setMetodoSeleccionado(metodo);	limpiarErrores(); };

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
          {/* Radios */}
          {['card','yape','paypal'].map(tipo => (
            <label key={tipo} className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="radio"
                name="pago"
                value={tipo}
                checked={metodoSeleccionado===tipo}
                onChange={()=>handleMetodoChange(tipo)}
                className="mr-3 text-blue-600"
              />
              <div className="flex items-center">
                {/* íconos condicionales omitidos */}
                <span className="text-gray-700 font-medium">
                  {tipo==='card'? 'Tarjeta de Crédito/Débito' : tipo==='yape' ? 'Yape/Plin' : 'PayPal'}
                </span>
              </div>
            </label>
          ))}
        </div>
        <PaymentDetails
          metodoSeleccionado={metodoSeleccionado}
          datosTarjeta={datosTarjeta}
          datosYape={datosYape}
          datosPaypal={datosPaypal}
          errores={errores}
          handleInputChange={handleInputChange}
        />

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
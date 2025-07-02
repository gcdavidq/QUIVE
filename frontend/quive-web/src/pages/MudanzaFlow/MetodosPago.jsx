import React, { useState, useEffect } from 'react';
import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import PaymentMethodSelector from '../utils/PaymentMethodSelector';

const MetodosPago = ({ formData, setFormData, setUserData, actualizarFormData, volver, handleCancelar }) => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState('');
  const [metodosSeleccionados, setMetodosSeleccionados] = useState({});
  const [metodoActivo, setMetodoActivo] = useState('');
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
      // Obtener los datos del método seleccionado
      const metodoSeleccionado = metodosSeleccionados[metodoActivo];
      const response = await fetch(`http://127.0.0.1:5000/solicitudes/actualizar_estado/${formData?.id_solicitud}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_asignacion: formData?.asignacion?.id_asignacion,
          metodo_pago: metodoSeleccionado?.id,
          monto: formData.conductor?.precio,
          estado: 'confirmada',
          tipo_metodo: metodoActivo
        })
      });

      if (!response.ok) throw new Error("Error al confirmar la solicitud");

      // Actualizar el formData con el nuevo estado
      setUserData((prev) => ({
        ...prev,
        formularioMudanza: {},
      }));
      setMensaje("Servicio confirmado correctamente.");
      
      volver();

    } catch (err) {
      alert(err.message);
    }
  };

  const handleGestionarMetodos = () => {
    navigate('../perfil/pagos');
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda - Resumen */}
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

        {/* Columna derecha - Métodos de Pago */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-blue-600 mb-6 text-center">MÉTODOS DE PAGO</h3>
          
          {/* Componente reutilizable de métodos de pago */}
          <div className="mb-6">
            <PaymentMethodSelector
              metodosSeleccionados={metodosSeleccionados}
              metodoActivo={metodoActivo}
              onSeleccionarMetodo={handleSeleccionarMetodo}
              onGestionarMetodos={handleGestionarMetodos}
              showGestionarButton={true}
              showSelectedMethod={true}
            />
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
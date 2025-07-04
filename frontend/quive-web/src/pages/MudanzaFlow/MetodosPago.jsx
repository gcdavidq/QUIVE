import React, { useState, useEffect } from 'react';
import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import PaymentMethodSelector from '../utils/PaymentMethodSelector';
import API_URL from '../../api'; // Asegúrate de que esta ruta sea correcta

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
      const response = await fetch(`${API_URL}/solicitudes/actualizar_estado/${formData?.id_solicitud}`, {
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
    <div className="p-6 theme-bg-secondary">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda - Resumen */}
        <div className="space-y-6">
          <div className="theme-card rounded-lg p-6">
            <h3 className="text-lg font-bold theme-text-primary mb-4 text-center">RESUMEN</h3>

            <div className="bg-info-soft rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold theme-text-primary">
                  {formData.conductor?.nombre || 'Sin conductor'}
                </span>
                <span className="font-bold text-xl theme-text-primary">
                  S/ {Number(formData.conductor?.precio).toFixed(2) || '0.00'}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                {formData.conductor?.foto && (
                  <img
                    src={formData.conductor.foto}
                    alt="Foto del conductor"
                    className="w-20 h-20 rounded-full object-cover theme-border"
                  />
                )}
                <div className="text-sm space-y-1">
                  <div><span className="theme-text-secondary">Vehículo:</span> {formData.conductor?.vehiculo}</div>
                  <div><span className="theme-text-secondary">Capacidad:</span> {formData.conductor?.capacidad} m³</div>
                  <div><span className="theme-text-secondary">Tiempo estimado:</span> {formData.conductor?.tiempo}</div>
                  <div className="flex items-center">
                    <span className="theme-text-secondary">Calificación:</span>
                    <span className="flex items-center ml-1">
                      {parseFloat(formData.conductor?.puntaje || 0).toFixed(1)} 
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-1" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-2 text-sm space-y-2">
                <h3 className="theme-title-dark font-semibold">Detalles de la mudanza</h3>
                <div className="flex items-start gap-2">
                  <MapPin className="text-blue-600 w-4 h-4 mt-1" />
                  <div><span className="theme-text-secondary font-medium">Origen:</span> {formData?.origen?.split(';')[0]}</div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="text-blue-600 w-4 h-4 mt-1" />
                  <div><span className="theme-text-secondary font-medium">Destino:</span> {formData?.destino?.split(';')[0]}</div>
                </div>
                <div><span className="theme-text-secondary font-medium">Fecha:</span> {formData?.fecha}</div>
                <div><span className="theme-text-secondary font-medium">Hora:</span> {formData?.hora}</div>
                <div><span className="theme-text-secondary font-medium">Distancia:</span> {(formData?.distancia / 1000).toFixed(2)} km</div>
                <div><span className="theme-text-secondary font-medium">Tiempo estimado:</span> {formData?.tiempos_estimado} h</div>
                {formData?.notas && (
                  <div><span className="theme-text-secondary font-medium">Notas:</span> {formData.notas}</div>
                )}
              </div>

              <div className="border-t pt-4 mt-2">
                <h3 className="theme-title-dark font-semibold mb-2">Objetos a transportar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.objetos.map((objeto, index) => (
                    <div key={index} className="theme-card rounded-lg overflow-hidden flex flex-col items-center text-center p-4">
                      <img
                        src={objeto.imagen_url}
                        alt={objeto.dsescripcion}
                        className="w-24 h-24 object-cover mb-4"
                      />
                      <div className="text-sm space-y-1">
                        <div><span className="theme-text-secondary">Categoría:</span> {objeto.categoria}</div>
                        <div><span className="theme-text-secondary">Variante:</span> {objeto.variante}</div>
                        <div><span className="theme-text-secondary">Cantidad:</span> {objeto.cantidad}</div>
                        <div><span className="theme-text-secondary">Peso:</span> {objeto.peso} kg</div>
                        <div><span className="theme-text-secondary">Volumen:</span> {objeto.volumen} m³</div>
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
                className="flex-1 theme-border theme-text-secondary py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                className="flex-1 btn-secondary py-3 rounded-lg"
              >
                Confirmar Servicio
              </button>
            </div>

            {mensaje && (
              <div className="mt-4 alert-success">
                {mensaje}
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha - Métodos de Pago */}
        <div className="theme-card p-6 rounded-lg">
          <h3 className="text-lg font-bold theme-title-primary mb-6 text-center">MÉTODOS DE PAGO</h3>

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
            (!terminos.marketing || !terminos.privacidad) && vibrarTerminos ? 'bg-red-50 border-2 border-red-200' : 'theme-bg-secondary'
          )}>
            <h4 className="font-bold theme-title-dark">Términos y Condiciones</h4>
            <label className="flex items-start space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={terminos.marketing} 
                onChange={e => setTerminos(prev => ({ ...prev, marketing: e.target.checked }))}
                className="mt-1"
              />
              <span className="text-sm theme-text-secondary">Acepto recibir correos electrónicos de marketing y promociones</span>
            </label>
            <label className="flex items-start space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={terminos.privacidad} 
                onChange={e => setTerminos(prev => ({ ...prev, privacidad: e.target.checked }))}
                className="mt-1"
              />
              <span className="text-sm theme-text-secondary">Acepto la política de privacidad y términos de servicio</span>
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
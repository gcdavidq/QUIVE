// Archivo: MudanzaFlow.jsx
import React, { useState, useEffect, useRef  } from 'react';
import StepIndicator from './MudanzaFlow/StepIndicator';
import DetallesMudanza from './MudanzaFlow/DetallesMudanza';
import CaracteristicasObjetos from './MudanzaFlow/CaracteristicasObjetos';
import SeleccionConductor from './MudanzaFlow/SeleccionConductor';
import PrincipalSelector from './MudanzaFlow/PrincipalSelector';
import MetodosPago from './MudanzaFlow/MetodosPago';
import { ArrowLeft } from 'lucide-react';

const MudanzaFlow = ({ userData, setUserData, onNavigate, setActiveTab }) => {
  const [formData, setFormData] = useState({
    id_solicitud: '',
    origen: '',
    destino: '',
    fecha: '',
    hora: '',
    ruta: '',
    distancia: '',
    tiempos_estimado: '',
    objetos: [],
    conductor: null,
    notas: '',
    asignacion: {},
    ...(userData?.formularioMudanza || {})
  });

  const [currentStep, setCurrentStep] = useState(null);
  const [nuevoObjeto, setNuevoObjeto] = useState({});
  const [cargando, setCargando] = useState(true);
  const yaCargado = useRef(false);

  useEffect(() => {
  const inicializar = async () => {
    // Si no hay usuario, no hacer nada
    if (!userData?.id_usuario) {
      setCargando(false);
      return;
    }

    // Si ya se cargó antes O ya hay una solicitud, usar datos existentes
    if (yaCargado.current || userData?.formularioMudanza?.id_solicitud) {
      setFormData(prev => ({ ...prev, ...(userData?.formularioMudanza || {}) }));
      if (!yaCargado.current) {
        calcularStep(userData?.formularioMudanza);
        yaCargado.current = true; // Marcar como cargado
      }
      setCargando(false);
      return;
    }

    // Primera vez cargando - intentar obtener solicitud del servidor
    try {
      const response = await fetch(`http://127.0.0.1:5000/solicitudes/mi_solicitud/${userData?.id_usuario}`);
      
      if (response.ok) {
        const data = await response.json();
        
        const nuevaData = {
          id_solicitud: data.id_solicitud,
          origen: data.origen || '',
          destino: data.destino || '',
          fecha: data.fecha ? data.fecha.split('T')[0] : '',
          hora: data.hora || '',
          ruta: data.ruta || '',
          distancia: data.distancia || '',
          tiempos_estimado: data.tiempo_total_estimado_horas || '',
          objetos: data.objetos || [],
          conductor: data.id_transportista
            ? {
                capacidad: data.capacidad,
                distancia: `${(data.distancia / 1000).toFixed(2)} km`,
                foto: data.foto,
                id_transportista: data.id_transportista,
                nombre: data.nombre,
                precio: data.precio,
                puntaje: data.puntaje,
                rating: data.puntaje,
                reviews: data.reviews,
                tiempo: `${Math.round(data.tiempo_total_estimado_horas * 60)} min`,
                vehiculo: data.vehiculo,
                viajes: data.viajes
              }
            : null,
          notas: '',
          asignacion: data.id_asignacion
            ? {
                id_asignacion: data.id_asignacion,
                estado: data.estado_asignacion
              }
            : {},
        };

        setUserData(prev => ({
          ...prev,
          formularioMudanza: nuevaData,
        }));

        setFormData(prev => ({ ...prev, ...nuevaData }));
        calcularStep(nuevaData);
      } else {
        // No hay solicitud pendiente - empezar desde el paso 1
        console.log("No hay solicitud pendiente, empezando desde paso 1");
        setCurrentStep(1);
      }
      
      yaCargado.current = true;
    } catch (error) {
      console.error("Error cargando solicitud:", error);
      // En caso de error, empezar desde el paso 1
      setCurrentStep(1);
      yaCargado.current = true;
    } finally {
      setCargando(false);
    }
  };

  inicializar();
}, [userData?.id_usuario, userData?.formularioMudanza, setUserData]);

  const calcularStep = (form) => {
    if (!form) return setCurrentStep(1);
    if (form?.asignacion?.estado === 'confirmada') {
      setCurrentStep(5);
    } else if (form?.conductor) {
      setCurrentStep(4);
    } else if (form?.asignacion?.estado === 'cancelada' || form?.asignacion?.estado === 'rechazada') {
      setCurrentStep(3);
    }
  };

  const actualizarFormData = (cambios) => {
    const nuevo = { ...formData, ...cambios };
    setFormData(nuevo);
    setUserData((prev) => ({
      ...prev,
      formularioMudanza: nuevo,
    }));
  };

  const nextStep = () => {
    if (formData.conductor && !formData.asignacion?.id_asignacion) {
      setCurrentStep(4);
      return;
    }
    if (currentStep < 5) {
      console.log("Avanzando al siguiente paso:", currentStep + 1);
      setCurrentStep(currentStep + 1);
      return; 
    }
  };

  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const volver = () => {
    if (currentStep >= 4 && formData.conductor) {
      setActiveTab('inicio');
    } else if (currentStep > 1 && !formData.conductor) {
      prevStep();
    } else if (currentStep === 5 && formData.asignacion?.estado !== 'confirmada') {
      setCurrentStep(3);
    } else {
      setActiveTab('inicio');
    }
  };

  const agregarObjeto = () => {
    if (!nuevoObjeto.cantidad?.toString().trim() || !nuevoObjeto.variante?.toString().trim()) {
      return alert('Ingresa todos los campos');
    }
    setFormData({ ...formData, objetos: [...formData.objetos, { ...nuevoObjeto, id: Date.now() }] });
    setNuevoObjeto({});
  };

  const eliminarObjeto = id => setFormData({ ...formData, objetos: formData.objetos.filter(obj => obj.id !== id) });

  const seleccionarConductor = conductor => actualizarFormData({ conductor: conductor });

  const validarPaso1 = () => {
    if (!formData.origen || !formData.destino || !formData.fecha || !formData.hora) {
      alert('Complete todos los campos');
      return false;
    }
    return true;
  };

  if (cargando || currentStep === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-500">Cargando solicitud...</span>
      </div>
    );
  }
  const eliminarAsignacion = async (id_asignacion) => {
    console.log("Eliminando asignación:", id_asignacion);
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/asignaciones/${id_asignacion}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Respuesta del servidor:", result.mensaje);
        actualizarFormData({ conductor: null, asignacion: null });
      } else if (response.status === 404) {
        const error = await response.json();
        console.warn("No encontrada:", error.msg);
      } else {
        const error = await response.text();
        console.error("Error al eliminar:", error);
      }
    } catch (err) {
      console.error("Error de red o servidor:", err);
    }
  };

  const handleCancelar = () => {
    if (formData.asignacion?.id_asignacion) {
      eliminarAsignacion(formData.asignacion.id_asignacion);
    }
    prevStep();
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER FIJO */}
      <div className="px-6 pt-6 pb-4 bg-white shadow-sm z-10">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-blue-600">SOLICITANDO MUDANZA</h2>
          <div className="mt-2 flex justify-between items-center">
            <button
              onClick={volver}
              className="mr-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <StepIndicator currentStep={currentStep} />
            <div className="w-[80px] invisible">← Regresar</div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 pb-20 overflow-auto">
        {currentStep === 1 && (
          <DetallesMudanza
            userData={userData}
            formData={formData}
            setFormData={setFormData}
            actualizarFormData={actualizarFormData}
            nextStep={nextStep}
            validarPaso1={validarPaso1}
          />
        )}
        {currentStep === 2 && (
          <CaracteristicasObjetos
            formData={formData}
            nuevoObjeto={nuevoObjeto}
            setNuevoObjeto={setNuevoObjeto}
            agregarObjeto={agregarObjeto}
            eliminarObjeto={eliminarObjeto}
            nextStep={nextStep}
            actualzarFormData={actualizarFormData}
            userData={userData}
          />
        )}
        {currentStep === 3 && (
          <SeleccionConductor
            seleccionarConductor={seleccionarConductor}
            nextStep={nextStep}
            formData={formData}
          />
        )}
        {currentStep === 4 && (
          <PrincipalSelector
            seleccionarConductor={seleccionarConductor}
            nextStep={nextStep}
            formData={formData}
            actualizarFormData={actualizarFormData}
            prevStep={prevStep}
            userData={userData}
            handleCancelar={handleCancelar}
          />
        )}
        {currentStep === 5 && (
          <MetodosPago
            formData={formData}
            setFormData={setFormData}
            setUserData={setUserData}
            actualizarFormData={actualizarFormData}
            volver={volver}
            handleCancelar={handleCancelar}
          />
        )}
      </div>
    </div>
  );
};

export default MudanzaFlow;

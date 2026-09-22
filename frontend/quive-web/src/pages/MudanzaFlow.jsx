import React, { useState, useEffect, useRef } from 'react';
import StepIndicator from './MudanzaFlow/StepIndicator';
import DetallesMudanza from './MudanzaFlow/DetallesMudanza';
import CaracteristicasObjetos from './MudanzaFlow/CaracteristicasObjetos';
import SeleccionConductor from './MudanzaFlow/SeleccionConductor';
import PrincipalSelector from './MudanzaFlow/PrincipalSelector';
import MetodosPago from './MudanzaFlow/MetodosPago';
import { ArrowLeft, RefreshCw, X } from 'lucide-react';
import API_URL, { apiFetch } from '../api';
import { conductorDesdeSolicitud } from './MudanzaFlow/conductor';

const MudanzaFlow = ({ userData, setUserData, onNavigate, setActiveTab }) => {
  // Guard de rol: Solo clientes pueden cotizar o solicitar mudanzas
  const isDriver = userData?.tipo_usuario === 'transportista';

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
    if (isDriver) {
      if (setActiveTab) setActiveTab('pedidos');
      return;
    }

    const inicializar = async () => {
      if (!userData?.id_usuario) {
        setCargando(false);
        return;
      }

      if (yaCargado.current || userData?.formularioMudanza?.id_solicitud) {
        setFormData(prev => ({ ...prev, ...(userData?.formularioMudanza || {}) }));
        if (!yaCargado.current) {
          calcularStep(userData?.formularioMudanza);
          yaCargado.current = true;
        }
        setCargando(false);
        return;
      }

      try {
        const response = await apiFetch(`${API_URL}/solicitudes/mi_solicitud/${userData?.id_usuario}`);
        if (response.ok) {
          const data = await response.json();
          // fecha_hora llega como un único timestamp; el formulario lo edita como fecha + hora locales.
          const programada = data.fecha_hora ? new Date(data.fecha_hora) : null;
          const dosDigitos = (n) => String(n).padStart(2, '0');
          const nuevaData = {
            id_solicitud: data.id_solicitud,
            origen: data.origen || '',
            destino: data.destino || '',
            fecha: programada ? `${programada.getFullYear()}-${dosDigitos(programada.getMonth() + 1)}-${dosDigitos(programada.getDate())}` : '',
            hora: programada ? `${dosDigitos(programada.getHours())}:${dosDigitos(programada.getMinutes())}` : '',
            ruta: data.ruta || '',
            distancia: data.distancia || '',
            tiempos_estimado: data.tiempo_estimado || '',
            objetos: (data.objetos || []).map((o) => ({ ...o, id: o.id_objeto, descripcion: `${o.categoria} ${o.variante}` })),
            conductor: data.id_transportista ? conductorDesdeSolicitud(data) : null,
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
          yaCargado.current = true;
        } else {
          setCurrentStep(1);
        }
      } catch (error) {
        console.error('Error al inicializar solicitud:', error);
        setCurrentStep(1);
      } finally {
        setCargando(false);
      }
    };

    inicializar();
  }, [userData, isDriver, setActiveTab, setUserData]);

  const calcularStep = (data) => {
    if (!data || !data.origen || !data.destino) {
      setCurrentStep(1);
      return;
    }
    if (!data.objetos || data.objetos.length === 0) {
      setCurrentStep(2);
      return;
    }
    if (!data.conductor) {
      setCurrentStep(3);
      return;
    }
    if (data.asignacion?.estado === 'confirmada') {
      setCurrentStep(5);
      return;
    }
    setCurrentStep(4);
  };

  const actualizarFormData = (nuevosDatos) => {
    setFormData(prev => {
      const actualizado = { ...prev, ...nuevosDatos };
      setUserData(u => ({ ...u, formularioMudanza: actualizado }));
      return actualizado;
    });
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const volver = () => {
    if (currentStep > 1) {
      prevStep();
    } else if (setActiveTab) {
      setActiveTab('inicio');
    }
  };

  const agregarObjeto = () => {
    const objetoParaAgregar = {
      id: Date.now(),
      id_tipo: nuevoObjeto.id_tipo,
      categoria: nuevoObjeto.categoria,
      variante: nuevoObjeto.variante,
      cantidad: parseInt(nuevoObjeto.cantidad) || 1,
      descripcion: `${nuevoObjeto.categoria} ${nuevoObjeto.variante}`,
      volumen: parseFloat(nuevoObjeto.volumen) || 0,
      peso: parseFloat(nuevoObjeto.peso) || 0,
      altura: nuevoObjeto.altura,
      ancho: nuevoObjeto.ancho,
      profundidad: nuevoObjeto.profundidad,
      imagen_url: nuevoObjeto.imagen_url,
      imagen_file: nuevoObjeto.imagen_file,
      fragil: nuevoObjeto.fragil,
      embalaje: nuevoObjeto.embalaje,
    };

    actualizarFormData({
      objetos: [...formData.objetos, objetoParaAgregar]
    });

    setNuevoObjeto({
      categoria: '',
      variante: '',
      cantidad: 1,
      descripcion: '',
      volumen: '',
      peso: '',
      altura: '',
      ancho: '',
      profundidad: '',
      imagen_url: '',
      imagen_file: null,
      fragil: false,
      embalaje: false,
    });
  };

  const eliminarObjeto = id => actualizarFormData({ objetos: formData.objetos.filter(obj => obj.id !== id) });
  const seleccionarConductor = conductor => actualizarFormData({ conductor });

  const validarPaso1 = () => {
    if (!formData.origen || !formData.destino || !formData.fecha || !formData.hora) {
      alert('Complete todos los campos obligatorios');
      return false;
    }
    return true;
  };

  const eliminarAsignacion = async (id_asignacion) => {
    try {
      await apiFetch(`${API_URL}/asignaciones/${id_asignacion}`, { method: "DELETE" });
      actualizarFormData({ conductor: null, asignacion: null });
    } catch (err) {
      console.error("Error al eliminar asignación:", err);
    }
  };

  const handleCancelar = () => {
    if (formData.asignacion?.id_asignacion) {
      eliminarAsignacion(formData.asignacion.id_asignacion);
    }
    prevStep();
  };

  if (isDriver) {
    return null;
  }

  if (cargando || currentStep === null) {
    return (
      <div className="surface-card p-12 text-center rounded-2xl max-w-md mx-auto my-12">
        <RefreshCw className="animate-spin text-[#4d93f5] mx-auto mb-3" size={32} />
        <p className="font-display text-base font-bold text-[#16365f] dark:text-white">
          Cargando solicitud de mudanza...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Flujo */}
      <div className="surface-card p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={volver}
            className="p-2.5 rounded-xl border border-[var(--color-border)] hover:border-[#4d93f5] text-[#345273] dark:text-white transition-all flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Regresar</span>
          </button>

          <div className="text-center">
            <span className="section-kicker">PLANIFICADOR INTELIGENTE</span>
            <h1 className="font-display text-xl font-bold text-[#16365f] dark:text-white mt-0.5">
              Cotización & Contratación de Mudanza
            </h1>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('inicio')}
            className="p-2.5 rounded-xl border border-[var(--color-border)] hover:text-rose-500 text-[#8da3bd] transition-all"
            title="Cerrar flujo"
          >
            <X size={16} />
          </button>
        </div>

        {/* Stepper MoveFlow */}
        <StepIndicator currentStep={currentStep} />
      </div>

      {/* Contenedor del Paso Activo */}
      <div>
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
            handleCancelar={handleCancelar}
            userData={userData}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </div>
  );
};

export default MudanzaFlow;

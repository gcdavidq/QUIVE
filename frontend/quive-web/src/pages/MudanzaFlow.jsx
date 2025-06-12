// Archivo principal: MudanzaFlow.jsx
import React, { useState } from 'react';
import StepIndicator from './MudanzaFlow/StepIndicator';
import DetallesMudanza from './MudanzaFlow/DetallesMudanza';
import CaracteristicasObjetos from './MudanzaFlow/CaracteristicasObjetos';
import SeleccionConductor from './MudanzaFlow/SeleccionConductor';
import ListaConductores from './MudanzaFlow/ListaConductores';
import MetodosPago from './MudanzaFlow/MetodosPago';
import { ArrowLeft } from 'lucide-react';

const MudanzaFlow = ({ userData, setUserData, onNavigate, setActiveTab }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const initialFormData = {
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
    ...(userData?.formularioMudanza || {})  // ← Sobrescribe con datos existentes si hay
  };
  const [formData, setFormData] = useState(initialFormData);
  const actualizarFormData = (cambios) => {
    const nuevo = { ...formData, ...cambios };
    setFormData(nuevo);
    setUserData((prev) => ({
      ...prev,
      formularioMudanza: cambios,
    }));
  };

  const [nuevoObjeto, setNuevoObjeto] = useState({});

  const nextStep = () => currentStep < 5 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);
  const volver = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      setActiveTab('inicio')
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
  const seleccionarConductor = conductor => setFormData({ ...formData, conductor });
  const validarPaso1 = () => {
    if (!formData.origen || !formData.destino || !formData.fecha || !formData.hora) {
      alert('Complete todos los campos');
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 px-6 pt-6">
      
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-blue-600">SOLICITANDO MUDANZA</h2>
        <div className="mt-2 flex justify-between items-center">
          <button
            onClick={volver}
             className="mr-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={24}/> 

          </button>
          <div className="flex-1 flex justify-center">
            <StepIndicator currentStep={currentStep} />
          </div>

          {/* Espaciador invisible para que StepIndicator quede centrado */}
          <div className="w-[80px] invisible">← Regresar</div>
        </div>
      </div>

        
      {/* Paso actual */}
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
        />
      )}
      {currentStep === 3 && (
        <SeleccionConductor
          setCurrentStep={setCurrentStep}
          seleccionarConductor={seleccionarConductor}
          nextStep={nextStep}
        />
      )}
      {currentStep === 4 && (
        <ListaConductores
          seleccionarConductor={seleccionarConductor}
          nextStep={nextStep}
        />
      )}
      {currentStep === 5 && (
        <MetodosPago
          formData={formData}
          setFormData={setFormData}
        />
      )}
    </div>
  );
};

export default MudanzaFlow;

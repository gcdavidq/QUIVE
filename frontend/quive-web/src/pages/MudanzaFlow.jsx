// Archivo principal: MudanzaFlow.jsx
import React, { useState } from 'react';
import StepIndicator from './MudanzaFlow/StepIndicator';
import DetallesMudanza from './MudanzaFlow/DetallesMudanza';
import CaracteristicasObjetos from './MudanzaFlow/CaracteristicasObjetos';
import SeleccionConductor from './MudanzaFlow/SeleccionConductor';
import PrincipalSelector from './MudanzaFlow/PrincipalSelector';
import MetodosPago from './MudanzaFlow/MetodosPago';
import { ArrowLeft } from 'lucide-react';

const MudanzaFlow = ({ userData, setUserData, onNavigate, setActiveTab }) => {
  const [currentStep, setCurrentStep] = useState(() =>
    userData?.formularioMudanza?.conductor ? 4 : 1
  );
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
      formularioMudanza: nuevo,
    }));
    console.log('FormData actualizado:', nuevo);
  };

  const [nuevoObjeto, setNuevoObjeto] = useState({});

  const nextStep = (val) => {
    if ((currentStep === 3 || currentStep === 4) && formData.conductor) {
      // Si ya hay conductor y estamos en paso 3 o 4, forzar quedarse en paso 4
      setCurrentStep(4);
      return;
    }

    if (!formData.conductor && currentStep < 5) {
      // Si no hay conductor, avanzar normalmente
      setCurrentStep(val || currentStep + 1);
      return;
    }

    // En cualquier otro caso, no hacer nada (por ejemplo: paso 5 con conductor)
  };


  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);
  const volver = () => {
    if (currentStep === 4 && formData.conductor) {
      // Si ya se seleccionó un conductor, solo se puede volver al inicio
      setActiveTab('inicio');
      return;
    }

    if (currentStep > 1) {
      prevStep();
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
            actualzarFormData={actualizarFormData}
            userData={userData}
          />
        )}
        {currentStep === 3 && (
          <SeleccionConductor
            setCurrentStep={setCurrentStep}
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
            setCurrentStep={setCurrentStep}
          />
        )}

        {currentStep === 5 && (
          <MetodosPago
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>
    </div>
  );
};

export default MudanzaFlow;

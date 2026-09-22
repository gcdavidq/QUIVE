import React, { useState } from 'react';
import Paso1DatosUsuario from './Registerutils/StepsRegister/Paso1DatosUsuario';
import Paso2VerificacionCorreo from './Registerutils/StepsRegister/Paso2VerificacionCorreo';
import Paso3DireccionFoto from './Registerutils/StepsRegister/Paso3DireccionFoto';
import Paso4VehiculoDocumentos from './Registerutils/StepsRegister/Paso4VehiculoDocumentos';
import Paso5Tarifas from './Registerutils/StepsRegister/Paso5Tarifas';
import Paso6ResumenFinal from './Registerutils/StepsRegister/Paso6ResumenFinal';
import { ArrowLeft } from 'lucide-react';


const RegisterScreen = ({ onNavigate, setUserData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '', email: '', telefono: '', dni: '', password: '', confirmPassword: '',
    tipoUsuario: 'cliente', placa: '', tipoVehiculo: '', tipoVehiculoNombre: ''
  });
  const [direccion, setUbicacion] = useState({ departamento: '', provincia: '', distrito: '', tipoVia: '', nombreVia: '', numero: '' });
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [documentos, setDocumentos] = useState({ licencia_conducir: null, tarjeta_propiedad: null, certificado_itv: null });
  const [tarifas, setTarifas] = useState({ precio_por_m3: '', precio_por_kg: '', precio_por_km: '', recargo_fragil: '', recargo_embalaje: '' });

  const steps = formData.tipoUsuario === 'transportista' ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 6];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Paso1DatosUsuario formData={formData} setFormData={setFormData} setCurrentStep={setCurrentStep} />;
      case 2:
        return <Paso2VerificacionCorreo email={formData.email} setCurrentStep={setCurrentStep} />;
      case 3:
        return <Paso3DireccionFoto direccion={direccion} setUbicacion={setUbicacion} fotoPerfil={fotoPerfil} setFotoPerfil={setFotoPerfil} setCurrentStep={setCurrentStep} formData={formData} />;
      case 4:
        return <Paso4VehiculoDocumentos formData={formData} setFormData={setFormData} documentos={documentos} setDocumentos={setDocumentos} setCurrentStep={setCurrentStep} />;
      case 5:
        return <Paso5Tarifas tarifas={tarifas} setTarifas={setTarifas} setCurrentStep={setCurrentStep} />;
      case 6:
        return <Paso6ResumenFinal formData={formData} direccion={direccion} fotoPerfil={fotoPerfil} documentos={documentos} tarifas={tarifas} onNavigate={onNavigate} setCurrentStep={setCurrentStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-app-bg)] flex flex-col relative overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#4d93f5]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#7ecfae]/10 blur-3xl" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('/')} 
            className="icon-button"
            title="Volver a inicio"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="brand-mark"><span className="brand-mark-shape" /><span className="brand-mark-dot" /></div>
            <span className="font-bold text-lg tracking-tight font-display text-[#16365f] dark:text-white">
              QUIVE
            </span>
          </div>
        </div>
      </header>

      {/* Stepper Progress */}
      <div className="flex justify-center py-6 px-4">
        <div className="flex items-center max-w-md w-full justify-between">
          {steps.map((step, index) => {
            const isDone = currentStep > step;
            const isCurrent = currentStep === step;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isCurrent
                        ? 'bg-[#4d93f5] text-white shadow-md ring-4 ring-[#4d93f5]/20'
                        : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[var(--color-border)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {isDone ? '✓' : index + 1}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 rounded transition-all duration-300 ${
                      currentStep > step ? 'bg-emerald-500' : 'bg-[var(--color-border)]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pb-12">
        <div className="surface-card rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-xl border border-[var(--color-border)] relative z-10">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
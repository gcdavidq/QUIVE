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
    tipoUsuario: 'cliente', placa: '', tipoVehiculo: ''
  });
  const [direccion, setUbicacion] = useState({ departamento: '', provincia: '', distrito: '', tipoVia: '', nombreVia: '', numero: '' });
  const [fotoPerfil, setFotoPerfil] = useState('https://dl.dropboxusercontent.com/scl/fi/jq4kjwhrqyjkmnwrpw3ks/blank-profile-picture-973460_1280.png');
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [documentos, setDocumentos] = useState({ licencia_conducir: null, tarjeta_propiedad: null, certificado_itv: null });
  const [tarifas, setTarifas] = useState({ precio_por_m3: '', precio_por_kg: '', precio_por_km: '', recargo_fragil: '', recargo_embalaje: '' });

  const steps = [1, 2, 3, 4, 5, 6];

  const volverPaso = () => {
    if (currentStep > 1) {
      if (formData.tipoUsuario === 'cliente' && currentStep === 6) {
        setCurrentStep(3);
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Paso1DatosUsuario formData={formData} setFormData={setFormData} setCurrentStep={setCurrentStep} setCodigoVerificacion={setCodigoVerificacion} />;
      case 2:
        return <Paso2VerificacionCorreo email={formData.email} codigoGenerado={codigoVerificacion} setCurrentStep={setCurrentStep} />;
      case 3:
        return <Paso3DireccionFoto direccion={direccion} setUbicacion={setUbicacion} fotoPerfil={fotoPerfil} setFotoPerfil={setFotoPerfil} setCurrentStep={setCurrentStep} formData={formData} />;
      case 4:
        return <Paso4VehiculoDocumentos formData={formData} setFormData={setFormData} documentos={documentos} setDocumentos={setDocumentos} setCurrentStep={setCurrentStep} />;
      case 5:
        return <Paso5Tarifas tarifas={tarifas} setTarifas={setTarifas} setCurrentStep={setCurrentStep} />;
      case 6:
        return <Paso6ResumenFinal formData={formData} direccion={direccion} fotoPerfil={fotoPerfil} documentos={documentos} tarifas={tarifas} setUserData={setUserData} onNavigate={onNavigate} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm p-6 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => onNavigate('landing')} className="mr-4 p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-2xl font-bold text-blue-600">QUIVE</div>
        </div>
        {currentStep > 1 && (
          <button onClick={volverPaso} className="text-sm px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
            Volver
          </button>
        )}
      </header>

      <div className="flex justify-center py-4">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${currentStep === step ? 'bg-blue-600' : 'bg-gray-300'}`}>{step}</div>
            {index < steps.length - 1 && <div className="w-12 h-1 bg-gray-300 mx-2"></div>}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center min-h-[60vh] py-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-xl">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
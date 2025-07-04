import React from 'react';
import { CheckCircle } from 'lucide-react';

const RegistroExitosoScreen = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-landing">
      <div className="theme-card p-8 rounded-xl text-center max-w-md w-full mx-4">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        </div>
      
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ¡Registro Exitoso!
        </h1>
        
        <p className="theme-text-secondary mb-8 text-lg">
          Tu cuenta ha sido creada correctamente. Ya puedes iniciar sesión y comenzar a usar la aplicación.
        </p>
        
        <button
          onClick={() => onNavigate('login')}
          className="theme-toggle w-full py-3 text-lg font-semibold rounded-lg transition-all duration-300 hover:transform hover:scale-105"
          style={{ minHeight: 'auto' }}
        >
          Iniciar Sesión
        </button>
        
        <p className="theme-text-secondary mt-6 text-sm">
          ¿Necesitas ayuda? Consulta nuestra guía de usuario o contacta con soporte.
        </p>
      </div>
    </div>
  );
};

export default RegistroExitosoScreen;
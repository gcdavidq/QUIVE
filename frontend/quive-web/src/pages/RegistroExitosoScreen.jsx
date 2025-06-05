import React from 'react';

const RegistroExitosoScreen = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white p-10 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">¡Registro Exitoso!</h1>
        <p className="text-gray-700 mb-6">Tu cuenta ha sido creada correctamente.</p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
};

export default RegistroExitosoScreen;

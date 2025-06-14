// WaitingScreen.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

const WaitingScreen = ({ onCancelar }) => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="p-8 bg-white rounded-2xl shadow-xl text-center space-y-4">
      <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto" />
      <h2 className="text-2xl font-semibold text-gray-800">Enviando solicitud...</h2>
      <p className="text-gray-600">Por favor espera, estamos procesando tu petición.</p>

      <button
        onClick={onCancelar}
        className="mt-4 px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
      >
        Cancelar transportista
      </button>
    </div>
  </div>
);

export default WaitingScreen;

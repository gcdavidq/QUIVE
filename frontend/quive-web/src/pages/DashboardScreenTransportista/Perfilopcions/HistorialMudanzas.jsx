import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const HistorialMudanzas = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm p-6 flex items-center">
        <button
          onClick={() => navigate('..')}
          className="mr-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-2xl font-bold text-blue-600">Historial de Mudanzas</div>
      </header>
      <div className="p-6">
        <ul className="space-y-4">
          <li className="bg-white p-4 rounded shadow">Mudanza - Lima a Callao - 12/05/2024</li>
          <li className="bg-white p-4 rounded shadow">Mudanza - San Isidro a Miraflores - 28/03/2024</li>
        </ul>
      </div>
    </div>
  );
};

export default HistorialMudanzas;

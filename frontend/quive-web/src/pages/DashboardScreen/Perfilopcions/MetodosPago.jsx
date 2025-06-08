import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MetodosPago = () => {
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
        <div className="text-2xl font-bold text-blue-600">Métodos de Pago</div>
      </header>
      <div className="p-6">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">Visa •••• 1234</div>
          <div className="bg-white p-4 rounded shadow">Yape - 987654321</div>
        </div>
      </div>
    </div>
  );
};

export default MetodosPago;

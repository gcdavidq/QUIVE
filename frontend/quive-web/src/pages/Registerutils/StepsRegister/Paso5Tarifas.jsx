import React from 'react';

const Paso5Tarifas = ({ tarifas, setTarifas, setCurrentStep }) => {
  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (value.startsWith('.')) {
      value = '0' + value;
    }
    if (/^\d+(\.\d{0,2})?$/.test(value) || value === '') {
      setTarifas(prev => ({ ...prev, [name]: value }));
    }
  };

  const validarTarifas = () => {
    return tarifas.precio_por_m3 && tarifas.precio_por_kg && tarifas.precio_por_km;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-600 text-center">Configuración de Tarifas</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Precio por m³ (S/)</label>
          <input
            type="text"
            name="precio_por_m3"
            placeholder='ejemplo: 1.50'
            value={tarifas.precio_por_m3}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Precio por kg (S/)</label>
          <input
            type="text"
            name="precio_por_kg"
            placeholder='ejemplo: 0.40'
            value={tarifas.precio_por_kg}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Precio por km (S/)</label>
          <input
            type="text"
            name="precio_por_km"
            placeholder='ejemplo: 2.50'
            value={tarifas.precio_por_km}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Recargo por embalaje (S/)</label>
          <input
            type="text"
            name="recargo_embalaje"
            placeholder='ejemplo: 1.20'
            value={tarifas.recargo_embalaje}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Recargo por objeto frágil (S/)</label>
          <input
            type="text"
            name="recargo_fragil"
            placeholder='ejemplo: 0.80'
            value={tarifas.recargo_fragil}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={() => setCurrentStep(4)}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
        >
          Volver
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(6)}
          disabled={!validarTarifas()}
          className={`px-6 py-3 rounded-lg font-semibold text-white ${validarTarifas() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Paso5Tarifas;
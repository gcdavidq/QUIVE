import React, { useEffect, useState } from 'react';
import SubidaDocumentos from '../documentos';
import API_URL from '../../../api'; 

const Paso4VehiculoDocumentos = ({ formData, setFormData, documentos, setDocumentos, setCurrentStep }) => {
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [placaExistente, setPlacaExistente] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/vehiculos/tipos-vehiculo`)
      .then(res => res.json())
      .then(data => setTiposVehiculo(data))
      .catch(err => console.error('Error al obtener tipos de vehículo:', err));
  }, []);

  // Verifica si la placa ya existe
  useEffect(() => {
    const verificarPlaca = async () => {
      if (!formData.placa || formData.placa.length < 7) return;

      try {
        const res = await fetch(`${API_URL}/vehiculos/verificar-placa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placa: formData.placa })
        });
        const data = await res.json();
        setPlacaExistente(data.existe);
      } catch (err) {
        console.error('Error al verificar placa:', err);
      }
    };

    verificarPlaca();
  }, [formData.placa]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaca = (e) => {
    let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let letters = raw.slice(0, 3).replace(/[^A-Z]/g, "");
    let numbers = raw.slice(3).replace(/[^0-9]/g, "");
    let value = letters;
    if (letters.length === 3 && numbers.length > 0) {
      value += '-' + numbers.slice(0, 3);
    }
    handleInputChange({ target: { name: 'placa', value } });
  };

  const validarPaso = () => {
    return formData.placa && !placaExistente && formData.tipoVehiculo &&
      documentos.licencia_conducir && documentos.tarjeta_propiedad && documentos.certificado_itv;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-600 text-center">Vehículo y Documentos</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="placa"
            placeholder="Placa (ej: ABC-123)"
            value={formData.placa}
            onChange={handlePlaca}
            maxLength={7}
            className="w-full px-4 py-3 border rounded-lg theme-border theme-bg-primary theme-text-primary focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          {placaExistente && (
            <p className="text-red-600 text-sm mt-1">Esta placa ya está registrada.</p>
          )}
        </div>

        <div>
          <select
            name="tipoVehiculo"
            value={formData.tipoVehiculo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg theme-border theme-bg-primary theme-text-primary focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">Selecciona un tipo de vehículo</option>
            {tiposVehiculo.map(tipo => (
              <option key={tipo.id_tipo_vehiculo} value={tipo.id_tipo_vehiculo}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <SubidaDocumentos documentos={documentos} setDocumentos={setDocumentos} />

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="px-6 py-3 theme-bg-secondary theme-text-primary rounded-lg hover:opacity-80 font-semibold transition-opacity"
        >
          Volver
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(5)}
          disabled={!validarPaso()}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            validarPaso() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Paso4VehiculoDocumentos;

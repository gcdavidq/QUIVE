import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import SubidaDocumentos from '../documentos';
import PasoRegistro from './PasoRegistro';
import API_URL, { apiFetch } from '../../../api';

// Paso exclusivo del TRANSPORTISTA.
const Paso4VehiculoDocumentos = ({ formData, setFormData, documentos, setDocumentos, setCurrentStep }) => {
  const [tiposVehiculo, setTiposVehiculo] = useState([]);
  const [placaExistente, setPlacaExistente] = useState(false);

  useEffect(() => {
    apiFetch(`${API_URL}/vehiculos/tipos-vehiculo`)
      .then(res => res.json())
      .then(data => setTiposVehiculo(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error al obtener tipos de vehículo:', err));
  }, []);

  useEffect(() => {
    if (!formData.placa || formData.placa.length < 7) { setPlacaExistente(false); return; }
    apiFetch(`${API_URL}/vehiculos/verificar-placa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placa: formData.placa })
    })
      .then(res => res.json())
      .then(data => setPlacaExistente(Boolean(data.existe)))
      .catch(err => console.error('Error al verificar placa:', err));
  }, [formData.placa]);

  const handlePlaca = (e) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const letters = raw.slice(0, 3).replace(/[^A-Z]/g, "");
    const numbers = raw.slice(3).replace(/[^0-9]/g, "");
    const placa = letters.length === 3 && numbers.length > 0 ? `${letters}-${numbers.slice(0, 3)}` : letters;
    setFormData(prev => ({ ...prev, placa }));
  };

  const seleccionarTipo = (e) => {
    const tipo = tiposVehiculo.find(t => String(t.id_tipo_vehiculo) === e.target.value);
    setFormData(prev => ({ ...prev, tipoVehiculo: e.target.value, tipoVehiculoNombre: tipo?.nombre || '' }));
  };

  const valido = formData.placa?.length === 7 && !placaExistente && formData.tipoVehiculo &&
    documentos.licencia_conducir && documentos.tarjeta_propiedad && documentos.certificado_itv;

  return (
    <PasoRegistro
      kicker="PASO 4 · VEHÍCULO Y DOCUMENTOS"
      titulo="Tu unidad de transporte"
      descripcion="QUIVE revisará tus documentos; verás el estado de la verificación en tu perfil."
      anterior={{ onClick: () => setCurrentStep(3) }}
      siguiente={{ onClick: () => setCurrentStep(5), disabled: !valido, Icon: ArrowRight }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="field-label" htmlFor="placa">Placa</label>
          <input id="placa" type="text" placeholder="ABC-123" value={formData.placa} onChange={handlePlaca} maxLength={7}
            className={`field-input ${placaExistente ? 'field-input-error' : ''}`} />
          {placaExistente && <p className="field-error">Esta placa ya está registrada.</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="tipoVehiculo">Tipo de vehículo</label>
          <select id="tipoVehiculo" value={formData.tipoVehiculo} onChange={seleccionarTipo} className="field-input">
            <option value="">Selecciona...</option>
            {tiposVehiculo.map(tipo => (
              <option key={tipo.id_tipo_vehiculo} value={tipo.id_tipo_vehiculo}>{tipo.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <SubidaDocumentos documentos={documentos} setDocumentos={setDocumentos} />
    </PasoRegistro>
  );
};

export default Paso4VehiculoDocumentos;

import React from 'react';
import { ArrowRight } from 'lucide-react';
import PasoRegistro from './PasoRegistro';

const CAMPOS = [
  { name: 'precio_por_km', label: 'Precio por km (S/)', obligatorio: true },
  { name: 'precio_por_m3', label: 'Precio por m³ (S/)', obligatorio: true },
  { name: 'precio_por_kg', label: 'Precio por kg (S/)', obligatorio: true },
  { name: 'recargo_fragil', label: 'Recargo por objeto frágil (S/)' },
  { name: 'recargo_embalaje', label: 'Recargo por embalaje (S/)' },
];

// Paso exclusivo del TRANSPORTISTA.
const Paso5Tarifas = ({ tarifas, setTarifas, setCurrentStep }) => {
  const handleInputChange = (e) => {
    let { name, value } = e.target;
    if (value.startsWith('.')) value = '0' + value;
    if (/^\d+(\.\d{0,2})?$/.test(value) || value === '') {
      setTarifas(prev => ({ ...prev, [name]: value }));
    }
  };

  const valido = tarifas.precio_por_m3 && tarifas.precio_por_kg && tarifas.precio_por_km;

  return (
    <PasoRegistro
      kicker="PASO 5 · TARIFAS"
      titulo="Define tus tarifas"
      descripcion="La cotización que ven los clientes se calcula hoy con tu precio por km y la distancia de la mudanza."
      anterior={{ onClick: () => setCurrentStep(4) }}
      siguiente={{ onClick: () => setCurrentStep(6), disabled: !valido, Icon: ArrowRight }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CAMPOS.map(({ name, label, obligatorio }) => (
          <div key={name}>
            <label className="field-label" htmlFor={name}>
              {label} {obligatorio && <span className="text-rose-500">*</span>}
            </label>
            <input id={name} name={name} type="text" inputMode="decimal" placeholder="0.00"
              value={tarifas[name]} onChange={handleInputChange} className="field-input" />
          </div>
        ))}
      </div>
    </PasoRegistro>
  );
};

export default Paso5Tarifas;

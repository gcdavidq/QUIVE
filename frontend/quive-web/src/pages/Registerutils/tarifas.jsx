import React, { useState } from "react";

const TarifasForm = ({ tarifas, setTarifas }) => {
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*(\.\d{0,2})?$/.test(value)) {
      setTarifas({ ...tarifas, [name]: value });
    }
  };

  const labelStyle = "text-sm font-semibold text-gray-700 mb-1";
  const inputStyle = "w-full px-4 py-2 border rounded-lg border-gray-300";

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow max-w-md mx-auto mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-bold text-gray-800">Tarifas del Transportista</div>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="text-blue-600 text-sm hover:underline"
        >
          {showForm ? "Ocultar" : "Agregar"}
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelStyle}>Precio por m³ (S/.)</label>
            <input
              type="text"
              name="precio_por_m3"
              value={tarifas.precio_por_m3}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Ej. 15.50"
            />
          </div>
          <div>
            <label className={labelStyle}>Precio por kg (S/.)</label>
            <input
              type="text"
              name="precio_por_kg"
              value={tarifas.precio_por_kg}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Ej. 1.20"
            />
          </div>
          <div>
            <label className={labelStyle}>Precio por km (S/.)</label>
            <input
              type="text"
              name="precio_por_km"
              value={tarifas.precio_por_km}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Ej. 0.80"
            />
          </div>
          <div>
            <label className={labelStyle}>Recargo frágil (S/.)</label>
            <input
              type="text"
              name="recargo_fragil"
              value={tarifas.recargo_fragil}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Ej. 3.00"
            />
          </div>
          <div>
            <label className={labelStyle}>Recargo embalaje (S/.)</label>
            <input
              type="text"
              name="recargo_embalaje"
              value={tarifas.recargo_embalaje}
              onChange={handleChange}
              className={inputStyle}
              placeholder="Ej. 2.50"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TarifasForm;
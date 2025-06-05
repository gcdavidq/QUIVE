import React from 'react';
import { Plus, X } from 'lucide-react';

const CaracteristicasObjetos = ({
  currentStep,
  formData,
  setFormData,
  nuevoObjeto,
  setNuevoObjeto,
  agregarObjeto,
  eliminarObjeto,
  nextStep
}) => {
  return (
    <div className="p-6">
      
      

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de objetos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600 mb-6">CARACTERÍSTICAS DE LOS OBJETOS</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccione Tipo de Objeto:</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={nuevoObjeto.tipo}
                  onChange={(e) => setNuevoObjeto({ ...nuevoObjeto, tipo: e.target.value })}
                >
                  <option value="Cocina">Cocina</option>
                  <option value="Sala">Sala</option>
                  <option value="Dormitorio">Dormitorio</option>
                  <option value="Electrodoméstico">Electrodoméstico</option>
                  <option value="Oficina">Oficina</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad:</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={nuevoObjeto.cantidad}
                  onChange={(e) => setNuevoObjeto({ ...nuevoObjeto, cantidad: Math.max(1, parseInt(e.target.value) || 1) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción: <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="Ej: Mesa de comedor de madera"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                value={nuevoObjeto.descripcion}
                onChange={(e) => setNuevoObjeto({ ...nuevoObjeto, descripcion: e.target.value })}
                maxLength="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dimensiones aproximadas (cm):</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Altura"
                  min="1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={nuevoObjeto.altura}
                  onChange={(e) => setNuevoObjeto({ ...nuevoObjeto, altura: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Ancho"
                  min="1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={nuevoObjeto.ancho}
                  onChange={(e) => setNuevoObjeto({ ...nuevoObjeto, ancho: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Prof."
                  min="1"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={nuevoObjeto.profundidad}
                  onChange={(e) => setNuevoObjeto({ ...nuevoObjeto, profundidad: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">¿Es frágil?</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setNuevoObjeto({ ...nuevoObjeto, fragil: true })}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    nuevoObjeto.fragil ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Sí
                </button>
                <button
                  type="button"
                  onClick={() => setNuevoObjeto({ ...nuevoObjeto, fragil: false })}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !nuevoObjeto.fragil ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <button
              onClick={agregarObjeto}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar Objeto
            </button>
          </div>
        </div>

        {/* Panel de resumen */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600 mb-4">OBJETOS AGREGADOS</h3>

          {formData.objetos.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No hay objetos agregados</p>
              <p className="text-sm">Agregue objetos para continuar</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {formData.objetos.map((objeto) => (
                <div key={objeto.id} className="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">{objeto.descripcion}</div>
                    <div className="text-sm text-gray-600">
                      Tipo: {objeto.tipo} | Cantidad: {objeto.cantidad}
                      {objeto.fragil && <span className="text-red-600 ml-2">⚠️ Frágil</span>}
                    </div>
                    {(objeto.altura || objeto.ancho || objeto.profundidad) && (
                      <div className="text-xs text-gray-500">
                        Dimensiones: {objeto.altura || '?'} × {objeto.ancho || '?'} × {objeto.profundidad || '?'} cm
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => eliminarObjeto(objeto.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              if (formData.objetos.length === 0) {
                alert('Debe agregar al menos un objeto para continuar');
                return;
              }
              nextStep();
            }}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Continuar ({formData.objetos.length} objeto{formData.objetos.length !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaracteristicasObjetos;

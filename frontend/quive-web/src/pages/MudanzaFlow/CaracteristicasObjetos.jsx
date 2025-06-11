import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import axios from 'axios';
import SubirImagen from '../../components/SubirImagen';


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
  const [tiposObjetos, setTiposObjetos] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [variantesFiltradas, setVariantesFiltradas] = useState([]);

  useEffect(() => {
    // Cargar los tipos de objetos desde la API
    axios.get('http://127.0.0.1:5000/objetos/tipos-objeto')
      .then(response => {
        const data = response.data;
        setTiposObjetos(data);
        const categorias = [...new Set(data.map(obj => obj.categoria))];
        setCategoriasDisponibles(categorias);
      })
      .catch(error => {
        console.error('Error al obtener los tipos de objetos:', error);
      });
  }, []);

  // Actualizar las variantes disponibles cuando cambia la categoría
  const handleCategoriaChange = (categoria) => {
    const variantes = tiposObjetos.filter(obj => obj.categoria === categoria);
    setVariantesFiltradas(variantes);
    setNuevoObjeto({
      ...nuevoObjeto,
      categoria,
      variante: '',
      tipoId: null,
      descripcion: '',
      volumen: '',
      peso: '',
      altura: '',
      ancho: '',
      profundidad: '',
      fragil: false,
      embalaje: false,
    });
  };

  // Manejar selección de variante
  const handleVarianteChange = (varianteSeleccionada) => {
    const objeto = variantesFiltradas.find(v => v.variante === varianteSeleccionada);
    if (!objeto) return;

    setNuevoObjeto({
      ...nuevoObjeto,
      variante: varianteSeleccionada,
      tipoId: objeto.id, // este es el ID que deberás guardar
      descripcion: objeto.descripcion,
      volumen: objeto.volumen_estimado,
      peso: objeto.peso_estimado,
      altura: objeto.alto,
      ancho: objeto.ancho,
      profundidad: objeto.largo,
      fragil: objeto.es_fragil,
      embalaje: objeto.necesita_embalaje
    });
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-blue-600 mb-6">CARACTERÍSTICAS DE LOS OBJETOS</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría:</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={nuevoObjeto.categoria || ''}
                  onChange={(e) => handleCategoriaChange(e.target.value)}
                >
                  <option value="">Seleccione una categoría</option>
                  {categoriasDisponibles.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Variante / Tamaño:</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={nuevoObjeto.variante || ''}
                  onChange={(e) => handleVarianteChange(e.target.value)}
                  disabled={!nuevoObjeto.categoria}
                >
                  <option value="">Seleccione una variante</option>
                  {variantesFiltradas.map((obj, i) => (
                    <option key={i} value={obj.variante}>{obj.variante}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad:</label>
              <input
                type="number"
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={nuevoObjeto.cantidad}
                onChange={(e) =>
                  setNuevoObjeto({ ...nuevoObjeto, cantidad: Math.max(1, parseInt(e.target.value) || 1) })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción:</label>
              <input
                type="text"
                value={nuevoObjeto.descripcion || ''}
                readOnly
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={nuevoObjeto.altura || ''}
                readOnly
                placeholder="Altura"
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                value={nuevoObjeto.ancho || ''}
                readOnly
                placeholder="Ancho"
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                value={nuevoObjeto.profundidad || ''}
                readOnly
                placeholder="Profundidad"
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={`Volumen: ${nuevoObjeto.volumen || '?'} m³`}
                readOnly
                className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                value={`Peso: ${nuevoObjeto.peso || '?'} kg`}
                readOnly
                className="bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Frágil:</label>
                <div className="mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  {nuevoObjeto.fragil ? 'Sí' : 'No'}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600">Embalaje:</label>
                <div className="mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                  {nuevoObjeto.embalaje ? 'Sí' : 'No'}
                </div>
              </div>
            </div>

            <button
              onClick={agregarObjeto}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar Objeto
            </button>
          </div>
        </div>

        {/* Panel de objetos agregados */}
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
                      Tipo: {objeto.categoria} | Variante: {objeto.variante} | Cantidad: {objeto.cantidad}
                      {objeto.fragil && <span className="text-red-600 ml-2">⚠️ Frágil</span>}
                    </div>
                    <div className="text-xs text-gray-500">
                      Dimensiones: {objeto.altura} × {objeto.ancho} × {objeto.profundidad} cm
                    </div>
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
              console.log(formData.objetos)
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

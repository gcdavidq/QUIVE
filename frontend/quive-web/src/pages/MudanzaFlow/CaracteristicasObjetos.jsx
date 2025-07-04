import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import axios from 'axios';
import SubirImagen from "../utils/SubirImagen";
import API_URL from '../../api'; 

const CaracteristicasObjetos = ({
  currentStep,
  formData,
  setFormData,
  nuevoObjeto,
  setNuevoObjeto,
  agregarObjeto,
  eliminarObjeto,
  nextStep,
  actualzarFormData,
  userData
}) => {
  const [tiposObjetos, setTiposObjetos] = useState([]);
  const [categoriasDisponibles, setCategoriasDisponibles] = useState([]);
  const [variantesFiltradas, setVariantesFiltradas] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Cargar los tipos de objetos desde la API
    axios.get(`${API_URL}/objetos/tipos-objeto`)
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

  // Función para limpiar errores cuando el usuario interactúa
  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  // Validar formulario de nuevo objeto
  const validateNuevoObjeto = () => {
    const newErrors = {};

    if (!nuevoObjeto.categoria) {
      newErrors.categoria = 'La categoría es requerida';
    }
    if (!nuevoObjeto.variante) {
      newErrors.variante = 'La variante es requerida';
    }
    if (!nuevoObjeto.cantidad || nuevoObjeto.cantidad < 1) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }
    if (nuevoObjeto.cantidad > 50) {
      newErrors.cantidad = 'La cantidad no puede ser mayor a 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar antes de continuar
  const validateContinuar = () => {
    const newErrors = {};

    if (formData.objetos.length === 0) {
      newErrors.objetos = 'Debe agregar al menos un objeto para continuar';
    }
    if (!formData.id_solicitud) {
      newErrors.id_solicitud = 'No se puede enviar sin un ID de solicitud válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Actualizar las variantes disponibles cuando cambia la categoría
  const handleCategoriaChange = (categoria) => {
    clearError('categoria');
    clearError('variante');
    
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
      imagen_url: '',
      imagen_file: null,
      fragil: false,
      embalaje: false,
    });
  };

  // Manejar selección de variante
  const handleVarianteChange = (varianteSeleccionada) => {
    clearError('variante');
    
    const objeto = variantesFiltradas.find(v => v.variante === varianteSeleccionada);
    if (!objeto) return;

    setNuevoObjeto({
      ...nuevoObjeto,
      variante: varianteSeleccionada,
      cantidad: 1,
      id_tipo: objeto.id_tipo,
      descripcion: objeto.descripcion,
      volumen: objeto.volumen_estimado,
      peso: objeto.peso_estimado,
      altura: objeto.alto,
      ancho: objeto.ancho,
      profundidad: objeto.largo,
      fragil: objeto.es_fragil,
      embalaje: objeto.necesita_embalaje,
      imagen_url: objeto.imagen_url || 'https://dl.dropboxusercontent.com/scl/fi/07bltx6seeua4hdu0jrwi/istockphoto-1409329028-612x612.jpg?rlkey=hp8ixqvgblc4hzod1dnux3u3e&st=ilprcbvq',
    });
  };

  // Manejar cambio de cantidad
  const handleCantidadChange = (e) => {
    clearError('cantidad');
    const cantidad = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
    setNuevoObjeto({ ...nuevoObjeto, cantidad });
  };

  // Función mejorada para agregar objeto con validación
  const handleAgregarObjeto = () => {
    if (validateNuevoObjeto()) {
      agregarObjeto();
      clearError('objetos');
    }
  };

  const handleImagenSeleccionada = (file) => {
    const nuevaURL = URL.createObjectURL(file);
    setNuevoObjeto((prev) => ({
      ...prev,
      imagen_url: nuevaURL,
      imagen_file: file
    }));
  };

  const objetosIguales = (arr1 = [], arr2 = []) => {
    if (arr1.length !== arr2.length) return false;

    const serialize = (obj) => {
      const { id_tipo, cantidad, imagen_url } = obj;
      return JSON.stringify({ id_tipo, cantidad, imagen_url });
    };

    const sorted1 = [...arr1].map(serialize).sort();
    const sorted2 = [...arr2].map(serialize).sort();

    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
  };

  const handleContinuar = async () => {
    if (!validateContinuar()) return;

    const objetosPrevios = userData?.formularioMudanza?.objetos || [];

    if (objetosIguales(formData.objetos, objetosPrevios)) {
      console.log("No se enviaron datos porque no hubo cambios.");
      nextStep(); // avanza sin enviar
      return;
    }

    const formDataEnviar = new FormData();
    formData.objetos.forEach((obj, index) => {
      formDataEnviar.append(`objetos[${index}][id_tipo]`, obj.id_tipo);
      formDataEnviar.append(`objetos[${index}][cantidad]`, obj.cantidad);
      if (obj.imagen_file) {
        formDataEnviar.append(`objetos[${index}][imagen_file]`, obj.imagen_file);
      } else {
        formDataEnviar.append(`objetos[${index}][imagen_url]`, obj.imagen_url);
      }
    });

    try {
      const response = await axios.post(
        `${API_URL}/objetos/${formData.id_solicitud}/objetos`,
        formDataEnviar,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      console.log("Objetos enviados:", response.data);
      actualzarFormData({ objetos: formData.objetos });
      nextStep();
      return; 
    } catch (error) {
      console.error("Error al enviar los objetos:", error);
      
      // Manejar errores específicos del servidor
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.msg) {
        setErrors({ general: error.response.data.msg });
      } else {
        setErrors({ general: "Ocurrió un error al guardar los objetos. Intente nuevamente." });
      }
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="form-card">
          <h3 className="form-title">CARACTERÍSTICAS DE LOS OBJETOS</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Categoría:</label>
                <select
                  className={`form-select ${errors.categoria ? 'form-input-error' : ''}`}
                  value={nuevoObjeto.categoria || ''}
                  onChange={(e) => handleCategoriaChange(e.target.value)}
                >
                  <option value="">Seleccione una categoría</option>
                  {categoriasDisponibles.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.categoria && <p className="form-error">{errors.categoria}</p>}
              </div>

              <div>
                <label className="form-label">Variante / Tamaño:</label>
                <select
                  className={`form-select ${errors.variante ? 'form-input-error' : ''}`}
                  value={nuevoObjeto.variante || ''}
                  onChange={(e) => handleVarianteChange(e.target.value)}
                  disabled={!nuevoObjeto.categoria}
                >
                  <option value="">Seleccione una variante</option>
                  {variantesFiltradas.map((obj, i) => (
                    <option key={i} value={obj.variante}>{obj.variante}</option>
                  ))}
                </select>
                {errors.variante && <p className="form-error">{errors.variante}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Cantidad:</label>
              <input
                type="number"
                min="1"
                max="50"
                className={`form-input ${errors.cantidad ? 'form-input-error' : ''}`}
                value={nuevoObjeto.cantidad || '1'}
                onChange={handleCantidadChange}
              />
              {errors.cantidad && <p className="form-error">{errors.cantidad}</p>}
            </div>

            <div>
              <label className="form-label">Descripción:</label>
              <input
                type="text"
                value={nuevoObjeto.descripcion || ''}
                readOnly
                className="form-input-readonly"
                placeholder="Se completará automáticamente al seleccionar la variante"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={nuevoObjeto.altura || ''}
                readOnly
                placeholder="Altura"
                className="form-input-readonly"
              />
              <input
                type="number"
                value={nuevoObjeto.ancho || ''}
                readOnly
                placeholder="Ancho"
                className="form-input-readonly"
              />
              <input
                type="number"
                value={nuevoObjeto.profundidad || ''}
                readOnly
                placeholder="Profundidad"
                className="form-input-readonly"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={`Volumen: ${nuevoObjeto.volumen || '?'} m³`}
                readOnly
                className="form-input-readonly"
              />
              <input
                type="text"
                value={`Peso: ${nuevoObjeto.peso || '?'} kg`}
                readOnly
                className="form-input-readonly"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label-small">Frágil:</label>
                <div className="form-status-display">
                  {nuevoObjeto.fragil ? 'Sí' : 'No'}
                </div>
              </div>
              <div>
                <label className="form-label-small">Embalaje:</label>
                <div className="form-status-display">
                  {nuevoObjeto.embalaje ? 'Sí' : 'No'}
                </div>
              </div>
            </div>

            {/* Imagen reorganizada */}
            {nuevoObjeto.variante && (
              <div className="imagen-section">
                <label className="form-label text-center">Imagen del Objeto:</label>
                <div className="flex justify-center">
                  <SubirImagen
                    defaultPreview={nuevoObjeto.imagen_url}
                    onFotoSeleccionada={handleImagenSeleccionada}
                    id_imagen="imagen_objeto"
                    imgClassName="w-32 h-32 sm:w-40 sm:h-40 object-contain rounded-lg border border-gray-300 shadow-sm"
                    editable={true}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleAgregarObjeto}
              className="btn-primary w-full"
            >
              <Plus className="w-5 h-5 mr-2" />
              Agregar Objeto
            </button>
          </div>
        </div>

        {/* Panel de objetos agregados */}
        <div className="form-card">
          <h3 className="form-title">OBJETOS AGREGADOS</h3>

          {/* Mostrar error de objetos si existe */}
          {errors.objetos && (
            <div className="alert-error">
              <p>{errors.objetos}</p>
            </div>
          )}

          {formData.objetos.length === 0 ? (
            <div className="empty-state">
              <p>No hay objetos agregados</p>
              <p className="text-sm">Agregue objetos para continuar</p>
            </div>
          ) : (
            <div className="objetos-list">
              {formData.objetos.map((objeto) => (
                <div key={objeto.id} className="objeto-card">
                  {/* Reorganización: imagen a la izquierda, información a la derecha */}
                  <div className="flex items-start gap-4">
                    {/* Imagen del objeto */}
                    {objeto.imagen_url && (
                      <div className="flex-shrink-0">
                        <SubirImagen
                          defaultPreview={objeto.imagen_url}
                          editable={false}
                          id_imagen={`objeto-${objeto.id}`}
                          imgClassName="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-300 shadow-sm"
                        />
                      </div>
                    )}
                    
                    {/* Información del objeto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="objeto-title">{objeto.descripcion}</div>
                          <div className="objeto-tags">
                            <span className="objeto-tag">
                              {objeto.categoria}
                            </span>
                            <span className="objeto-tag">
                              {objeto.variante}
                            </span>
                            <span className="objeto-tag-quantity">
                              Cant: {objeto.cantidad}
                            </span>
                            {objeto.fragil && (
                              <span className="objeto-tag-fragil">
                                ⚠️ Frágil
                              </span>
                            )}
                          </div>
                          <div className="objeto-dimensions">
                            📏 {objeto.altura} × {objeto.ancho} × {objeto.profundidad} cm
                          </div>
                        </div>
                        
                        {/* Botón eliminar */}
                        <button
                          onClick={() => eliminarObjeto(objeto.id)}
                          className="btn-delete"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mostrar errores generales */}
          {errors.general && (
            <div className="alert-error">
              <p>{errors.general}</p>
            </div>
          )}

          {errors.id_solicitud && (
            <div className="alert-error">
              <p>{errors.id_solicitud}</p>
            </div>
          )}

          <button
            onClick={handleContinuar}
            className="btn-secondary w-full"
          >
            Continuar ({formData.objetos.length} objeto{formData.objetos.length !== 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaracteristicasObjetos;
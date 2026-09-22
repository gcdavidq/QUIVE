import React, { useEffect, useState } from 'react';
import { Plus, X, Package, Boxes, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
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
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
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

  const clearError = (fieldName) => {
    if (errors[fieldName]) {
      setErrors({ ...errors, [fieldName]: '' });
    }
  };

  const validateNuevoObjeto = () => {
    const newErrors = {};
    if (!nuevoObjeto.categoria) newErrors.categoria = 'La categoría es requerida';
    if (!nuevoObjeto.variante) newErrors.variante = 'La variante es requerida';
    if (!nuevoObjeto.cantidad || nuevoObjeto.cantidad < 1) newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    if (nuevoObjeto.cantidad > 50) newErrors.cantidad = 'La cantidad no puede ser mayor a 50';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      imagen_url: objeto.imagen_url || '',
    });
  };

  const handleCantidadChange = (e) => {
    clearError('cantidad');
    const cantidad = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
    setNuevoObjeto({ ...nuevoObjeto, cantidad });
  };

  const handleAgregarObjeto = () => {
    if (validateNuevoObjeto()) {
      agregarObjeto();
      clearError('objetos');
    }
  };

  const objetosIguales = (arr1 = [], arr2 = []) => {
    if (arr1.length !== arr2.length) return false;
    const serialize = (obj) => JSON.stringify({ id_tipo: obj.id_tipo, cantidad: obj.cantidad, imagen_url: obj.imagen_url });
    const sorted1 = [...arr1].map(serialize).sort();
    const sorted2 = [...arr2].map(serialize).sort();
    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
  };

  const handleContinuar = async () => {
    if (!validateContinuar()) return;
    const objetosPrevios = userData?.formularioMudanza?.objetos || [];

    if (objetosIguales(formData.objetos, objetosPrevios)) {
      nextStep();
      return;
    }

    setEnviando(true);
    const formDataEnviar = new FormData();
    formData.objetos.forEach((obj, index) => {
      formDataEnviar.append(`objetos[${index}][id_tipo]`, obj.id_tipo);
      formDataEnviar.append(`objetos[${index}][cantidad]`, obj.cantidad);
      if (obj.imagen_file) {
        formDataEnviar.append(`objetos[${index}][imagen_file]`, obj.imagen_file);
      } else if (obj.imagen_url) {
        formDataEnviar.append(`objetos[${index}][imagen_url]`, obj.imagen_url);
      }
    });

    try {
      await axios.post(
        `${API_URL}/objetos/${formData.id_solicitud}/objetos`,
        formDataEnviar,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      actualzarFormData({ objetos: formData.objetos });
      nextStep();
    } catch (error) {
      console.error("Error al enviar los objetos:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.msg) {
        setErrors({ general: error.response.data.msg });
      } else {
        setErrors({ general: "Ocurrió un error al guardar los objetos. Intente nuevamente." });
      }
    } finally {
      setEnviando(false);
    }
  };

  const volumenTotalEstimado = formData.objetos.reduce((acc, obj) => {
    return acc + ((parseFloat(obj.volumen) || 0) * (parseInt(obj.cantidad) || 1));
  }, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda (7 cols): Selector de Objetos */}
        <div className="surface-card p-6 sm:p-8 lg:col-span-7 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="section-kicker">PASO 2 DE 5 · CUBICAJE DE CARGA</span>
            <h2 className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white mt-1">
              Agregar Muebles y Enseres
            </h2>
            <p className="text-xs text-[#8da3bd] mt-1 mb-6">
              Selecciona cada elemento para calcular con precisión el volumen en m³ y recomendar el camión ideal
            </p>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5">
                    Categoría de Mueble
                  </label>
                  <select
                    className="w-full text-xs font-medium py-3 px-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors"
                    value={nuevoObjeto.categoria || ''}
                    onChange={(e) => handleCategoriaChange(e.target.value)}
                  >
                    <option value="">Seleccione categoría...</option>
                    {categoriasDisponibles.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.categoria && <p className="text-rose-500 text-xs mt-1">{errors.categoria}</p>}
                </div>

                <div>
                  <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5">
                    Variante / Tamaño
                  </label>
                  <select
                    className="w-full text-xs font-medium py-3 px-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors disabled:opacity-50"
                    value={nuevoObjeto.variante || ''}
                    onChange={(e) => handleVarianteChange(e.target.value)}
                    disabled={!nuevoObjeto.categoria}
                  >
                    <option value="">Seleccione tamaño...</option>
                    {variantesFiltradas.map((obj, i) => (
                      <option key={i} value={obj.variante}>{obj.variante}</option>
                    ))}
                  </select>
                  {errors.variante && <p className="text-rose-500 text-xs mt-1">{errors.variante}</p>}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5">
                  Cantidad de Unidades
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  className="w-full text-xs font-medium py-3 px-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors"
                  value={nuevoObjeto.cantidad || '1'}
                  onChange={handleCantidadChange}
                />
                {errors.cantidad && <p className="text-rose-500 text-xs mt-1">{errors.cantidad}</p>}
              </div>

              {/* Especificaciones automáticas de la variante */}
              {nuevoObjeto.variante && (
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136] space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--color-border)]">
                    <span className="font-bold text-[#16365f] dark:text-white">Dimensiones aproximadas:</span>
                    <span className="text-[#4d93f5] font-semibold">
                      {nuevoObjeto.altura} × {nuevoObjeto.ancho} × {nuevoObjeto.profundidad} cm
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8da3bd]">Volumen:</span>
                      <span className="font-bold text-[#16365f] dark:text-white">{nuevoObjeto.volumen} m³</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#8da3bd]">Peso est.:</span>
                      <span className="font-bold text-[#16365f] dark:text-white">{nuevoObjeto.peso} kg</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {nuevoObjeto.fragil && (
                      <span className="status-pill status-orange text-[10px] font-bold">
                        ⚠️ Carga Frágil
                      </span>
                    )}
                    {nuevoObjeto.embalaje && (
                      <span className="status-pill status-blue text-[10px] font-bold">
                        📦 Requiere Embalaje
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAgregarObjeto}
            disabled={!nuevoObjeto.variante}
            className="primary-button w-full !py-3 text-xs font-bold flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            <Plus size={16} />
            <span>Agregar a la Carga</span>
          </button>
        </div>

        {/* Columna Derecha (5 cols): Resumen de Carga y Objetos Agregados */}
        <div className="surface-card p-6 sm:p-8 lg:col-span-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)] mb-4">
              <div>
                <span className="section-kicker">RESUMEN VOLUMÉTRICO</span>
                <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-0.5">
                  Carga Total Registrada
                </h3>
              </div>
              <span className="live-pill text-xs">
                {formData.objetos.length} items
              </span>
            </div>

            {/* Métrica de volumen total */}
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136] mb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8da3be] font-bold uppercase tracking-wider block">
                  Volumen Acumulado
                </span>
                <span className="font-display text-2xl font-extrabold text-[#4d93f5]">
                  {volumenTotalEstimado.toFixed(2)} m³
                </span>
              </div>
              <div className="stat-icon stat-blue !h-10 !w-10">
                <Boxes size={20} />
              </div>
            </div>

            {errors.objetos && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium mb-4 flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{errors.objetos}</span>
              </div>
            )}

            {formData.objetos.length === 0 ? (
              <div className="p-8 text-center rounded-xl border-2 border-dashed border-[var(--color-border)] my-6">
                <Package className="w-10 h-10 text-[#8da3bd] mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold text-[#16365f] dark:text-white">Aún no has agregado objetos</p>
                <p className="text-[11px] text-[#8da3bd] mt-0.5">Selecciona una categoría y variante a la izquierda.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 my-4">
                {formData.objetos.map((objeto) => (
                  <div
                    key={objeto.id}
                    className="p-3 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136] flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#4d93f5] flex items-center justify-center flex-shrink-0">
                        <Package size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#16365f] dark:text-white truncate">
                          {objeto.descripcion}
                        </p>
                        <p className="text-[10px] text-[#8da3bd] truncate">
                          {objeto.categoria} · {objeto.volumen} m³ c/u
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-extrabold text-[#4d93f5] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                        x{objeto.cantidad}
                      </span>
                      <button
                        onClick={() => eliminarObjeto(objeto.id)}
                        className="p-1 text-[#8da3bd] hover:text-rose-500 rounded-md transition-colors"
                        title="Eliminar objeto"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleContinuar}
            disabled={formData.objetos.length === 0 || enviando}
            className="primary-button w-full !py-3.5 text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            <span>{enviando ? 'Guardando cubicaje...' : `Continuar a Selección de Conductor (${formData.objetos.length})`}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaracteristicasObjetos;
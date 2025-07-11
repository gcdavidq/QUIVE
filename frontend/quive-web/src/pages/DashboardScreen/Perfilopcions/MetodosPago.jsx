import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../../../api';

const MetodosPago = ({userData}) => {
  const navigate = useNavigate();
  const [metodosPago, setMetodosPago] = useState([]);
  const [expandedMethodId, setExpandedMethodId] = useState(null);
  const [expandedTypeId, setExpandedTypeId] = useState(null); // Para controlar qué tipo está expandido
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [selectedMethods, setSelectedMethods] = useState({}); // Objeto para almacenar método seleccionado por tipo
  const [newMethod, setNewMethod] = useState({
    tipo: 'Tarjeta',
    numero: '',
    vencimiento: '',
    nombre: '',
    cvv: '',
    codigo: '',
    correo: '',
    contrasena: ''
  });

  // Cargar métodos de pago desde la API y los métodos seleccionados desde localStorage
  useEffect(() => {
    const metodosEnStorage = localStorage.getItem('metodosPago');
    const metodosSeleccionados = localStorage.getItem('metodosSeleccionados');

    const cargarMetodosPago = async () => {
      try {
        const id_usuario = userData.id_usuario;
        const response = await fetch(`${API_URL}/metodos_pago/${id_usuario}`);
        if (!response.ok) throw new Error('Error al cargar métodos de pago');
        const data = await response.json();
        setMetodosPago(data);
        localStorage.setItem('metodosPago', JSON.stringify(data));
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    if (metodosEnStorage) {
      const metodos = JSON.parse(metodosEnStorage);
      setMetodosPago(metodos);
      console.log('Desde localStorage:', metodos);
      setLoading(false);
    } else {
      cargarMetodosPago();
    }

    if (metodosSeleccionados) {
      setSelectedMethods(JSON.parse(metodosSeleccionados));
    }
  }, [userData]);

  // Agrupar métodos por tipo
  const groupedMethods = metodosPago.reduce((acc, metodo) => {
    if (!acc[metodo.tipo]) {
      acc[metodo.tipo] = [];
    }
    acc[metodo.tipo].push(metodo);
    return acc;
  }, {});

  const handleBack = () => {
    navigate('..');
    console.log('Navegando hacia atrás');
  };

  const handleSelectMethod = (metodo) => {
  const currentSelected = selectedMethods[metodo.tipo];

  const isAlreadySelected = currentSelected && currentSelected.id_metodo === metodo.id_metodo;

  const newSelectedMethods = { ...selectedMethods };

  if (isAlreadySelected) {
    // Si ya está seleccionado, lo deselecciono
    delete newSelectedMethods[metodo.tipo];
  } else {
    // Si no está seleccionado, lo selecciono
    newSelectedMethods[metodo.tipo] = metodo;
  }

  setSelectedMethods(newSelectedMethods);
  localStorage.setItem('metodosSeleccionados', JSON.stringify(newSelectedMethods));
};


  const getMethodIcon = (tipo) => {
    switch (tipo) {
      case 'Tarjeta':
        return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'Yape':
        return <Smartphone className="w-5 h-5 text-purple-600" />;
      case 'PayPal':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatCardNumber = (numero) => {
    if (!numero) return '';
    const lastFour = numero.slice(-4);
    return `•••• ${lastFour}`;
  };

  const getMethodDisplayName = (metodo) => {
    switch (metodo.tipo) {
      case 'Tarjeta':
        return `Tarjeta ${formatCardNumber(metodo.detalle.numero)}`;
      case 'Yape':
        return `Yape - ${metodo.detalle.codigo}`;
      case 'PayPal':
        return `PayPal - ${metodo.detalle.correo}`;
      default:
        return metodo.tipo;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: '2-digit', year: '2-digit' });
  };

  const toggleExpandedMethod = (id) => {
    setExpandedMethodId(expandedMethodId === id ? null : id);
  };

  const toggleExpandedType = (tipo) => {
    setExpandedTypeId(expandedTypeId === tipo ? null : tipo);
  };

  const handleAddMethod = async () => {
    if (newMethod.numero.trim() || newMethod.codigo.trim() || newMethod.correo.trim()) {
      try {
        const id_usuario = userData.id_usuario;
        
        const metodoPago = {
          tipo: newMethod.tipo,
          datos: {
            ...(newMethod.tipo === 'Tarjeta' && {
              numero: newMethod.numero,
              vencimiento: newMethod.vencimiento,
              nombre: newMethod.nombre || '',
              cvv: newMethod.cvv || ''
            }),
            ...(newMethod.tipo === 'Yape' && {
              codigo: newMethod.codigo
            }),
            ...(newMethod.tipo === 'PayPal' && {
              correo: newMethod.correo,
              contrasena: newMethod.contrasena
            })
          }
        };

        const response = await fetch(`${API_URL}/metodos_pago/${id_usuario}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metodoPago)
        });

        if (!response.ok) {
          throw new Error('Error al agregar método de pago');
        }

        // Recargar los métodos de pago
        const responseGet = await fetch(`${API_URL}/metodos_pago/${id_usuario}`);
        if (responseGet.ok) {
          const data = await responseGet.json();
          setMetodosPago(data);
          localStorage.setItem('metodosPago', JSON.stringify(data));
        }

        setNewMethod({ tipo: 'Tarjeta', numero: '', vencimiento: '', nombre: '', cvv: '', codigo: '', correo: '', contrasena: '' });
        setShowAddForm(false);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar método de pago: ' + error.message);
      }
    }
  };

  const handleEditMethod = (method) => {
    setEditingMethod(method.id);
    setNewMethod({
      tipo: method.tipo,
      numero: method.detalle.numero || '',
      vencimiento: method.detalle.vencimiento ? method.detalle.vencimiento.split('T')[0] : '',
      nombre: method.detalle.nombre || '',
      cvv: method.detalle.cvv || '',
      codigo: method.detalle.codigo || '',
      correo: method.detalle.correo || '',
      contrasena: method.detalle.contrasena || ''
    });
  };

  const handleUpdateMethod = async () => {
    try {
      const metodoPago = {
        tipo: newMethod.tipo,
        datos: {
          ...(newMethod.tipo === 'Tarjeta' && {
            numero: newMethod.numero,
            vencimiento: newMethod.vencimiento,
            nombre: newMethod.nombre || '',
            cvv: newMethod.cvv || ''
          }),
          ...(newMethod.tipo === 'Yape' && {
            codigo: newMethod.codigo
          }),
          ...(newMethod.tipo === 'PayPal' && {
            correo: newMethod.correo,
            contrasena: newMethod.contrasena
          })
        }
      };

      const response = await fetch(`${API_URL}/metodos_pago/actualizar/${editingMethod}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metodoPago)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar método de pago');
      }

      // Recargar los métodos de pago
      const id_usuario = userData.id_usuario;
      const responseGet = await fetch(`${API_URL}/metodos_pago/${id_usuario}`);
      if (responseGet.ok) {
        const data = await responseGet.json();
        setMetodosPago(data);
        localStorage.setItem('metodosPago', JSON.stringify(data));
        
        // Si el método actualizado era el seleccionado, actualizar localStorage
        const metodoActualizado = data.find(m => m.id === editingMethod);
        if (metodoActualizado && selectedMethods[metodoActualizado.tipo]?.id === editingMethod) {
          const newSelectedMethods = {
            ...selectedMethods,
            [metodoActualizado.tipo]: metodoActualizado
          };
          setSelectedMethods(newSelectedMethods);
          localStorage.setItem('metodosSeleccionados', JSON.stringify(newSelectedMethods));
        }
      }

      setEditingMethod(null);
      setNewMethod({ tipo: 'Tarjeta', numero: '', vencimiento: '', nombre: '', cvv: '', codigo: '', correo: '', contrasena: '' });
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar método de pago: ' + error.message);
    }
  };

  const handleDeleteMethod = async (id) => {
    try {
      const response = await fetch(`${API_URL}/metodos_pago/eliminar/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar método de pago');
      }

      const metodoEliminado = metodosPago.find(m => m.id === id);
      const nuevosMetodos = metodosPago.filter(method => method.id !== id);
      setMetodosPago(nuevosMetodos);
      if (expandedMethodId === id) setExpandedMethodId(null);
      localStorage.setItem('metodosPago', JSON.stringify(nuevosMetodos));

      // Si el método eliminado era el seleccionado, limpiar la selección para ese tipo
      if (metodoEliminado && selectedMethods[metodoEliminado.tipo]?.id === id) {
        const newSelectedMethods = { ...selectedMethods };
        delete newSelectedMethods[metodoEliminado.tipo];
        setSelectedMethods(newSelectedMethods);
        localStorage.setItem('metodosSeleccionados', JSON.stringify(newSelectedMethods));
      }
      if (nuevosMetodos.length === 0) {
        setMetodosPago([]); // Cerrar el tipo si no hay métodos 
        localStorage.removeItem('metodosPago');
        setSelectedMethods({});
        localStorage.removeItem('metodosSeleccionados');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar método de pago: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen theme-bg-primary flex items-center justify-center">
        <div className="theme-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-primary">
      {/* Header */}
      <header className="theme-header border-b theme-border shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 p-2 rounded-full theme-text-secondary hover:theme-text-accent hover:theme-bg-hover transition-all duration-200"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="text-2xl font-bold theme-title-gradient">
              Métodos de Pago
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2 px-4 py-2"
          >
            <Plus size={20} />
            Agregar
          </button>
        </div>
      </header>


      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto">
        {/* Add/Edit Form */}
        {(showAddForm || editingMethod) && (
          <div className="mb-6 theme-card p-6">
            <h3 className="text-lg font-semibold theme-text-primary mb-4">
              {editingMethod ? 'Editar Método' : 'Agregar Método'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">Tipo</label>
                <select
                  value={newMethod.tipo}
                  onChange={(e) => setNewMethod({ ...newMethod, tipo: e.target.value })}
                  className="form-select"
                >
                  <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                  <option value="Yape">Yape</option>
                  <option value="PayPal">PayPal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-2">
                  {newMethod.tipo === 'Tarjeta' 
                    ? 'Número de Tarjeta' 
                    : newMethod.tipo === 'Yape' 
                    ? 'Código Yape' 
                    : 'Correo Electrónico'
                  }
                </label>
                <input
                  type={newMethod.tipo === 'PayPal' ? 'email' : 'text'}
                  value={
                    newMethod.tipo === 'Tarjeta'
                      ? newMethod.numero
                      : newMethod.tipo === 'Yape'
                      ? newMethod.codigo
                      : newMethod.correo
                  }
                  onChange={(e) => {
                    if (newMethod.tipo === 'Tarjeta') {
                      setNewMethod({ ...newMethod, numero: e.target.value });
                    } else if (newMethod.tipo === 'Yape') {
                      setNewMethod({ ...newMethod, codigo: e.target.value });
                    } else {
                      setNewMethod({ ...newMethod, correo: e.target.value });
                    }
                  }}
                  placeholder={
                    newMethod.tipo === 'Tarjeta'
                      ? '1234 5678 9012 3456'
                      : newMethod.tipo === 'Yape'
                      ? 'YAPE0001'
                      : 'usuario@example.com'
                  }
                  className="form-input"
                />
              </div>

              {newMethod.tipo === 'PayPal' && (
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={newMethod.contrasena}
                    onChange={(e) => setNewMethod({ ...newMethod, contrasena: e.target.value })}
                    placeholder="Contraseña de PayPal"
                    className="form-input"
                  />
                </div>
              )}

              {newMethod.tipo === 'Tarjeta' && (
                <>
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">Nombre del Titular</label>
                    <input
                      type="text"
                      value={newMethod.nombre}
                      onChange={(e) => setNewMethod({ ...newMethod, nombre: e.target.value })}
                      placeholder="Juan Pérez"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">CVV</label>
                    <input
                      type="text"
                      value={newMethod.cvv}
                      onChange={(e) => setNewMethod({ ...newMethod, cvv: e.target.value })}
                      placeholder="123"
                      maxLength="4"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium theme-text-secondary mb-2">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={newMethod.vencimiento}
                      onChange={(e) => setNewMethod({ ...newMethod, vencimiento: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={editingMethod ? handleUpdateMethod : handleAddMethod}
                  className="flex-1 py-3 btn-primary"
                >
                  {editingMethod ? 'Actualizar' : 'Agregar'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMethod(null);
                    setNewMethod({
                      tipo: 'Tarjeta',
                      numero: '',
                      vencimiento: '',
                      nombre: '',
                      cvv: '',
                      codigo: '',
                      correo: '',
                      contrasena: ''
                    });
                  }}
                  className="flex-1 py-3 btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods List by Type */}
        <div className="space-y-4">
          {(!showAddForm) && (
            <div className="space-y-4">
              {metodosPago.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 theme-card rounded-full flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="theme-text-secondary text-lg">No tienes métodos de pago registrados</p>
                  <p className="theme-text-secondary text-sm mt-1">Agrega tu primer método de pago</p>
                </div>
              ) : (
                ['Tarjeta', 'Yape', 'PayPal'].map((tipo) => {
                  const metodos = groupedMethods[tipo] || [];
                  return (
                    <div
                      key={tipo}
                      className="theme-card metodo-type-container"
                    >
                      {/* Type Header */}
                      <div
                        className="metodo-type-header"
                        onClick={() => toggleExpandedType(tipo)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="metodo-type-iconbox">
                              {getMethodIcon(tipo)}
                            </div>
                            <div>
                              <div className="metodo-type-title">
                                {tipo}
                              </div>
                              <div className="metodo-type-subtext">
                                {metodos.length} método{metodos.length !== 1 ? 's' : ''} disponible{metodos.length !== 1 ? 's' : ''}
                                {selectedMethods[tipo] && (
                                  <span className="metodo-type-selected">
                                    • {getMethodDisplayName(selectedMethods[tipo])} seleccionado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {expandedTypeId === tipo ? (
                              <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                        </div>
                      </div>


                  {/* Methods of this type */}
                  {expandedTypeId === tipo && (
                    <div className="divide-y theme-border">
                      {metodos.length === 0 ? (
                        <div className="metodo-empty-state">
                          <div className="metodo-icon-container theme-card">
                            {getMethodIcon(tipo)}
                          </div>
                          <p className="metodo-empty-text theme-text-secondary">
                            No tienes métodos de {tipo} registrados
                          </p>
                          <p className="metodo-empty-subtext theme-text-secondary">
                            Agrega tu primer método de {tipo}
                          </p>
                        </div>
                      ) : (
                        metodos.map((metodo) => (
                          <div key={metodo.id} className="theme-card-muted">
                            <div
                              className="p-6 cursor-pointer hover:bg-white/30 dark:hover:bg-white/10 transition-all duration-200"
                              onClick={() => toggleExpandedMethod(metodo.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSelectMethod(metodo);
                                    }}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                      selectedMethods[tipo]?.id === metodo.id
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'theme-border hover:border-blue-400'
                                    }`}
                                  >
                                    {selectedMethods[tipo]?.id === metodo.id && <Check size={14} />}
                                  </button>

                                  <div>
                                    <div className="font-medium theme-text-primary">
                                      {getMethodDisplayName(metodo)}
                                    </div>
                                    <div className="theme-text-secondary text-sm">
                                      {metodo.tipo === 'Tarjeta' &&
                                        metodo.detalle.vencimiento &&
                                        `Vence ${formatDate(metodo.detalle.vencimiento)}`}
                                      {metodo.detalle.saldo && (
                                        <span className="ml-2 text-green-600 dark:text-green-400 font-medium">
                                          Saldo: S/ {metodo.detalle.saldo}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditMethod(metodo);
                                    }}
                                    className="metodo-action-button"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMethod(metodo.id);
                                    }}
                                    className="metodo-action-button delete"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                  {expandedMethodId === metodo.id ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Detalles expandibles */}
                            {expandedMethodId === metodo.id && (
                              <div className="px-6 pb-6 border-t theme-border">
                                <div className="pt-4 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="theme-card p-4 rounded-xl">
                                      <div className="text-sm font-medium theme-text-secondary mb-1">Tipo</div>
                                      <div className="theme-text-primary font-semibold">{metodo.tipo}</div>
                                    </div>
                                    {metodo.detalle.saldo && (
                                      <div className="theme-card p-4 rounded-xl">
                                        <div className="text-sm font-medium theme-text-secondary mb-1">Saldo Disponible</div>
                                        <div className="theme-text-primary font-semibold">S/ {metodo.detalle.saldo}</div>
                                      </div>
                                    )}
                                  </div>

                                  {metodo.tipo === 'Tarjeta' && (
                                    <>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="theme-card p-4 rounded-xl">
                                          <div className="text-sm font-medium theme-text-secondary mb-1">Titular</div>
                                          <div className="theme-text-primary font-semibold">
                                            {metodo.detalle.nombre || 'No especificado'}
                                          </div>
                                        </div>
                                        <div className="theme-card p-4 rounded-xl">
                                          <div className="text-sm font-medium theme-text-secondary mb-1">Número completo</div>
                                          <div className="theme-text-primary font-semibold font-mono">
                                            {metodo.detalle.numero.replace(/(.{4})/g, '$1 ').trim()}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {metodo.detalle.vencimiento && (
                                          <div className="theme-card p-4 rounded-xl">
                                            <div className="text-sm font-medium theme-text-secondary mb-1">Fecha de Vencimiento</div>
                                            <div className="theme-text-primary font-semibold">
                                              {new Date(metodo.detalle.vencimiento).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                              })}
                                            </div>
                                          </div>
                                        )}
                                        {metodo.detalle.cvv && (
                                          <div className="theme-card p-4 rounded-xl">
                                            <div className="text-sm font-medium theme-text-secondary mb-1">CVV</div>
                                            <div className="theme-text-primary font-semibold font-mono">•••</div>
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}

                                  {metodo.tipo === 'Yape' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="theme-card p-4 rounded-xl">
                                        <div className="text-sm font-medium theme-text-secondary mb-1">Código Yape</div>
                                        <div className="theme-text-primary font-semibold font-mono">{metodo.detalle.codigo}</div>
                                      </div>
                                      <div className="theme-card p-4 rounded-xl">
                                        <div className="text-sm font-medium theme-text-secondary mb-1">Estado</div>
                                        <div className="theme-text-primary font-semibold">
                                          {metodo.detalle.activo ? (
                                            <span className="text-green-600 dark:text-green-400 font-medium">✓ Activo</span>
                                          ) : (
                                            <span className="text-red-600 dark:text-red-400 font-medium">✗ Inactivo</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {metodo.tipo === 'PayPal' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="theme-card p-4 rounded-xl">
                                        <div className="text-sm font-medium theme-text-secondary mb-1">Correo Electrónico</div>
                                        <div className="theme-text-primary font-semibold">{metodo.detalle.correo}</div>
                                      </div>
                                      <div className="theme-card p-4 rounded-xl">
                                        <div className="text-sm font-medium theme-text-secondary mb-1">Contraseña</div>
                                        <div className="theme-text-primary font-semibold font-mono">••••••••</div>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                      )}
                    </div>
                  )}
                </div>
              );
              })
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetodosPago;
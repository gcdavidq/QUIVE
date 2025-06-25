import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Plus, Edit2, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const MetodosPago = () => {
  const navigate = useNavigate();
  const [metodosPago, setMetodosPago] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [selectedMethodId, setSelectedMethodId] = useState(null);
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

  // Cargar métodos de pago desde la API y el método seleccionado desde localStorage
  useEffect(() => {
    const cargarMetodosPago = async () => {
      try {
        // Aquí deberías obtener el id_usuario desde el contexto, localStorage, o props
        const id_usuario = 1; // Reemplazar con el ID real del usuario
        
        const response = await fetch(`http://127.0.0.1:5000/metodos_pago/${id_usuario}`);
        if (!response.ok) {
          throw new Error('Error al cargar métodos de pago');
        }
        
        const data = await response.json();
        setMetodosPago(data);
        
        // Cargar el método seleccionado desde localStorage
        const metodoSeleccionado = localStorage.getItem('metodoPagoSeleccionado');
        if (metodoSeleccionado) {
          const metodo = JSON.parse(metodoSeleccionado);
          setSelectedMethodId(metodo.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    };

    cargarMetodosPago();
  }, []);

  const handleBack = () => {
    navigate('..');
    console.log('Navegando hacia atrás');
  };

  const handleSelectMethod = (metodo) => {
    setSelectedMethodId(metodo.id);
    localStorage.setItem('metodoPagoSeleccionado', JSON.stringify(metodo));
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

  const toggleExpanded = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAddMethod = async () => {
    if (newMethod.numero.trim() || newMethod.codigo.trim() || newMethod.correo.trim()) {
      try {
        const id_usuario = 1; // Reemplazar con el ID real del usuario
        
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

        const response = await fetch(`http://127.0.0.1:5000/metodos_pago/${id_usuario}`, {
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
        const responseGet = await fetch(`http://127.0.0.1:5000/metodos_pago/${id_usuario}`);
        if (responseGet.ok) {
          const data = await responseGet.json();
          setMetodosPago(data);
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

      const response = await fetch(`http://127.0.0.1:5000/metodos_pago/actualizar/${editingMethod}`, {
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
      const id_usuario = 1; // Reemplazar con el ID real del usuario
      const responseGet = await fetch(`http://127.0.0.1:5000/metodos_pago/${id_usuario}`);
      if (responseGet.ok) {
        const data = await responseGet.json();
        setMetodosPago(data);
        
        // Si el método actualizado era el seleccionado, actualizar localStorage
        if (selectedMethodId === editingMethod) {
          const metodoActualizado = data.find(m => m.id === editingMethod);
          if (metodoActualizado) {
            localStorage.setItem('metodoPagoSeleccionado', JSON.stringify(metodoActualizado));
          }
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
      const response = await fetch(`http://127.0.0.1:5000/metodos_pago/eliminar/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar método de pago');
      }

      setMetodosPago(metodosPago.filter(method => method.id !== id));
      if (expandedId === id) setExpandedId(null);
      
      // Si el método eliminado era el seleccionado, limpiar la selección
      if (selectedMethodId === id) {
        setSelectedMethodId(null);
        localStorage.removeItem('metodoPagoSeleccionado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar método de pago: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleBack}
              className="mr-4 p-2 rounded-full text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Métodos de Pago
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingMethod ? 'Editar Método' : 'Agregar Método'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={newMethod.tipo}
                  onChange={(e) => setNewMethod({ ...newMethod, tipo: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                  <option value="Yape">Yape</option>
                  <option value="PayPal">PayPal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {newMethod.tipo === 'Tarjeta' 
                    ? 'Número de Tarjeta' 
                    : newMethod.tipo === 'Yape' 
                    ? 'Código Yape' 
                    : 'Correo Electrónico'
                  }
                </label>
                <input
                  type={newMethod.tipo === 'PayPal' ? 'email' : 'text'}
                  value={newMethod.tipo === 'Tarjeta' ? newMethod.numero : newMethod.tipo === 'Yape' ? newMethod.codigo : newMethod.correo}
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
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              {newMethod.tipo === 'PayPal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={newMethod.contrasena}
                    onChange={(e) => setNewMethod({ ...newMethod, contrasena: e.target.value })}
                    placeholder="Contraseña de PayPal"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              )}
              {newMethod.tipo === 'Tarjeta' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Titular</label>
                    <input
                      type="text"
                      value={newMethod.nombre}
                      onChange={(e) => setNewMethod({ ...newMethod, nombre: e.target.value })}
                      placeholder="Juan Pérez"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      value={newMethod.cvv}
                      onChange={(e) => setNewMethod({ ...newMethod, cvv: e.target.value })}
                      placeholder="123"
                      maxLength="4"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento</label>
                    <input
                      type="date"
                      value={newMethod.vencimiento}
                      onChange={(e) => setNewMethod({ ...newMethod, vencimiento: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={editingMethod ? handleUpdateMethod : handleAddMethod}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  {editingMethod ? 'Actualizar' : 'Agregar'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMethod(null);
                    setNewMethod({ tipo: 'Tarjeta', numero: '', vencimiento: '', nombre: '', cvv: '', codigo: '', correo: '', contrasena: '' });
                  }}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods List */}
        <div className="space-y-4">
          {metodosPago.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No tienes métodos de pago registrados</p>
              <p className="text-gray-400 text-sm mt-1">Agrega tu primer método de pago</p>
            </div>
          ) : (
            metodosPago.map((metodo) => (
              <div
                key={metodo.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                {/* Main Method Display */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50/50 transition-all duration-200"
                  onClick={() => toggleExpanded(metodo.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Botón de selección circular */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectMethod(metodo);
                        }}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedMethodId === metodo.id
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {selectedMethodId === metodo.id && (
                          <Check size={14} />
                        )}
                      </button>
                      
                      <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                        {getMethodIcon(metodo.tipo)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800 text-lg">
                          {getMethodDisplayName(metodo)}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {metodo.tipo === 'Tarjeta' && metodo.detalle.vencimiento && 
                            `Vence ${formatDate(metodo.detalle.vencimiento)}`
                          }
                          {metodo.detalle.saldo && (
                            <span className="ml-2 text-green-600 font-medium">
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
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMethod(metodo.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 size={18} />
                      </button>
                      {expandedId === metodo.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === metodo.id && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="pt-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                          <div className="text-sm font-medium text-gray-600 mb-1">Tipo</div>
                          <div className="text-gray-900 font-semibold">{metodo.tipo}</div>
                        </div>
                        {metodo.detalle.saldo && (
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                            <div className="text-sm font-medium text-gray-600 mb-1">Saldo Disponible</div>
                            <div className="text-gray-900 font-semibold">S/ {metodo.detalle.saldo}</div>
                          </div>
                        )}
                      </div>

                      {/* Detalles específicos por tipo */}
                      {metodo.tipo === 'Tarjeta' && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                              <div className="text-sm font-medium text-gray-600 mb-1">Titular</div>
                              <div className="text-gray-900 font-semibold">{metodo.detalle.nombre || 'No especificado'}</div>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl">
                              <div className="text-sm font-medium text-gray-600 mb-1">Número completo</div>
                              <div className="text-gray-900 font-semibold font-mono">
                                {metodo.detalle.numero.replace(/(.{4})/g, '$1 ').trim()}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {metodo.detalle.vencimiento && (
                              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl">
                                <div className="text-sm font-medium text-gray-600 mb-1">Fecha de Vencimiento</div>
                                <div className="text-gray-900 font-semibold">
                                  {new Date(metodo.detalle.vencimiento).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                            )}
                            {metodo.detalle.cvv && (
                              <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl">
                                <div className="text-sm font-medium text-gray-600 mb-1">CVV</div>
                                <div className="text-gray-900 font-semibold font-mono">•••</div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {metodo.tipo === 'Yape' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-xl">
                            <div className="text-sm font-medium text-gray-600 mb-1">Código Yape</div>
                            <div className="text-gray-900 font-semibold font-mono">{metodo.detalle.codigo}</div>
                          </div>
                          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl">
                            <div className="text-sm font-medium text-gray-600 mb-1">Estado</div>
                            <div className="text-gray-900 font-semibold">
                              {metodo.detalle.activo ? (
                                <span className="text-green-600">✓ Activo</span>
                              ) : (
                                <span className="text-red-600">✗ Inactivo</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {metodo.tipo === 'PayPal' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                            <div className="text-sm font-medium text-gray-600 mb-1">Correo Electrónico</div>
                            <div className="text-gray-900 font-semibold">{metodo.detalle.correo}</div>
                          </div>
                          <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl">
                            <div className="text-sm font-medium text-gray-600 mb-1">Contraseña</div>
                            <div className="text-gray-900 font-semibold font-mono">••••••••</div>
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
      </div>
    </div>
  );
};

export default MetodosPago;
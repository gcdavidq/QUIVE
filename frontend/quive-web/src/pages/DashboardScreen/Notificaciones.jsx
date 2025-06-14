import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Notificaciones = ({ userData }) => {
  const navigate = useNavigate();
  const [asignaciones, setAsignaciones] = useState([]);

  useEffect(() => {
    if (!userData?.id_usuario || !userData?.tipo_usuario) return;
    axios.get(`http://localhost:5000/asignaciones/${userData.id_usuario}/${userData.tipo_usuario}`)
      .then(res => setAsignaciones(res.data));
  }, [userData]);

  const responder = (id_asignacion, estado) => {
    axios.post(`http://localhost:5000/asignaciones/${id_asignacion}/respuesta`, { estado })
      .then(() => {
        setAsignaciones(prev =>
          prev.map(a => a.id_asignacion === id_asignacion ? { ...a, estado } : a)
        );
      });
  };

  const colorEstado = (estado) => {
    if (estado === 'confirmado') return 'bg-green-100 text-green-700';
    if (estado === 'rechazado') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-blue-600 flex items-center space-x-2">
            <Bell className="w-6 h-6 text-blue-500" />
            <span>Notificaciones</span>
          </h2>
          <button
            onClick={() => navigate('..')}
            className="text-gray-500 hover:text-red-500 transition"
            type="button"
            aria-label="Cerrar notificaciones"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenedor scrolleable */}
        <div className="overflow-y-auto space-y-4 pr-1" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {asignaciones.map(asignacion => (
            <div key={asignacion.id_asignacion} className="bg-white p-4 rounded shadow border">
              <p><strong>Origen:</strong> {asignacion.origen}</p>
              <p><strong>Destino:</strong> {asignacion.destino}</p>
              <p><strong>Precio:</strong> S/ {asignacion.precio}</p>
              <p><strong>Fecha:</strong> {new Date(asignacion.fecha).toLocaleDateString()}</p>

              {asignacion.estado === 'pendiente' ? (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => responder(asignacion.id_asignacion, 'confirmado')}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    type="button"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => responder(asignacion.id_asignacion, 'rechazado')}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    type="button"
                  >
                    Rechazar
                  </button>
                </div>
              ) : (
                <div className={`mt-2 px-2 py-1 rounded text-sm inline-block ${colorEstado(asignacion.estado)}`}>
                  {asignacion.estado.toUpperCase()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Notificaciones;

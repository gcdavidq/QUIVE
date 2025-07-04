import React, { useEffect, useState } from 'react';
import { Bell, X, CalendarClock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import API_URL from '../../api';

dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const Notificaciones = ({ userData, onNotificacionLeida }) => {
  const navigate = useNavigate();
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    if (!userData?.id_usuario) return;
    axios
      .get(`${API_URL}/notificaciones/${userData.id_usuario}`)
      .then((res) => setNotificaciones(res.data))
      .catch((err) => console.error("Error al obtener notificaciones:", err));
  }, [userData]);

  const marcarComoLeida = (id_notificacion) => {
    axios
      .patch(`${API_URL}/notificaciones/${id_notificacion}/leido`)
      .then(() => {
        setNotificaciones((prev) =>
          prev.map((n) =>
            n.id_notificacion === id_notificacion
              ? { ...n, leido: true }
              : n
          )
        );
        if (onNotificacionLeida) {
          onNotificacionLeida();
        }
      });
  };

  const agruparNotificaciones = (notis) => {
    const hoy = [];
    const ayer = [];
    const semana = [];
    const mes = [];
    const antiguos = [];

    const ahora = dayjs();
    const fechaAyer = ahora.subtract(1, 'day');
    const startOfWeek = ahora.startOf('week');
    const startOfMonth = ahora.startOf('month');

    notis.forEach((n) => {
      const fecha = dayjs(n.fecha);
      if (fecha.isToday()) hoy.push(n);
      else if (fecha.isSame(fechaAyer, 'day')) ayer.push(n);
      else if (fecha.isSameOrAfter(startOfWeek)) semana.push(n);
      else if (fecha.isSameOrAfter(startOfMonth)) mes.push(n);
      else antiguos.push(n);
    });

    return [
      { titulo: 'Hoy', data: hoy },
      { titulo: 'Ayer', data: ayer },
      { titulo: 'Esta semana', data: semana },
      { titulo: 'Este mes', data: mes },
      { titulo: 'Más antiguas', data: antiguos },
    ].filter((grupo) => grupo.data.length > 0);
  };

  const grupos = agruparNotificaciones(notificaciones);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[150] bg-black/30 backdrop-blur-sm"
      onClick={() => navigate('..')}
    >
      <div
        className="theme-card rounded-2xl w-[90%] md:w-[60%] p-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold theme-title-primary flex items-center gap-2">
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

        {/* Contenido */}
        <div className="overflow-y-auto pr-1 space-y-6" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {grupos.length === 0 ? (
            <p className="theme-text-secondary text-sm text-center py-4">
              No tienes notificaciones.
            </p>
          ) : (
            grupos.map((grupo, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold theme-text-secondary mb-2">{grupo.titulo}</h3>
                <div className="space-y-3">
                  {grupo.data.map((noti) => (
                    <div
                      key={noti.id_notificacion}
                      className={`p-4 rounded-lg transition border ${
                        noti.leido
                          ? 'theme-bg-secondary theme-border shadow-sm'
                          : 'theme-card border-blue-500 shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Info className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm theme-text-primary">{noti.mensaje}</p>
                            <p className="text-xs theme-text-secondary flex items-center mt-1">
                              <CalendarClock className="w-3 h-3 mr-1" />
                              {dayjs(noti.fecha).format('DD/MM/YYYY HH:mm')}
                            </p>
                          </div>
                        </div>
                        {!noti.leido && (
                          <button
                            onClick={() => marcarComoLeida(noti.id_notificacion)}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Marcar como leída
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notificaciones;

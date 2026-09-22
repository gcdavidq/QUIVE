import React, { useEffect, useState } from 'react';
import { Bell, CalendarClock, CheckCheck, Inbox, RefreshCw } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import API_URL from '../../api';

dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);

const agruparNotificaciones = (notis) => {
  const grupos = { Hoy: [], Ayer: [], 'Esta semana': [], 'Este mes': [], 'Más antiguas': [] };
  const ahora = dayjs();

  notis.forEach((n) => {
    const fecha = dayjs(n.fecha);
    if (fecha.isToday()) grupos.Hoy.push(n);
    else if (fecha.isSame(ahora.subtract(1, 'day'), 'day')) grupos.Ayer.push(n);
    else if (fecha.isSameOrAfter(ahora.startOf('week'))) grupos['Esta semana'].push(n);
    else if (fecha.isSameOrAfter(ahora.startOf('month'))) grupos['Este mes'].push(n);
    else grupos['Más antiguas'].push(n);
  });

  return Object.entries(grupos)
    .map(([titulo, data]) => ({ titulo, data }))
    .filter((grupo) => grupo.data.length > 0);
};

const Notificaciones = ({ userData, onNotificacionLeida }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.id_usuario) return;
    axios
      .get(`${API_URL}/notificaciones/${userData.id_usuario}`)
      .then((res) => setNotificaciones(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Error al obtener notificaciones:", err))
      .finally(() => setLoading(false));
  }, [userData?.id_usuario]);

  const marcarComoLeida = (id_notificacion) => {
    axios
      .patch(`${API_URL}/notificaciones/${id_notificacion}/leido`)
      .then(() => {
        setNotificaciones((prev) =>
          prev.map((n) => (n.id_notificacion === id_notificacion ? { ...n, leido: true } : n))
        );
        if (onNotificacionLeida) onNotificacionLeida();
      })
      .catch((err) => console.error("Error al marcar como leída:", err));
  };

  const grupos = agruparNotificaciones(notificaciones);
  const unreadCount = notificaciones.filter((n) => !n.leido).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="surface-card p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="stat-icon stat-blue !h-11 !w-11"><Bell size={20} /></div>
          <div>
            <span className="section-kicker">COMUNICACIÓN</span>
            <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white mt-0.5">Notificaciones</h1>
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="status-pill status-blue">{unreadCount} sin leer</span>
        )}
      </div>

      {loading ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <RefreshCw className="animate-spin text-[#4d93f5] mx-auto mb-3" size={28} />
          <p className="text-sm font-semibold theme-text-primary">Cargando notificaciones...</p>
        </div>
      ) : grupos.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#4d93f5] flex items-center justify-center mx-auto mb-4">
            <Inbox size={28} />
          </div>
          <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white">No tienes notificaciones</h3>
          <p className="text-xs text-[#8da3bd] max-w-md mx-auto mt-1">
            Te avisaremos aquí cuando cambie el estado de alguno de tus servicios.
          </p>
        </div>
      ) : (
        grupos.map((grupo) => (
          <div key={grupo.titulo} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="section-kicker">{grupo.titulo}</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>
            {grupo.data.map((noti) => (
              <div
                key={noti.id_notificacion}
                className={`surface-card p-4 rounded-2xl flex items-start justify-between gap-3 ${
                  noti.leido ? 'opacity-75' : 'border-l-4 !border-l-[#4d93f5]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`stat-icon !h-8 !w-8 flex-shrink-0 ${noti.leido ? 'stat-mint' : 'stat-blue'}`}>
                    {noti.leido ? <CheckCheck size={15} /> : <Bell size={15} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium theme-text-primary leading-relaxed">{noti.mensaje}</p>
                    <p className="text-[11px] text-[#8da3bd] flex items-center mt-1 gap-1.5">
                      <CalendarClock size={12} />
                      <span>{dayjs(noti.fecha).format('DD/MM/YYYY hh:mm A')}</span>
                    </p>
                  </div>
                </div>
                {!noti.leido && (
                  <button onClick={() => marcarComoLeida(noti.id_notificacion)} className="subtle-button flex-shrink-0">
                    <CheckCheck size={14} />
                    <span className="hidden sm:inline">Marcar leída</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default Notificaciones;

import React, { useMemo, useState } from 'react';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { ESTADOS_SERVICIO, ORDEN_ESTADOS } from '../../../utils/estadoServicio';

const selectClass = "w-full text-sm font-medium py-2 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors";

// Cabecera + filtros + lista. El contenido de cada fila lo decide la pantalla del rol.
const ListaServicios = ({ kicker, titulo, descripcion, accionCabecera = null, servicios, cargando, error, vacio, renderServicio }) => {
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [orden, setOrden] = useState('recientes');

  const visibles = useMemo(() => {
    const lista = servicios.filter((s) => filtroEstado === 'todos' || s.estado_servicio === filtroEstado);
    const comparadores = {
      recientes: (a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora),
      antiguos: (a, b) => new Date(a.fecha_hora) - new Date(b.fecha_hora),
      menor: (a, b) => parseFloat(a.precio) - parseFloat(b.precio),
      mayor: (a, b) => parseFloat(b.precio) - parseFloat(a.precio),
    };
    return [...lista].sort(comparadores[orden]);
  }, [servicios, filtroEstado, orden]);

  return (
    <div className="space-y-6">
      <div className="surface-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="section-kicker">{kicker}</span>
          <div className="flex items-center gap-3 mt-0.5">
            <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white">{titulo}</h1>
            {cargando
              ? <RefreshCw className="text-[#4d93f5] animate-spin" size={16} />
              : <span className="live-pill"><span className="live-dot" /> {visibles.length} {visibles.length === 1 ? 'registro' : 'registros'}</span>}
          </div>
          <p className="text-xs text-[#8da3bd] mt-1">{descripcion}</p>
        </div>
        {accionCabecera}
      </div>

      <div className="surface-card rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="section-kicker block mb-1.5">Filtrar por estado</label>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className={selectClass}>
            <option value="todos">Todos los estados</option>
            {ORDEN_ESTADOS.map((e) => <option key={e} value={e}>{ESTADOS_SERVICIO[e].texto}</option>)}
          </select>
        </div>
        <div>
          <label className="section-kicker block mb-1.5">Ordenar por</label>
          <select value={orden} onChange={(e) => setOrden(e.target.value)} className={selectClass}>
            <option value="recientes">Fecha: más recientes primero</option>
            <option value="antiguos">Fecha: más antiguos primero</option>
            <option value="menor">Precio: menor a mayor</option>
            <option value="mayor">Precio: mayor a menor</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle size={15} /> <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        {!cargando && visibles.length === 0 ? (
          <div className="surface-card rounded-2xl text-center py-14 px-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#4d93f5] flex items-center justify-center mx-auto mb-3">
              <MapPin size={24} />
            </div>
            <p className="text-base font-semibold theme-text-primary">{servicios.length === 0 ? vacio.titulo : 'Nada coincide con el filtro'}</p>
            <p className="text-sm theme-text-secondary mt-1 max-w-md mx-auto">
              {servicios.length === 0 ? vacio.texto : 'Prueba con otro estado para ver el resto de tus servicios.'}
            </p>
          </div>
        ) : visibles.map(renderServicio)}
      </div>
    </div>
  );
};

export default ListaServicios;

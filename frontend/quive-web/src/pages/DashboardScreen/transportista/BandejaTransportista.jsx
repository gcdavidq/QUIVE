import React, { useState } from 'react';
import { X, CreditCard, AlertCircle, Play, Flag, Star } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../../api';
import useMisServicios from '../../../hooks/useMisServicios';
import useMetodosPago from '../../../hooks/useMetodosPago';
import useCalificacionesDadas from '../../../hooks/useCalificacionesDadas';
import PaymentMethodSelector from '../../utils/PaymentMethodSelector';
import ListaServicios from '../compartido/ListaServicios';
import ServicioCard from '../compartido/ServicioCard';
import CalificarModal from '../compartido/CalificarModal';

const mensajeDeError = (err, porDefecto) => err.response?.data?.msg || porDefecto;

// Vista del TRANSPORTISTA: solicitudes que le asignaron los clientes y las acciones
// propias de su rol (aceptar con método de cobro, rechazar, iniciar y finalizar el traslado).
const BandejaTransportista = ({ userData, setActiveTab }) => {
  const { servicios, cargando, error, recargar } = useMisServicios(userData, { intervaloMs: 30000 });
  const { metodos, cargando: cargandoMetodos } = useMetodosPago(userData);
  const { calificadas, recargar: recargarCalificaciones } = useCalificacionesDadas(userData);

  const [procesando, setProcesando] = useState(null);
  const [porAceptar, setPorAceptar] = useState(null);
  const [metodoCobro, setMetodoCobro] = useState(null);
  const [porCalificar, setPorCalificar] = useState(null);
  const [aviso, setAviso] = useState('');

  const ejecutar = async (id_asignacion, accion, errorPorDefecto) => {
    if (procesando) return;
    setProcesando(id_asignacion);
    try {
      await accion();
    } catch (err) {
      console.error(err);
      setAviso(mensajeDeError(err, errorPorDefecto));
    } finally {
      setProcesando(null);
      recargar();
    }
  };

  const rechazar = (s) => ejecutar(s.id_asignacion,
    () => axios.post(`${API_URL}/asignaciones/${s.id_asignacion}/respuesta`, { estado: 'rechazada' }),
    'No se pudo rechazar la solicitud.');

  const confirmarAceptacion = () => {
    const s = porAceptar;
    const metodo = metodoCobro;
    setPorAceptar(null);
    return ejecutar(s.id_asignacion,
      () => axios.post(`${API_URL}/asignaciones/${s.id_asignacion}/respuesta`, {
        estado: 'confirmada',
        metodo_pago: { id: metodo.id },
        tipo_metodo: metodo.tipo,
      }),
      'No se pudo aceptar la solicitud.');
  };

  const cambiarTraslado = (s, estado) => ejecutar(s.id_asignacion,
    () => axios.put(`${API_URL}/solicitudes/actualizar_estado/${s.id_solicitud}`, { estado }),
    'No se pudo actualizar el traslado.');

  const acciones = (s) => {
    const ocupado = procesando === s.id_asignacion;
    switch (s.estado_servicio) {
      case 'pendiente':
        return (
          <>
            <button
              onClick={() => { setMetodoCobro(metodos[0] || null); setPorAceptar(s); }}
              disabled={ocupado}
              className="primary-button text-xs !py-2 !px-4 !bg-emerald-600 hover:!bg-emerald-700 disabled:opacity-50"
            >
              {ocupado ? 'Procesando...' : 'Aceptar servicio'}
            </button>
            <button onClick={() => rechazar(s)} disabled={ocupado} className="subtle-button !text-rose-600 dark:!text-rose-400 disabled:opacity-50">
              Rechazar
            </button>
          </>
        );
      case 'aceptada':
        return <span className="text-xs theme-text-secondary italic">Esperando el pago del cliente</span>;
      case 'confirmada':
        return (
          <button onClick={() => cambiarTraslado(s, 'activa')} disabled={ocupado} className="primary-button text-xs !py-2 !px-4 disabled:opacity-50">
            <Play size={14} /> <span>{ocupado ? 'Procesando...' : 'Iniciar traslado'}</span>
          </button>
        );
      case 'activa':
        return (
          <>
            <button onClick={() => setActiveTab('seguimiento')} className="secondary-button">Ver ruta y GPS</button>
            <button onClick={() => cambiarTraslado(s, 'finalizada')} disabled={ocupado} className="primary-button text-xs !py-2 !px-4 disabled:opacity-50">
              <Flag size={14} /> <span>{ocupado ? 'Procesando...' : 'Marcar como entregado'}</span>
            </button>
          </>
        );
      case 'finalizada':
        return calificadas.has(s.id_asignacion)
          ? <span className="text-xs theme-text-secondary italic">Ya calificaste a este cliente</span>
          : (
            <button onClick={() => setPorCalificar(s)} className="secondary-button">
              <Star size={14} /> <span>Calificar cliente</span>
            </button>
          );
      default:
        return null;
    }
  };

  return (
    <>
      <ListaServicios
        kicker="BANDEJA OPERATIVA"
        titulo="Solicitudes asignadas"
        descripcion="Solicitudes de mudanza que los clientes te enviaron. Acepta, ejecuta y cierra cada traslado desde aquí."
        servicios={servicios}
        cargando={cargando}
        error={error}
        vacio={{
          titulo: 'No tienes solicitudes asignadas',
          texto: 'Cuando un cliente te elija para su mudanza, la solicitud aparecerá aquí para que la aceptes o la rechaces.',
        }}
        renderServicio={(s) => (
          <ServicioCard key={s.id_asignacion} servicio={s} etiquetaContraparte="Cliente solicitante" acciones={acciones(s)} />
        )}
      />

      {aviso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c1f36]/50 backdrop-blur-sm p-4" onClick={() => setAviso('')}>
          <div className="surface-card p-6 rounded-2xl max-w-md w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={26} />
            </div>
            <h3 className="font-display text-lg font-bold theme-text-primary mb-2">No se pudo completar</h3>
            <p className="text-sm theme-text-secondary mb-6">{aviso}</p>
            <button onClick={() => setAviso('')} className="primary-button w-full justify-center !py-2.5">Entendido</button>
          </div>
        </div>
      )}

      {porAceptar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c1f36]/50 backdrop-blur-sm p-4">
          <div className="surface-card p-6 rounded-2xl max-w-lg w-full relative shadow-2xl max-h-[85vh] overflow-y-auto">
            <button onClick={() => setPorAceptar(null)} className="icon-button h-8 w-8 absolute top-4 right-4" aria-label="Cerrar">
              <X size={16} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="stat-icon stat-mint !h-10 !w-10"><CreditCard size={18} /></div>
              <div>
                <span className="section-kicker">MÉTODO DE COBRO</span>
                <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white">¿Dónde recibes el pago?</h3>
              </div>
            </div>

            <PaymentMethodSelector
              metodos={metodos}
              cargando={cargandoMetodos}
              metodoSeleccionadoId={metodoCobro?.id}
              onSeleccionar={setMetodoCobro}
              onGestionarMetodos={() => { setPorAceptar(null); setActiveTab('perfil/pagos'); }}
            />

            <div className="flex gap-3 mt-5">
              <button onClick={() => setPorAceptar(null)} className="secondary-button flex-1 justify-center !py-2.5">Cancelar</button>
              <button onClick={confirmarAceptacion} disabled={!metodoCobro} className="primary-button flex-1 justify-center !py-2.5 disabled:opacity-50">
                Aceptar servicio
              </button>
            </div>
          </div>
        </div>
      )}

      {porCalificar && (
        <CalificarModal
          servicio={porCalificar}
          onCerrar={() => setPorCalificar(null)}
          onCalificado={() => { setPorCalificar(null); recargarCalificaciones(); recargar(); }}
        />
      )}
    </>
  );
};

export default BandejaTransportista;

import React, { useState } from 'react';
import { Plus, Star, Navigation, CreditCard } from 'lucide-react';
import useMisServicios from '../../../hooks/useMisServicios';
import useCalificacionesDadas from '../../../hooks/useCalificacionesDadas';
import ListaServicios from '../compartido/ListaServicios';
import ServicioCard from '../compartido/ServicioCard';
import CalificarModal from '../compartido/CalificarModal';

// Vista del CLIENTE: sus solicitudes de mudanza y lo que él puede hacer con cada una
// (pagar la que ya aceptó un transportista, seguir la que está en ruta, calificar la finalizada).
const MudanzasCliente = ({ userData, setActiveTab }) => {
  const { servicios, cargando, error, recargar } = useMisServicios(userData, { intervaloMs: 30000 });
  const { calificadas, recargar: recargarCalificaciones } = useCalificacionesDadas(userData);
  const [porCalificar, setPorCalificar] = useState(null);

  const acciones = (s) => {
    switch (s.estado_servicio) {
      case 'pendiente':
        return <span className="text-xs theme-text-secondary italic">Esperando respuesta del transportista</span>;
      case 'aceptada':
        return (
          <button onClick={() => setActiveTab('mudanza')} className="primary-button text-xs !py-2 !px-4">
            <CreditCard size={14} /> <span>Pagar y confirmar</span>
          </button>
        );
      case 'confirmada':
      case 'activa':
        return (
          <button onClick={() => setActiveTab('seguimiento')} className="secondary-button">
            <Navigation size={14} /> <span>Ver seguimiento</span>
          </button>
        );
      case 'finalizada':
        return calificadas.has(s.id_asignacion)
          ? <span className="text-xs theme-text-secondary italic">Ya calificaste este servicio</span>
          : (
            <button onClick={() => setPorCalificar(s)} className="secondary-button">
              <Star size={14} /> <span>Calificar transportista</span>
            </button>
          );
      default:
        return null;
    }
  };

  return (
    <>
      <ListaServicios
        kicker="MIS SOLICITUDES"
        titulo="Mis mudanzas"
        descripcion="Estado de cada solicitud que registraste y del transportista que elegiste."
        accionCabecera={
          <button onClick={() => setActiveTab('mudanza')} className="primary-button self-start sm:self-auto">
            <Plus size={15} strokeWidth={2.5} /> <span>Solicitar mudanza</span>
          </button>
        }
        servicios={servicios}
        cargando={cargando}
        error={error}
        vacio={{
          titulo: 'Aún no tienes mudanzas',
          texto: 'Cuando registres una solicitud y elijas un transportista, aparecerá aquí con su estado.',
        }}
        renderServicio={(s) => (
          <ServicioCard key={s.id_asignacion} servicio={s} etiquetaContraparte="Transportista" acciones={acciones(s)} />
        )}
      />

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

export default MudanzasCliente;

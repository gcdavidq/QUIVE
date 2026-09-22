import React from 'react';
import { Truck, Boxes, Navigation, Plus, CheckCircle2, CreditCard, MapPin, Wallet } from 'lucide-react';
import useMisServicios from '../../../hooks/useMisServicios';
import useMetodosPago from '../../../hooks/useMetodosPago';
import { esServicioVigente, direccionLegible, formatoSoles } from '../../../utils/estadoServicio';
import { HeroInicio, BotonHero, StatCard, PanelInicio, EnlacePanel, ResumenServicio, FilaDato, SinServicios } from '../compartido/InicioPartes';

const PAGADOS = ['confirmada', 'activa', 'finalizada'];

// Panel de inicio del CLIENTE. Todas las cifras salen de sus servicios en la base de datos.
const InicioCliente = ({ userData, setActiveTab }) => {
  const { servicios, cargando } = useMisServicios(userData);
  const { metodos, cargando: cargandoMetodos } = useMetodosPago(userData);

  const vigentes = servicios.filter((s) => esServicioVigente(s.estado_servicio));
  const finalizadas = servicios.filter((s) => s.estado_servicio === 'finalizada');
  const totalPagado = servicios
    .filter((s) => PAGADOS.includes(s.estado_servicio))
    .reduce((suma, s) => suma + (parseFloat(s.precio) || 0), 0);
  const destacado = vigentes[0] || servicios[0] || null;
  const valor = (n) => (cargando ? '—' : n);

  return (
    <div className="space-y-6">
      <HeroInicio
        etiqueta="Panel del cliente"
        nombre={userData.nombre_completo}
        texto="Registra tu mudanza, calcula el volumen de tus objetos, elige transportista y sigue el traslado."
        acciones={
          <>
            <BotonHero principal icon={Plus} onClick={() => setActiveTab('mudanza')}>Solicitar nueva mudanza</BotonHero>
            <BotonHero icon={Navigation} onClick={() => setActiveTab('seguimiento')}>Seguimiento</BotonHero>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Truck} tone="stat-blue" titulo="Solicitudes registradas" valor={valor(servicios.length)} unidad={servicios.length === 1 ? 'servicio' : 'servicios'} />
        <StatCard icon={Boxes} tone="stat-lilac" titulo="Mudanzas vigentes" valor={valor(vigentes.length)} unidad="en proceso" />
        <StatCard icon={CheckCircle2} tone="stat-mint" titulo="Mudanzas finalizadas" valor={valor(finalizadas.length)} unidad="completadas" />
        <StatCard icon={Wallet} tone="stat-peach" titulo="Total pagado" valor={cargando ? '—' : formatoSoles(totalPagado)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <PanelInicio
          className="lg:col-span-7"
          kicker="ESTADO DE TUS TRASLADOS"
          titulo={destacado ? (vigentes.length ? 'Tu mudanza vigente' : 'Tu último servicio') : 'Aún no tienes mudanzas'}
          accion={<EnlacePanel onClick={() => setActiveTab('pedidos')}>Ver mis mudanzas</EnlacePanel>}
        >
          {destacado ? (
            <ResumenServicio servicio={destacado} etiquetaContraparte="Transportista asignado">
              {destacado.estado_servicio === 'aceptada' && (
                <button onClick={() => setActiveTab('mudanza')} className="primary-button w-full justify-center !py-2.5">
                  <CreditCard size={14} /> <span>El transportista aceptó: pagar y confirmar</span>
                </button>
              )}
            </ResumenServicio>
          ) : (
            <SinServicios
              titulo="Todavía no registras ninguna solicitud de mudanza."
              texto="Indica origen, destino y fecha, agrega tus objetos y elige al transportista. La solicitud aparecerá aquí con su estado."
            />
          )}
        </PanelInicio>

        <PanelInicio className="lg:col-span-5" kicker="TU CUENTA" titulo="Datos para tus mudanzas">
          <div className="space-y-3">
            <FilaDato
              icon={MapPin} tone="stat-blue" titulo="Dirección principal"
              accion={<EnlacePanel onClick={() => setActiveTab('perfil/editar')}>Editar</EnlacePanel>}
            >
              {userData.ubicacion ? direccionLegible(userData.ubicacion) : 'No has registrado una dirección.'}
            </FilaDato>
            <FilaDato
              icon={CreditCard} tone="stat-peach" titulo="Métodos de pago"
              accion={<EnlacePanel onClick={() => setActiveTab('perfil/pagos')}>Gestionar</EnlacePanel>}
            >
              {cargandoMetodos
                ? 'Cargando...'
                : metodos.length === 0
                  ? 'No tienes métodos de pago registrados. Necesitas uno para confirmar una mudanza.'
                  : `${metodos.length} ${metodos.length === 1 ? 'método registrado' : 'métodos registrados'}.`}
            </FilaDato>
          </div>
        </PanelInicio>
      </div>
    </div>
  );
};

export default InicioCliente;

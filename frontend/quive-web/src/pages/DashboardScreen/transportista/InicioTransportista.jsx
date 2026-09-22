import React, { useEffect, useState } from 'react';
import { Truck, Inbox, Navigation, CheckCircle2, CreditCard, FileCheck, Wallet, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_URL from '../../../api';
import useMisServicios from '../../../hooks/useMisServicios';
import useMetodosPago from '../../../hooks/useMetodosPago';
import { formatoSoles } from '../../../utils/estadoServicio';
import { HeroInicio, BotonHero, StatCard, PanelInicio, EnlacePanel, ResumenServicio, FilaDato, SinServicios } from '../compartido/InicioPartes';

const COBRADOS = ['confirmada', 'activa', 'finalizada'];
const ESTADO_DOCUMENTOS = {
  verificado: { texto: 'Verificados', pill: 'status-pill status-green' },
  pendiente: { texto: 'En revisión', pill: 'status-pill status-orange' },
  rechazado: { texto: 'Rechazados', pill: 'status-pill status-red' },
};

// Panel de inicio del TRANSPORTISTA: su bandeja, su unidad, sus documentos y sus cobros.
const InicioTransportista = ({ userData, setActiveTab }) => {
  const { servicios, cargando } = useMisServicios(userData);
  const { metodos, cargando: cargandoMetodos } = useMetodosPago(userData);
  const [vehiculo, setVehiculo] = useState(undefined);      // undefined = cargando, null = no tiene
  const [documentos, setDocumentos] = useState(undefined);

  useEffect(() => {
    if (!userData?.id_usuario) return;
    axios.get(`${API_URL}/vehiculos/me/${userData.id_usuario}`)
      .then((res) => setVehiculo((Array.isArray(res.data) && res.data[0]) || null))
      .catch(() => setVehiculo(null));
    axios.get(`${API_URL}/transportistas/${userData.id_usuario}/documentos`)
      .then((res) => setDocumentos(res.data))
      .catch(() => setDocumentos(null));
  }, [userData?.id_usuario]);

  const porResponder = servicios.filter((s) => s.estado_servicio === 'pendiente');
  const enCurso = servicios.filter((s) => ['confirmada', 'activa'].includes(s.estado_servicio));
  const finalizados = servicios.filter((s) => s.estado_servicio === 'finalizada');
  const ingresos = servicios
    .filter((s) => COBRADOS.includes(s.estado_servicio))
    .reduce((suma, s) => suma + (parseFloat(s.precio) || 0), 0);
  const destacado = porResponder[0] || enCurso[0] || servicios[0] || null;
  const valor = (n) => (cargando ? '—' : n);
  const estadoDocs = documentos ? ESTADO_DOCUMENTOS[documentos.estado_verificacion] : null;

  return (
    <div className="space-y-6">
      <HeroInicio
        etiqueta="Panel del transportista"
        nombre={userData.nombre_completo}
        texto="Responde las solicitudes que te asignan los clientes, ejecuta los traslados y reporta tu posición en ruta."
        acciones={
          <>
            <BotonHero principal icon={Inbox} onClick={() => setActiveTab('pedidos')}>Bandeja de solicitudes</BotonHero>
            <BotonHero icon={Navigation} onClick={() => setActiveTab('seguimiento')}>Ruta y GPS</BotonHero>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Inbox} tone="stat-blue" titulo="Por responder" valor={valor(porResponder.length)} unidad="solicitudes" />
        <StatCard icon={Truck} tone="stat-lilac" titulo="Traslados confirmados" valor={valor(enCurso.length)} unidad="por ejecutar o en ruta" />
        <StatCard icon={CheckCircle2} tone="stat-mint" titulo="Viajes finalizados" valor={valor(finalizados.length)} unidad="completados" />
        <StatCard icon={Wallet} tone="stat-peach" titulo="Ingresos cobrados" valor={cargando ? '—' : formatoSoles(ingresos)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <PanelInicio
          className="lg:col-span-7"
          kicker="BANDEJA OPERATIVA"
          titulo={destacado ? (porResponder.length ? 'Solicitud por responder' : 'Tu servicio más reciente') : 'Sin solicitudes asignadas'}
          accion={<EnlacePanel onClick={() => setActiveTab('pedidos')}>Ver bandeja</EnlacePanel>}
        >
          {destacado ? (
            <ResumenServicio servicio={destacado} etiquetaContraparte="Cliente solicitante">
              {destacado.estado_servicio === 'pendiente' && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="text-amber-600" />
                    <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">Esta solicitud espera tu respuesta</span>
                  </div>
                  <EnlacePanel onClick={() => setActiveTab('pedidos')}>Responder</EnlacePanel>
                </div>
              )}
            </ResumenServicio>
          ) : (
            <SinServicios
              titulo="No tienes solicitudes asignadas en este momento."
              texto="Cuando un cliente te elija para su mudanza, la solicitud aparecerá aquí y en tu bandeja."
            />
          )}
        </PanelInicio>

        <PanelInicio className="lg:col-span-5" kicker="UNIDAD Y HABILITACIÓN" titulo="Tu operación">
          <div className="space-y-3">
            <FilaDato
              icon={Truck} tone="stat-blue" titulo="Vehículo registrado"
              accion={<EnlacePanel onClick={() => setActiveTab('perfil/vehiculo')}>Ver</EnlacePanel>}
            >
              {vehiculo === undefined ? 'Cargando...' : vehiculo
                ? <span><b className="theme-text-primary">{vehiculo.tipo_vehiculo}</b> · Placa {vehiculo.placa} · {vehiculo.estado}</span>
                : 'No tienes un vehículo registrado.'}
            </FilaDato>
            <FilaDato
              icon={FileCheck} tone="stat-lilac" titulo="Documentos"
              accion={estadoDocs && <span className={`${estadoDocs.pill} !text-[10px]`}>{estadoDocs.texto}</span>}
            >
              {documentos === undefined ? 'Cargando...' : documentos
                ? 'Licencia, tarjeta de propiedad y certificado ITV presentados.'
                : 'Aún no has presentado tus documentos.'}
            </FilaDato>
            <FilaDato
              icon={CreditCard} tone="stat-mint" titulo="Métodos de cobro"
              accion={<EnlacePanel onClick={() => setActiveTab('perfil/pagos')}>Gestionar</EnlacePanel>}
            >
              {cargandoMetodos
                ? 'Cargando...'
                : metodos.length === 0
                  ? 'No tienes métodos de cobro. Necesitas uno para aceptar solicitudes.'
                  : `${metodos.length} ${metodos.length === 1 ? 'método registrado' : 'métodos registrados'}.`}
            </FilaDato>
          </div>
        </PanelInicio>
      </div>
    </div>
  );
};

export default InicioTransportista;

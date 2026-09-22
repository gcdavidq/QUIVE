import React, { useState, useEffect } from 'react';
import { ArrowLeft, Truck, FileCheck, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../../api';

const VERIFICACION = {
  verificado: { texto: 'Verificados', pill: 'status-pill status-green', nota: 'QUIVE validó tus documentos.' },
  pendiente: { texto: 'En revisión', pill: 'status-pill status-orange', nota: 'Tus documentos están pendientes de revisión por QUIVE.' },
  rechazado: { texto: 'Rechazados', pill: 'status-pill status-red', nota: 'Tus documentos fueron rechazados. Contacta a soporte para volver a presentarlos.' },
};

const DOCUMENTOS = [
  { campo: 'licencia_conducir_url', titulo: 'Licencia de conducir' },
  { campo: 'tarjeta_propiedad_url', titulo: 'Tarjeta de propiedad' },
  { campo: 'certificado_itv_url', titulo: 'Certificado de inspección técnica (ITV)' },
];

// Pantalla exclusiva del TRANSPORTISTA. Muestra solo lo que hay en Vehiculos, Tipos_Vehiculo
// y Documentos_Transportista; antes SOAT, CITV y licencia salían siempre como "Verificado /
// Conforme / Vigente" y la capacidad caía a "15 m³" sin consultar nada.
const MiVehiculoTab = ({ userData }) => {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [documentos, setDocumentos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.id_usuario) return;
    const cargar = async () => {
      const [veh, docs] = await Promise.allSettled([
        axios.get(`${API_URL}/vehiculos/me/${userData.id_usuario}`),
        axios.get(`${API_URL}/transportistas/${userData.id_usuario}/documentos`),
      ]);
      setVehiculos(veh.status === 'fulfilled' && Array.isArray(veh.value.data) ? veh.value.data : []);
      setDocumentos(docs.status === 'fulfilled' ? docs.value.data : null);
      setLoading(false);
    };
    cargar();
  }, [userData?.id_usuario]);

  const verificacion = documentos ? VERIFICACION[documentos.estado_verificacion] : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="surface-card p-6 flex items-center gap-4">
        <button
          onClick={() => navigate('..')}
          className="p-2.5 rounded-xl border border-[var(--color-border)] hover:border-[#4d93f5] text-[#345273] dark:text-white transition-all"
          aria-label="Regresar a perfil"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <span className="section-kicker">UNIDAD Y HABILITACIÓN</span>
          <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white mt-0.5">Mi vehículo y documentos</h1>
        </div>
      </div>

      {loading ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <RefreshCw className="animate-spin text-[#4d93f5] mx-auto mb-3" size={28} />
          <p className="text-sm font-semibold theme-text-primary">Cargando tu unidad...</p>
        </div>
      ) : (
        <>
          {vehiculos.length === 0 ? (
            <div className="surface-card p-10 text-center rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="font-display text-xl font-bold text-[#16365f] dark:text-white mb-2">Sin vehículo registrado</h2>
              <p className="text-sm theme-text-secondary max-w-md mx-auto">
                Tu cuenta no tiene un vehículo asociado, por lo que no aparecerás con unidad en las cotizaciones.
              </p>
            </div>
          ) : vehiculos.map((vehiculo) => (
            <div key={vehiculo.id_vehiculo} className="surface-card p-6 sm:p-8">
              <div className="flex items-center gap-4 pb-6 border-b border-[var(--color-border)]">
                <div className="stat-icon stat-blue !h-14 !w-14 !rounded-2xl flex-shrink-0"><Truck size={28} /></div>
                <div>
                  <span className={`status-pill ${vehiculo.estado === 'activo' ? 'status-green' : 'status-gray'} capitalize`}>{vehiculo.estado}</span>
                  <h2 className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white mt-1">{vehiculo.tipo_vehiculo}</h2>
                  <p className="text-sm font-bold text-[#4d93f5] mt-0.5">Placa: {vehiculo.placa}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
                  <span className="section-kicker block mb-1">Capacidad de volumen</span>
                  <span className="font-display text-xl font-bold text-[#16365f] dark:text-white">{parseFloat(vehiculo.capacidad_volumen)} m³</span>
                </div>
                <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
                  <span className="section-kicker block mb-1">Capacidad de peso</span>
                  <span className="font-display text-xl font-bold text-[#16365f] dark:text-white">{parseFloat(vehiculo.capacidad_peso)} kg</span>
                </div>
              </div>
            </div>
          ))}

          <div className="surface-card p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <span className="section-kicker">DOCUMENTACIÓN</span>
                <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-1">Documentos presentados</h3>
              </div>
              {verificacion && <span className={verificacion.pill}>{verificacion.texto}</span>}
            </div>

            {documentos ? (
              <>
                <p className="text-xs text-[#8da3bd] mb-5">{verificacion?.nota}</p>
                <div className="space-y-3">
                  {DOCUMENTOS.map(({ campo, titulo }) => (
                    <div key={campo} className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="stat-icon stat-lilac !h-8 !w-8 flex-shrink-0"><FileCheck size={16} /></div>
                        <h4 className="text-xs font-bold text-[#16365f] dark:text-white truncate">{titulo}</h4>
                      </div>
                      {documentos[campo] ? (
                        <a href={documentos[campo]} target="_blank" rel="noopener noreferrer" className="subtle-button flex-shrink-0">
                          <span>Ver archivo</span> <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span className="text-[11px] text-[#8da3bd] flex-shrink-0">No presentado</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-[#8da3bd] mt-2">Aún no has presentado tus documentos.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MiVehiculoTab;

import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentMethodSelector from '../utils/PaymentMethodSelector';
import Avatar from '../../components/Avatar';
import useMetodosPago from '../../hooks/useMetodosPago';
import { direccionLegible, formatoSoles } from '../../utils/estadoServicio';
import API_URL, { apiFetch } from '../../api';

// Paso 5 del flujo del CLIENTE: revisar el resumen y pagar con uno de SUS métodos de pago.
const MetodosPago = ({ userData, formData, setFormData, setUserData, actualizarFormData, handleCancelar, setActiveTab }) => {
  const navigate = useNavigate();
  const { metodos, cargando } = useMetodosPago(userData);
  const [metodoPago, setMetodoPago] = useState(null);
  const [terminos, setTerminos] = useState({ avisos: false, privacidad: false });
  const [faltanTerminos, setFaltanTerminos] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!metodoPago && metodos.length > 0) setMetodoPago(metodos[0]);
  }, [metodos, metodoPago]);

  const distanciaKm = parseFloat(formData?.distancia);

  const handleConfirmar = async () => {
    setError('');
    if (!terminos.avisos || !terminos.privacidad) {
      setFaltanTerminos(true);
      return;
    }
    if (!metodoPago) {
      setError('Selecciona un método de pago para continuar.');
      return;
    }

    try {
      setConfirmando(true);
      // El monto no se envía: el servidor cobra el precio de la asignación aceptada.
      const response = await apiFetch(`${API_URL}/solicitudes/actualizar_estado/${formData?.id_solicitud}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'confirmada', metodo_pago: metodoPago.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.msg || 'No se pudo confirmar la mudanza.');

      setUserData((prev) => ({ ...prev, formularioMudanza: {} }));
      setFormData({});
      setActiveTab('pedidos');
    } catch (err) {
      setError(err.message);
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="surface-card p-6 sm:p-8 lg:col-span-7 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="section-kicker">PASO 5 DE 5 · CONFIRMACIÓN</span>
            <h2 className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white mt-1 mb-4">Resumen de la mudanza</h2>

            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136] mb-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar foto={formData.conductor?.foto} nombre={formData.conductor?.nombre} className="w-12 h-12 rounded-xl text-xs" />
                  <div className="min-w-0">
                    <span className="section-kicker block">Transportista que aceptó</span>
                    <h4 className="font-display text-sm font-bold text-[#16365f] dark:text-white truncate">{formData.conductor?.nombre}</h4>
                    {formData.conductor?.vehiculo && (
                      <p className="text-[11px] text-[#8da3bd] truncate">{formData.conductor.vehiculo} · {formData.conductor.capacidad}</p>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="section-kicker block">Total a pagar</span>
                  <span className="font-display text-2xl font-extrabold text-[#4d93f5]">{formatoSoles(formData.conductor?.precio)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-5 p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4d93f5] mt-1 flex-shrink-0" />
                <div>
                  <span className="font-bold text-[#4d93f5] uppercase tracking-wider block text-[10px]">Origen</span>
                  <span className="font-medium text-[#16365f] dark:text-white">{direccionLegible(formData?.origen)}</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-bold text-emerald-500 uppercase tracking-wider block text-[10px]">Destino</span>
                  <span className="font-medium text-[#16365f] dark:text-white">{direccionLegible(formData?.destino)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 text-xs text-[#8da3bd]">
                <span>Fecha: <strong className="text-[#16365f] dark:text-white">{formData?.fecha}</strong></span>
                <span>Hora: <strong className="text-[#16365f] dark:text-white">{formData?.hora}</strong></span>
                {Number.isFinite(distanciaKm) && (
                  <span>Distancia: <strong className="text-[#16365f] dark:text-white">{(distanciaKm / 1000).toFixed(1)} km</strong></span>
                )}
              </div>
            </div>

            <div>
              <span className="section-kicker block mb-2">Inventario a trasladar ({formData?.objetos?.length || 0})</span>
              <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                {(formData?.objetos || []).map((obj, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-lg border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
                    <span className="font-medium text-[#16365f] dark:text-white truncate">{obj.descripcion}</span>
                    <span className="text-[#4d93f5] font-bold">x{obj.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
            <button
              onClick={() => { actualizarFormData({ conductor: null, asignacion: null }); handleCancelar(); }}
              className="secondary-button w-full justify-center !py-3"
            >
              Cancelar y elegir otro transportista
            </button>
          </div>
        </div>

        <div className="surface-card p-6 sm:p-8 lg:col-span-5 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="section-kicker">PAGO</span>
            <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-1 mb-4">¿Con qué método pagas?</h3>

            <PaymentMethodSelector
              metodos={metodos}
              cargando={cargando}
              metodoSeleccionadoId={metodoPago?.id}
              onSeleccionar={setMetodoPago}
              onGestionarMetodos={() => navigate('/dashboard/perfil/pagos')}
              className="mb-3"
            />
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mb-6">
              Pasarela simulada: el pago se descuenta del saldo ficticio de tu método y se abona al del transportista. No hay cargos reales.
            </p>

            <div className={`space-y-3 p-4 rounded-xl border transition-all ${
              faltanTerminos && (!terminos.avisos || !terminos.privacidad)
                ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20'
                : 'border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]'
            }`}>
              <span className="section-kicker block">Términos y condiciones</span>
              <label className="flex items-start gap-2 cursor-pointer text-xs theme-text-secondary">
                <input type="checkbox" checked={terminos.avisos} onChange={(e) => setTerminos((p) => ({ ...p, avisos: e.target.checked }))} className="mt-0.5 accent-[#4d93f5]" />
                <span>Acepto recibir notificaciones sobre el estado de este servicio.</span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer text-xs theme-text-secondary">
                <input type="checkbox" checked={terminos.privacidad} onChange={(e) => setTerminos((p) => ({ ...p, privacidad: e.target.checked }))} className="mt-0.5 accent-[#4d93f5]" />
                <span>Acepto la política de privacidad y las condiciones del servicio de transporte.</span>
              </label>
              {faltanTerminos && (!terminos.avisos || !terminos.privacidad) && (
                <p className="text-xs text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={13} /> Debes marcar ambas casillas para confirmar</p>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={15} /> <span>{error}</span>
              </div>
            )}
          </div>

          <button onClick={handleConfirmar} disabled={confirmando || !metodoPago} className="primary-button w-full justify-center !py-3.5 mt-6 disabled:opacity-50">
            <span>{confirmando ? 'Procesando pago...' : `Pagar ${formatoSoles(formData.conductor?.precio)} y confirmar`}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetodosPago;

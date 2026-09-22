import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Wallet, Plus, Trash2, RefreshCw, AlertCircle, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../../api';
import useMetodosPago, { nombreMetodo } from '../../../hooks/useMetodosPago';

const ICONOS = {
  Tarjeta: { Icon: CreditCard, tone: 'stat-blue' },
  Yape: { Icon: Smartphone, tone: 'stat-lilac' },
  PayPal: { Icon: Wallet, tone: 'stat-mint' },
};

const FORM_VACIO = { tipo: 'Tarjeta', numero: '', vencimiento: '', cvv: '', codigo: '', correo: '', contrasena: '' };

const inputClass = "w-full text-xs font-medium py-3 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors";
const labelClass = "text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5";

const datosDelFormulario = (f) => {
  if (f.tipo === 'Tarjeta') return { numero: f.numero.replace(/\s/g, ''), vencimiento: f.vencimiento, cvv: f.cvv };
  if (f.tipo === 'Yape') return { codigo: f.codigo.trim() };
  return { correo: f.correo.trim(), contrasena: f.contrasena };
};

// Métodos de pago (cliente) o de cobro (transportista) del usuario autenticado.
// La lista siempre viene de la base de datos y el backend ya no entrega número completo,
// CVV, contraseña ni saldo: solo lo necesario para reconocer cada método.
const MetodosPago = ({ userData }) => {
  const navigate = useNavigate();
  const isDriver = userData?.tipo_usuario === 'transportista';
  const { metodos, cargando, error, recargar } = useMetodosPago(userData);
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const cambiar = (campo) => (e) => { setForm({ ...form, [campo]: e.target.value }); setErrorForm(''); };

  const agregar = async (e) => {
    e.preventDefault();
    try {
      setGuardando(true);
      await axios.post(`${API_URL}/metodos_pago/${userData.id_usuario}`, { tipo: form.tipo, datos: datosDelFormulario(form) });
      setForm(null);
      recargar();
    } catch (err) {
      setErrorForm(err.response?.data?.msg || 'No se pudo registrar el método.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (metodo) => {
    if (!window.confirm(`¿Eliminar ${nombreMetodo(metodo)}?`)) return;
    try {
      await axios.delete(`${API_URL}/metodos_pago/eliminar/${metodo.id}`);
      recargar();
    } catch (err) {
      alert(err.response?.data?.msg || 'No se pudo eliminar el método.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="surface-card p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('..')}
            className="p-2.5 rounded-xl border border-[var(--color-border)] hover:border-[#4d93f5] text-[#345273] dark:text-white transition-all"
            aria-label="Regresar a perfil"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="section-kicker">{isDriver ? 'COBROS' : 'PAGOS'}</span>
            <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white mt-0.5">
              {isDriver ? 'Métodos de cobro' : 'Métodos de pago'}
            </h1>
          </div>
        </div>
        {!form && (
          <button onClick={() => { setForm(FORM_VACIO); setErrorForm(''); }} className="primary-button">
            <Plus size={15} strokeWidth={2.5} /> <span>Agregar</span>
          </button>
        )}
      </div>

      {/* QUIVE no está conectado a una pasarela real: se declara de forma visible. */}
      <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 flex items-start gap-3">
        <FlaskConical size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-100">
          <p className="font-bold">Pasarela de pagos simulada</p>
          <p className="mt-0.5 text-amber-800 dark:text-amber-200">
            No se realizan cargos ni abonos reales. Cada método que registres se crea con un saldo ficticio de prueba
            y los pagos entre cuentas solo mueven ese saldo. No ingreses datos reales de tus tarjetas ni tu contraseña de PayPal.
          </p>
        </div>
      </div>

      {form && (
        <form onSubmit={agregar} className="surface-card p-6 sm:p-8 space-y-4">
          <div>
            <span className="section-kicker">NUEVO MÉTODO</span>
            <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-1">
              {isDriver ? '¿Dónde quieres recibir tus cobros?' : '¿Con qué quieres pagar?'}
            </h3>
          </div>

          <div>
            <label className={labelClass}>Tipo</label>
            <select value={form.tipo} onChange={cambiar('tipo')} className={inputClass}>
              <option value="Tarjeta">Tarjeta de crédito / débito</option>
              <option value="Yape">Yape</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>

          {form.tipo === 'Tarjeta' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className={labelClass}>Número de tarjeta</label>
                <input required inputMode="numeric" maxLength={19} value={form.numero} onChange={cambiar('numero')} className={inputClass} autoComplete="cc-number" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Vencimiento (MM/AA)</label>
                {/* La pasarela guarda el vencimiento como texto MM/AA; un input de fecha enviaba AAAA-MM-DD y nunca coincidía. */}
                <input
                  required
                  inputMode="numeric"
                  placeholder="MM/AA"
                  maxLength={5}
                  pattern="(0[1-9]|1[0-2])/\d{2}"
                  value={form.vencimiento}
                  onChange={(e) => {
                    const digitos = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setForm({ ...form, vencimiento: digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos });
                    setErrorForm('');
                  }}
                  className={inputClass}
                  autoComplete="cc-exp"
                />
              </div>
              <div>
                <label className={labelClass}>CVV</label>
                <input required type="password" inputMode="numeric" maxLength={4} value={form.cvv} onChange={cambiar('cvv')} className={inputClass} autoComplete="cc-csc" />
              </div>
            </div>
          )}

          {form.tipo === 'Yape' && (
            <div>
              <label className={labelClass}>Código Yape</label>
              <input required minLength={4} maxLength={30} pattern="[A-Za-z0-9]+" title="De 4 a 30 letras o números" value={form.codigo} onChange={cambiar('codigo')} className={inputClass} />
            </div>
          )}

          {form.tipo === 'PayPal' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Correo de PayPal</label>
                <input required type="email" value={form.correo} onChange={cambiar('correo')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contraseña</label>
                <input required type="password" value={form.contrasena} onChange={cambiar('contrasena')} className={inputClass} />
              </div>
            </div>
          )}

          {errorForm && (
            <p className="text-rose-500 text-xs flex items-center gap-1"><AlertCircle size={13} /> {errorForm}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setForm(null)} className="secondary-button flex-1 justify-center !py-2.5">Cancelar</button>
            <button type="submit" disabled={guardando} className="primary-button flex-1 justify-center !py-2.5 disabled:opacity-50">
              {guardando ? 'Validando...' : 'Registrar método'}
            </button>
          </div>
        </form>
      )}

      {cargando ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <RefreshCw className="animate-spin text-[#4d93f5] mx-auto mb-3" size={28} />
          <p className="text-sm font-semibold theme-text-primary">Cargando tus métodos...</p>
        </div>
      ) : error ? (
        <div className="surface-card p-6 text-xs text-rose-500 flex items-center gap-2"><AlertCircle size={15} /> {error}</div>
      ) : metodos.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#4d93f5] flex items-center justify-center mx-auto mb-4">
            <CreditCard size={28} />
          </div>
          <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white">
            {isDriver ? 'No tienes métodos de cobro' : 'No tienes métodos de pago'}
          </h3>
          <p className="text-xs text-[#8da3bd] max-w-md mx-auto mt-1">
            {isDriver
              ? 'Necesitas al menos uno para aceptar solicitudes y recibir el pago de tus traslados.'
              : 'Necesitas al menos uno para confirmar y pagar una mudanza.'}
          </p>
        </div>
      ) : (
        <div className="surface-card rounded-2xl overflow-hidden divide-y divide-[var(--color-border)]">
          {metodos.map((metodo) => {
            const { Icon, tone } = ICONOS[metodo.tipo] || ICONOS.Tarjeta;
            return (
              <div key={metodo.id} className="flex items-center justify-between gap-3 p-5">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`stat-icon ${tone} !h-10 !w-10 flex-shrink-0`}><Icon size={18} /></div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-[#16365f] dark:text-white truncate">{nombreMetodo(metodo)}</h4>
                    <p className="text-[11px] text-[#8da3bd] mt-0.5 truncate">
                      {metodo.detalle?.titular ? `Titular: ${metodo.detalle.titular}` : metodo.tipo}
                      {metodo.detalle?.activo === false && ' · Inactivo'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {Number.isFinite(metodo.detalle?.saldo_simulado) && (
                    <div className="text-right">
                      <span className="section-kicker block">Saldo ficticio</span>
                      <span className="text-xs font-bold text-[#16365f] dark:text-white">S/ {metodo.detalle.saldo_simulado.toFixed(2)}</span>
                    </div>
                  )}
                  <button onClick={() => eliminar(metodo)} className="icon-button h-9 w-9 hover:!text-rose-500" aria-label="Eliminar método">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MetodosPago;

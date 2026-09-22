import React, { useEffect, useState, useRef } from 'react';
import { MailCheck, RefreshCw, AlertCircle } from 'lucide-react';
import API_URL, { apiFetch } from '../../api';

// El código lo genera el servidor y llega solo por correo. El navegador guarda únicamente
// un comprobante firmado y pide al servidor que valide lo que el usuario escribe
// (antes el navegador generaba el código y lo comparaba consigo mismo).
const CodigoVerificacion = ({ email, onVerificado, onReintentar }) => {
  const [inputs, setInputs] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState('');
  const [comprobante, setComprobante] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificando, setVerificando] = useState(false);
  const yaEnviadoRef = useRef(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (yaEnviadoRef.current) return;
    yaEnviadoRef.current = true;

    const enviarCodigoPorCorreo = async () => {
      try {
        const response = await apiFetch(`${API_URL}/auth/enviar-codigo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (response.ok) setComprobante(data.comprobante);
        else setError(data.msg || "No se pudo enviar el correo");
      } catch (err) {
        console.error("Error al enviar el correo:", err);
        setError("Ocurrió un error al intentar enviar el código por correo.");
      } finally {
        setLoading(false);
      }
    };

    enviarCodigoPorCorreo();
  }, [email]);

  const handleInputChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !inputs[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, "");
    if (!pasted) return;
    setInputs(Array.from({ length: 6 }, (_, i) => pasted[i] || ""));
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const verificarCodigo = async () => {
    const codigo = inputs.join("");
    if (codigo.length < 6) {
      setError("Debes ingresar los 6 dígitos del código.");
      return;
    }
    try {
      setVerificando(true);
      const response = await apiFetch(`${API_URL}/auth/verificar-codigo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo, comprobante })
      });
      if (response.ok) onVerificado();
      else setError("Código incorrecto o vencido.");
    } catch (err) {
      setError("No se pudo verificar el código. Intenta nuevamente.");
    } finally {
      setVerificando(false);
    }
  };

  return (
    <div className="text-center space-y-5 py-2">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#4d93f5] flex items-center justify-center mx-auto">
        {loading ? <RefreshCw size={26} className="animate-spin" /> : <MailCheck size={26} />}
      </div>
      <div>
        <span className="section-kicker">PASO 2 · VERIFICACIÓN</span>
        <h2 className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white mt-1">Verifica tu correo</h2>
        <p className="text-xs text-[#8da3bd] mt-1">
          {loading ? 'Enviando código a ' : 'Enviamos un código de 6 dígitos a '}
          <strong className="theme-text-primary">{email}</strong>
        </p>
      </div>

      {comprobante && (
        <div className="flex justify-center gap-2">
          {inputs.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="verification-input w-11 h-12 sm:w-12 text-center text-xl focus:outline-none"
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-rose-500 text-xs flex items-center justify-center gap-1"><AlertCircle size={13} /> {error}</p>
      )}

      {comprobante && (
        <button onClick={verificarCodigo} disabled={verificando} className="primary-button w-full justify-center !py-3 disabled:opacity-50">
          {verificando ? 'Verificando...' : 'Verificar y continuar'}
        </button>
      )}

      {!loading && (
        <div>
          <p className="text-[11px] text-[#8da3bd]">El código vence en 10 minutos. Si no lo encuentras, revisa tu carpeta de spam.</p>
          <button onClick={onReintentar} className="subtle-button mt-1">Volver al formulario</button>
        </div>
      )}
    </div>
  );
};

export default CodigoVerificacion;

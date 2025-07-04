import React, { useEffect, useState, useRef } from 'react';
import API_URL from '../../api'; // Asegúrate de que esta ruta sea correcta

const CodigoVerificacion = ({ email, codigoGenerado, onVerificado, onReintentar }) => {
  const [inputs, setInputs] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(true);
  const yaEnviadoRef = useRef(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (yaEnviadoRef.current) return;
    yaEnviadoRef.current = true;

    const enviarCodigoPorCorreo = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/enviar-codigo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, codigo: codigoGenerado })
        });

        const data = await response.json();
        if (response.ok) {
          setEnviado(true);
        } else {
          setError(data.msg || "No se pudo enviar el correo");
        }
      } catch (err) {
        console.error("Error al enviar el correo:", err);
        setError("Ocurrió un error al intentar enviar el código por correo.");
      } finally {
        setLoading(false);
      }
    };

    enviarCodigoPorCorreo();
  }, [email, codigoGenerado]);

  const handleInputChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newInputs = [...inputs];
      newInputs[index] = value;
      setInputs(newInputs);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !inputs[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("Text").replace(/\D/g, ""); // solo números
    if (pasted.length === 0) return;

    const newInputs = [...inputs];
    for (let i = 0; i < 6; i++) {
      newInputs[i] = pasted[i] || "";
    }

    setInputs(newInputs);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const verificarCodigo = () => {
    const codigoIngresado = inputs.join("");
    if (codigoIngresado.length < 6) {
      setError("Debes ingresar los 6 dígitos del código.");
      return;
    }

    if (codigoIngresado === codigoGenerado) {
      onVerificado();
    } else {
      setError("Código incorrecto");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-4">
      <div className="theme-card rounded-2xl shadow-xl p-6 w-full max-w-xl text-center space-y-6">
        <h2 className="text-xl font-bold text-blue-600">Verificación de Correo</h2>
        <p className="text-sm theme-text-secondary">
          Se ha enviado un código de verificación a <strong className="theme-text-primary">{email}</strong>
        </p>

        {loading ? (
          <p className="theme-text-secondary">Enviando código...</p>
        ) : (
          <>
            {enviado && (
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
                    className="verification-input w-12 h-12 text-center text-xl theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-primary theme-text-primary"
                  />
                ))}
              </div>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {enviado && (
              <button
                onClick={verificarCodigo}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors duration-200"
              >
                Verificar y continuar
              </button>
            )}

            <p className="text-sm theme-text-secondary">
              Si no encuentras el correo, revisa la carpeta de spam.
            </p>
            <button
              onClick={onReintentar}
              className="text-sm text-blue-500 hover:underline hover:text-blue-600 transition-colors duration-200"
            >
              Volver al formulario
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CodigoVerificacion;

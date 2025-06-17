import React, { useEffect, useState } from 'react';

const CodigoVerificacion = ({ email, codigoGenerado, onVerificado, onReintentar }) => {
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const enviarCodigoPorCorreo = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/auth/enviar-codigo", {
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

  const verificarCodigo = () => {
    if (codigoIngresado === codigoGenerado) {
      onVerificado();
    } else {
      setError('Código incorrecto');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-blue-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Verificación de Correo</h2>
        <p className="text-sm text-gray-600 mb-6">Se ha enviado un código a: <strong>{email}</strong></p>

        {loading ? (
          <p className="text-gray-500 mb-4">Enviando código...</p>
        ) : (
          <>
            {enviado && (
              <input
                type="text"
                value={codigoIngresado}
                onChange={(e) => setCodigoIngresado(e.target.value)}
                placeholder="Ingresa el código de verificación"
                className="w-full px-4 py-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            )}
            {error && <p className="text-red-500 mb-2">{error}</p>}
            {enviado && (
              <button
                onClick={verificarCodigo}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Verificar
              </button>
            )}
          </>
        )}

        <button
          onClick={onReintentar}
          className="mt-4 text-sm text-blue-500 hover:underline"
        >
          Volver al formulario
        </button>
      </div>
    </div>
  );
};

export default CodigoVerificacion;

import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';

const LoginScreen = ({ onNavigate, setUserData }) => {
  const [formData, setFormData] = useState({ identificador: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Carga e inicializa el SDK de Google
  useEffect(() => {
    const loadGoogleScript = () => {
      if (window.google?.accounts) {
        initializeGoogleAuth();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleAuth;
      script.onerror = () => {
        setGeneralError('No se pudo cargar el servicio de Google. Verifica tu conexión a internet.');
      };
      document.head.appendChild(script);
    };

    const initializeGoogleAuth = () => {
      if (!window.google?.accounts) return;
      window.google.accounts.id.initialize({
        client_id: "273165541469-spobn0clm5tj7f68116fg8lutk0n4j4u.apps.googleusercontent.com",
        callback: handleGoogleResponse,
        ux_mode: 'popup',
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large', width: 300, locale: 'es' }
      );
    };

    loadGoogleScript();
  }, []);

  // Maneja la respuesta de Google
  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setGeneralError('');
    
    try {
      const res = await fetch('http://localhost:5000/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });
      
      const data = await res.json();
      
      if (data.status === 'success') {
        setUserData(data.usuario);
        window.google.accounts.id.disableAutoSelect();
        onNavigate('dashboard');
      } else {
        setGeneralError(data.msg || 'No se pudo iniciar sesión con Google. Por favor, inténtalo nuevamente.');
      }
    } catch (error) {
      console.error('Error de conexión con el servidor:', error);
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        setGeneralError('No se puede conectar con el servidor. Verifica que el servidor esté ejecutándose en localhost:5000 o tu conexión a internet.');
      } else {
        setGeneralError('Error inesperado al conectar con Google. Por favor, inténtalo más tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo de inputs y validación
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const value = formData.identificador.trim();

    if (!value) {
      newErrors.identificador = 'Por favor, ingresa tu correo electrónico o DNI';
    } else if (!/\S+@\S+\.\S+/.test(value) && !/^\d{8}$/.test(value)) {
      if (value.includes('@')) {
        newErrors.identificador = 'El formato del correo electrónico no es válido. Ejemplo: usuario@correo.com';
      } else if (/^\d+$/.test(value)) {
        newErrors.identificador = 'El DNI debe tener exactamente 8 dígitos';
      } else {
        newErrors.identificador = 'Ingresa un correo electrónico válido (usuario@correo.com) o un DNI de 8 dígitos';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Por favor, ingresa tu contraseña';
    } else if (formData.password.length < 3) {
      newErrors.password = 'La contraseña es muy corta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.identificador,
          dni: formData.identificador,
          contrasena: formData.password,
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setGeneralError('Correo/DNI o contraseña incorrectos. Verifica tus datos e inténtalo nuevamente.');
        } else if (response.status === 404) {
          setGeneralError('No existe una cuenta con estos datos. ¿Quieres crear una cuenta nueva?');
        } else if (response.status >= 500) {
          setGeneralError('Error en el servidor. Por favor, inténtalo más tarde.');
        } else {
          setGeneralError(data.msg || 'Error inesperado. Por favor, inténtalo nuevamente.');
        }
        return;
      }

      setUserData(data.usuario);
      onNavigate('dashboard');
      
    } catch (error) {
      console.error('Error de conexión:', error);
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        setGeneralError('No se puede conectar con el servidor. Verifica que el servidor esté ejecutándose en http://127.0.0.1:5000 o tu conexión a internet.');
      } else {
        setGeneralError('Error de conexión. Verifica tu internet e inténtalo nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Componente para mostrar errores generales
  const ErrorAlert = ({ message }) => (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
      <p className="text-red-700 text-sm">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm p-6 flex items-center">
        <button
          onClick={() => onNavigate('landing')}
          className="mr-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-2xl font-bold text-blue-600">QUIVE</div>
      </header>

      <div className="flex items-center justify-center min-h-screen py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">Te damos la bienvenida</p>
            <h1 className="text-3xl font-bold text-blue-600 mb-6">INICIAR SESIÓN</h1>
          </div>

          {/* Mostrar error general si existe */}
          {generalError && <ErrorAlert message={generalError} />}

          {/* Botón de Google Sign-In */}
          <div id="google-signin-button" className="flex justify-center mb-6"></div>

          <div className="text-center text-gray-500 mb-6"><span>o</span></div>

          <div className="space-y-6">
            <div>
              <label className="block text-blue-600 text-sm font-medium mb-2">
                Correo Electrónico o DNI
              </label>
              <input
                type="text"
                name="identificador"
                placeholder="ejemplo@correo.com o 12345678"
                value={formData.identificador}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.identificador ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.identificador && (
                <div className="flex items-start mt-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                  <p className="text-red-500 text-sm">{errors.identificador}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-blue-600 text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.password && (
                <div className="flex items-start mt-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
                  <p className="text-red-500 text-sm">{errors.password}</p>
                </div>
              )}
            </div>

            <div className="text-right">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                'INICIAR SESIÓN'
              )}
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">¿No tienes una cuenta?</p>
            <button
              onClick={() => onNavigate('register')}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
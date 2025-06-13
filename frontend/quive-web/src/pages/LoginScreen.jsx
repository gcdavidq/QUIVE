import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const LoginScreen = ({ onNavigate, setUserData }) => {
  const [formData, setFormData] = useState({ identificador: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
      script.onerror = () => console.error('Error loading Google script');
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
        alert('Error al iniciar sesión con Google');
      }
    } catch (error) {
      console.error('Error de conexión con el servidor:', error);
      alert('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejo de inputs y validación
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    const value = formData.identificador.trim();

    if (!value) {
      newErrors.identificador = 'El email o DNI es requerido';
    } else if (!/\S+@\S+\.\S+/.test(value) && !/^\d{8}$/.test(value)) {
      newErrors.identificador = 'Ingresa un email válido o un DNI de 8 dígitos';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert(data.msg || 'Error inesperado al iniciar sesión.');
        return;
      }

      
      setUserData(data.usuario);
      onNavigate('dashboard');
      
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error de red o servidor.');
    } finally {
      setIsLoading(false);
    }
  };

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

          {/* Botón de Google Sign-In */}
          <div id="google-signin-button" className="flex justify-center mb-6"></div>

          <div className="text-center text-gray-500 mb-6"><span>o</span></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-blue-600 text-sm font-medium mb-2">
                Correo Electrónico o DNI
              </label>
              <input
                type="text"
                name="identificador"
                placeholder="Ingresa tu email o DNI"
                value={formData.identificador}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.identificador ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.identificador && (
                <p className="text-red-500 text-sm mt-1">{errors.identificador}</p>
              )}
            </div>

            <div>
              <label className="block text-blue-600 text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
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
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
            </button>
          </form>

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

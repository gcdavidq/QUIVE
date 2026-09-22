import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Sparkles, User, Truck } from 'lucide-react';
import API_URL, { apiFetch } from "../api";

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
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || "273165541469-spobn0clm5tj7f68116fg8lutk0n4j4u.apps.googleusercontent.com",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Maneja la respuesta de Google
  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setGeneralError('');
    
    try {
      const res = await apiFetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });
      
      const data = await res.json();
      
      if (data.status === 'success') {
        setUserData({ ...data.usuario, token: data.token });
        window.google.accounts.id.disableAutoSelect();
        onNavigate('/dashboard');
      } else {
        setGeneralError(data.msg || 'No se pudo iniciar sesión con Google. Por favor, inténtalo nuevamente.');
      }
    } catch (error) {
      console.error('Error de conexión con el servidor:', error);
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        setGeneralError(`No se puede conectar con el servidor. Verifica que el servidor esté ejecutándose en ${API_URL} o tu conexión a internet.`);
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

  const executeLogin = async (identificador, password) => {
    setIsLoading(true);
    setGeneralError('');
    try {
      const response = await apiFetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identificador: identificador,
          email: identificador,
          dni: identificador,
          contrasena: password,
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

      setUserData({ ...data.usuario, token: data.token });
      onNavigate('/dashboard');
    } catch (error) {
      console.error('Error de conexión:', error);
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        setGeneralError(`No se puede conectar con el servidor en ${API_URL}. Verifica que el backend esté ejecutándose.`);
      } else {
        setGeneralError('Error de conexión. Verifica tu conexión e inténtalo nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;
    await executeLogin(formData.identificador, formData.password);
  };

  const handleQuickDemo = async (role) => {
    const email = role === 'transportista' ? 'juan@demo.com' : 'carlos@demo.com';

    setFormData({ identificador: email, password: 'password123' });
    setErrors({});
    await executeLogin(email, 'password123');
  };

  // Componente para mostrar errores generales
  // Componente para mostrar errores generales
  const ErrorAlert = ({ message }) => (
    <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-start gap-2.5">
      <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
      <p className="text-rose-700 dark:text-rose-300 text-xs font-medium leading-relaxed">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--color-app-bg)] flex flex-col relative overflow-hidden">
      {/* Background soft ambient accents */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#4d93f5]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#7ecfae]/10 blur-3xl" />

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="icon-button"
            title="Volver a inicio"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="brand-mark"><span className="brand-mark-shape" /><span className="brand-mark-dot" /></div>
            <span className="font-bold text-lg tracking-tight font-display text-[#16365f] dark:text-white">
              QUIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs theme-text-secondary hidden sm:inline">¿Nuevo en QUIVE?</span>
          <button
            onClick={() => onNavigate('/register')}
            className="secondary-button text-xs py-1.5 px-3.5"
          >
            Registrarse
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="surface-card rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-xl border border-[var(--color-border)] relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#4d93f5] bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 mb-3">
              <span>Portal de Acceso Unificado</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#16365f] dark:text-white tracking-tight">
              Bienvenido de nuevo
            </h1>
            <p className="theme-text-secondary text-xs sm:text-sm mt-1">
              Ingresa tus credenciales para administrar tus mudanzas y flota
            </p>
          </div>

          {/* Mostrar error general si existe */}
          {generalError && <ErrorAlert message={generalError} />}

          {/* Acceso Rápido Demo (1-Click Login) para Reclutadores / Evaluadores */}
          <div className="mb-5 p-3.5 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-[#f7faff] dark:bg-[#132238] shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#4d93f5] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#4d93f5] animate-pulse" />
                Acceso Rápido Demo
              </span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/70 text-[#4d93f5] px-2 py-0.5 rounded-full font-bold">
                1-Clic
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemo('cliente')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-[#1a2c47] border border-[var(--color-border)] hover:border-[#4d93f5] rounded-xl shadow-xs hover:shadow transition-all text-xs font-semibold text-[#16365f] dark:text-slate-100 hover:text-[#4d93f5] group disabled:opacity-50"
              >
                <User size={14} className="text-[#4d93f5] group-hover:scale-110 transition-transform" />
                <span>Cliente Demo</span>
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemo('transportista')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-[#1a2c47] border border-[var(--color-border)] hover:border-[#7ecfae] rounded-xl shadow-xs hover:shadow transition-all text-xs font-semibold text-[#16365f] dark:text-slate-100 hover:text-emerald-500 group disabled:opacity-50"
              >
                <Truck size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                <span>Transportista Demo</span>
              </button>
            </div>
            <p className="text-[10px] text-center theme-text-secondary mt-2">
              Cuentas de demostración con datos de prueba, separadas de los usuarios reales
            </p>
          </div>

          {/* Botón de Google Sign-In */}
          <div id="google-signin-button" className="flex justify-center mb-4"></div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-[var(--color-border)]"></div>
            <span className="flex-shrink mx-3 text-xs theme-text-secondary uppercase tracking-wider font-semibold">o con email</span>
            <div className="flex-grow border-t border-[var(--color-border)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider theme-text-secondary mb-1.5">
                Correo Electrónico o DNI
              </label>
              <input
                type="text"
                name="identificador"
                placeholder="ejemplo@correo.com o 12345678"
                value={formData.identificador}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors ${
                  errors.identificador ? 'border-rose-500 bg-rose-50/50' : 'border-[var(--color-border)]'
                }`}
              />
              {errors.identificador && (
                <div className="flex items-start mt-1.5 gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-rose-500 text-xs">{errors.identificador}</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider theme-text-secondary">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#4d93f5] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors ${
                  errors.password ? 'border-rose-500 bg-rose-50/50' : 'border-[var(--color-border)]'
                }`}
              />
              {errors.password && (
                <div className="flex items-start mt-1.5 gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-rose-500 text-xs">{errors.password}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="primary-button w-full py-3 rounded-xl font-bold font-display text-sm tracking-wide disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="text-center mt-5 pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs theme-text-secondary">
              ¿Aún no tienes una cuenta?{' '}
              <button
                onClick={() => onNavigate('/register')}
                className="text-[#4d93f5] hover:underline font-semibold"
              >
                Crear Cuenta Gratuita
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
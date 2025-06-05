import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const LoginScreen = ({ onNavigate, setUserData }) => {
    const [formData, setFormData] = useState({
    identificador: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
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
      const response = await fetch("http://127.0.0.1:5000/auth/login", { //Cambia por tu ip local
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.identificador,
          dni: formData.identificador,
          contrasena: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.msg) {
          alert(data.msg); // Credenciales inválidas
        } else {
          alert("Error inesperado al iniciar sesión.");
        }
        setIsLoading(false);
        return;
      }

      // Si login es exitoso:
      const usuario = data.usuario;
      const token = data.access_token;
      usuario['token'] = token

      setUserData(usuario);

      setIsLoading(false);
      onNavigate("dashboard");
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de red o servidor.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-6 flex items-center">
        <button 
          onClick={() => onNavigate('landing')}
          className="mr-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-2xl font-bold text-blue-600">QUIVE</div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-2">Te damos la bienvenida</p>
            <h1 className="text-3xl font-bold text-blue-600 mb-6">INICIAR SESIÓN</h1>
          </div>

          <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-6">
            <div className="w-5 h-5 mr-3">
              <svg viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <span className="text-gray-700">Iniciar Sesión con Google</span>
          </button>

          <div className="text-center text-gray-500 mb-6">
            <span>o</span>
          </div>

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
                  errors.email ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="text-right">
              <button type="button" className="text-blue-600 hover:text-blue-800 text-sm transition-colors">
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
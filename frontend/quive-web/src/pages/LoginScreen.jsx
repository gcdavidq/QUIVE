import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';


const LoginScreen = ({ onNavigate, setUserData }) => {
  const [formData, setFormData] = useState({ identificador: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
      const response = await fetch("http://127.0.0.1:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.identificador,
          dni: formData.identificador,
          contrasena: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.msg || "Error inesperado al iniciar sesión.");
        setIsLoading(false);
        return;
      }

      setUserData(data.usuario);
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

          <GoogleLogin
            onSuccess={credentialResponse => {
              const token = credentialResponse.credential;
              fetch('http://localhost:5000/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
              })
              .then(res => res.json())
              .then(data => {
                console.log('Respuesta backend:', data);
                if (data.status === 'success') {
                  setUserData(data);
                  onNavigate('dashboard');
                }else{
                  alert('Error al iniciar sesión con Google: ');
                }
                // guardar token / navegar al dashboard
              });
            }}
            onError={() => {
              console.log('Falló inicio de sesión con Google');
            }}
          />

          <div className="text-center text-gray-500 my-6">
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
                  errors.identificador ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.identificador && <p className="text-red-500 text-sm mt-1">{errors.identificador}</p>}
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

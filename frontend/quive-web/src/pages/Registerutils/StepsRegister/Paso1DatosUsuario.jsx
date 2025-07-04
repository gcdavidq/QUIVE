import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { generateCode, sendEmailFake } from '../verificationUtils';
import API_URL from '../../../api';

const Paso1DatosUsuario = ({ formData, setFormData, setCurrentStep, setCodigoVerificacion }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    else if (!/^9\d{8}$/.test(formData.telefono)) newErrors.telefono = 'Debe comenzar con 9 y tener 9 dígitos';
    if (!formData.dni.trim()) newErrors.dni = 'El DNI es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 6) newErrors.password = 'Debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const verificarYContinuar = async () => {
    if (!validateStep()) return;
    try {
      const res = await fetch(`${API_URL}/auth/verificar-usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, telefono: formData.telefono, dni: formData.dni })
      });
      const result = await res.json();
      if (result.existe) return alert("Ya existe un usuario con este email, DNI o teléfono.");

      const codigo = generateCode();
      setCodigoVerificacion(codigo);
      await sendEmailFake(formData.email, codigo);
      setCurrentStep(2);
    } catch (err) {
      alert("Error verificando usuario. Intenta nuevamente.");
    }
  };

  return (
    <form className="space-y-4">
      <div className="flex theme-bg-secondary rounded-full p-1 mb-4">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, tipoUsuario: 'cliente' }))}
          className={`flex-1 py-2 rounded-full transition-colors ${
            formData.tipoUsuario === 'cliente' ? 'bg-blue-600 text-white' : 'text-blue-500'
          }`}
        >
          Cliente
        </button>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, tipoUsuario: 'transportista' }))}
          className={`flex-1 py-2 rounded-full transition-colors ${
            formData.tipoUsuario === 'transportista' ? 'bg-blue-600 text-white' : 'text-blue-500'
          }`}
        >
          Transportista
        </button>
      </div>
      
      <h2 className="text-xl font-bold text-blue-600">Datos del Usuario</h2>
      
      <input
        type="text"
        name="nombre"
        placeholder="Nombre completo"
        value={formData.nombre}
        onChange={handleInputChange}
        className={`w-full px-4 py-3 border rounded-lg theme-bg-primary theme-text-primary transition-colors ${
          errors.nombre ? 'border-red-500' : 'theme-border'
        }`}
      />
      {errors.nombre && <p className="text-red-500 text-sm">{errors.nombre}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg theme-bg-primary theme-text-primary transition-colors ${
              errors.email ? 'border-red-500' : 'theme-border'
            }`}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>
        <div>
          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono"
            value={formData.telefono}
            maxLength={9}
            onChange={(e) => {
              if (/^\d{0,9}$/.test(e.target.value)) handleInputChange(e);
            }}
            className={`w-full px-4 py-3 border rounded-lg theme-bg-primary theme-text-primary transition-colors ${
              errors.telefono ? 'border-red-500' : 'theme-border'
            }`}
          />
          {errors.telefono && <p className="text-red-500 text-sm">{errors.telefono}</p>}
        </div>
      </div>

      <input
        type="text"
        name="dni"
        placeholder="DNI"
        value={formData.dni}
        maxLength={8}
        onChange={(e) => { if (/^\d*$/.test(e.target.value)) handleInputChange(e); }}
        className={`w-full px-4 py-3 border rounded-lg theme-bg-primary theme-text-primary transition-colors ${
          errors.dni ? 'border-red-500' : 'theme-border'
        }`}
      />
      {errors.dni && <p className="text-red-500 text-sm">{errors.dni}</p>}

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg theme-bg-primary theme-text-primary transition-colors ${
            errors.password ? 'border-red-500' : 'theme-border'
          }`}
        />
        <button 
          type="button" 
          onClick={() => setShowPassword(prev => !prev)} 
          className="absolute right-3 top-3 theme-text-secondary hover:theme-text-primary transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>

      <div className="relative">
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="Confirmar Contraseña"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg theme-bg-primary theme-text-primary transition-colors ${
            errors.confirmPassword ? 'border-red-500' : 'theme-border'
          }`}
        />
        <button 
          type="button" 
          onClick={() => setShowConfirmPassword(prev => !prev)} 
          className="absolute right-3 top-3 theme-text-secondary hover:theme-text-primary transition-colors"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
      </div>

      <div className="flex justify-center pt-4">
        <button 
          type="button" 
          onClick={verificarYContinuar} 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
        >
          Siguiente
        </button>
      </div>
    </form>
  );
};

export default Paso1DatosUsuario;

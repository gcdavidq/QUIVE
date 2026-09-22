import React, { useState } from 'react';
import { Eye, EyeOff, User, Truck, ArrowRight } from 'lucide-react';
import API_URL, { apiFetch } from '../../../api';
import PasoRegistro from './PasoRegistro';

const ROLES = [
  { valor: 'cliente', titulo: 'Cliente', texto: 'Quiero solicitar mudanzas', Icon: User },
  { valor: 'transportista', titulo: 'Transportista', texto: 'Quiero realizar traslados', Icon: Truck },
];

const Paso1DatosUsuario = ({ formData, setFormData, setCurrentStep }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [verificando, setVerificando] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '', general: '' }));
  };

  const soloDigitos = (e) => { if (/^\d*$/.test(e.target.value)) handleInputChange(e); };

  const validateStep = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    else if (!/^9\d{8}$/.test(formData.telefono)) newErrors.telefono = 'Debe comenzar con 9 y tener 9 dígitos';
    if (!/^\d{8}$/.test(formData.dni)) newErrors.dni = 'El DNI debe tener 8 dígitos';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 6) newErrors.password = 'Debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const verificarYContinuar = async () => {
    if (!validateStep()) return;
    try {
      setVerificando(true);
      const res = await apiFetch(`${API_URL}/auth/verificar-usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, telefono: formData.telefono, dni: formData.dni })
      });
      const result = await res.json();
      if (result.existe) {
        setErrors({ general: 'Ya existe un usuario con este email, DNI o teléfono.' });
        return;
      }
      // El código de verificación lo genera y envía el servidor en el paso 2.
      setCurrentStep(2);
    } catch (err) {
      setErrors({ general: 'No se pudo verificar tus datos. Intenta nuevamente.' });
    } finally {
      setVerificando(false);
    }
  };

  const campo = (name, label, props = {}) => (
    <div>
      <label className="field-label" htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        className={`field-input ${errors[name] ? 'field-input-error' : ''}`}
        {...props}
      />
      {errors[name] && <p className="field-error">{errors[name]}</p>}
    </div>
  );

  return (
    <PasoRegistro
      kicker="PASO 1 · TUS DATOS"
      titulo="Crea tu cuenta"
      error={errors.general}
      siguiente={{ texto: verificando ? 'Verificando...' : 'Continuar', onClick: verificarYContinuar, disabled: verificando, Icon: ArrowRight }}
    >
      <div>
        <span className="field-label">¿Cómo usarás QUIVE?</span>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map(({ valor, titulo, texto, Icon }) => {
            const activo = formData.tipoUsuario === valor;
            return (
              <button
                type="button"
                key={valor}
                onClick={() => setFormData(prev => ({ ...prev, tipoUsuario: valor }))}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  activo ? 'border-[#4d93f5] bg-blue-50/60 dark:bg-blue-950/30' : 'border-[var(--color-border)] hover:border-[#4d93f5]/50'
                }`}
              >
                <div className={`stat-icon ${activo ? 'stat-blue' : 'stat-lilac'} !h-8 !w-8 mb-2`}><Icon size={16} /></div>
                <p className="text-xs font-bold text-[#16365f] dark:text-white">{titulo}</p>
                <p className="text-[11px] text-[#8da3bd]">{texto}</p>
              </button>
            );
          })}
        </div>
      </div>

      {campo('nombre', 'Nombre completo', { type: 'text', autoComplete: 'name' })}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {campo('email', 'Correo electrónico', { type: 'email', autoComplete: 'email' })}
        {campo('telefono', 'Teléfono', { type: 'tel', maxLength: 9, onChange: soloDigitos, autoComplete: 'tel' })}
      </div>
      {campo('dni', 'DNI', { type: 'text', maxLength: 8, onChange: soloDigitos, inputMode: 'numeric' })}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          {campo('password', 'Contraseña', { type: showPassword ? 'text' : 'password', autoComplete: 'new-password' })}
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="absolute right-3 top-[34px] text-[#8da3bd] hover:text-[#4d93f5]"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {campo('confirmPassword', 'Confirmar contraseña', { type: showPassword ? 'text' : 'password', autoComplete: 'new-password' })}
      </div>
    </PasoRegistro>
  );
};

export default Paso1DatosUsuario;

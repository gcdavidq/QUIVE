import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import UbicacionPeru from "./Registerutils/address";
import SubidaDocumentos from './Registerutils/documentos';
import TarifasForm from './Registerutils/tarifas';
import SubirImagen from './utils/SubirImagen'


const RegisterScreen = ({onNavigate, setUserData}) => {
    const [direccion, setUbicacion] = useState({
      departamento: "",
      provincia: "",
      distrito: "",
      tipoVia: "",
      nombreVia: "",
      numero: ""
    });
    const [documentos, setDocumentos] = useState({
      licencia_conducir: null,
      tarjeta_propiedad: null,
      certificado_itv: null,
    });
    const [tarifas, setTarifas] = useState({
      precio_por_m3: '',
      precio_por_kg: '',
      precio_por_km: '',
      recargo_fragil: '',
      recargo_embalaje: ''
    });
    const [tiposVehiculo, setTiposVehiculo] = useState([]);
    const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    dni: '',
    password: '',
    confirmPassword: '',
    placa: '',
    tipoVehiculo: '',
    direccion: '',
    tipoUsuario: 'cliente'
  });

  const [fotoPerfil, setFotoPerfil] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/vehiculos/tipos-vehiculo')
      .then(response => {
        setTiposVehiculo(response.data);
      })
      .catch(error => {
        console.error('Error al obtener tipos de vehículo:', error);
      });
  }, []);

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.dni.trim()) newErrors.dni = 'El DNI es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    else if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    if (formData.tipoUsuario === 'transportista') {
      if (!formData.placa.trim()) newErrors.placa = 'La placa es requerida';
      if (!formData.tipoVehiculo.trim()) newErrors.tipoVehiculo = 'El tipo de vehículo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const {
      departamento,
      provincia,
      distrito,
      tipoVia,
      nombreVia,
      numero,
      lat,
      lng
    } = direccion ;
    const formPayload = new FormData();
    formPayload.append("nombre_completo", formData.nombre);
    formPayload.append("email", formData.email);
    formPayload.append("telefono", formData.telefono);
    formPayload.append("dni", parseInt(formData.dni));
    formPayload.append("contrasena", formData.password);
    formPayload.append("tipo_usuario", formData.tipoUsuario);
    const ubicacion = `${tipoVia} ${nombreVia} ${numero}, ${distrito}, ${provincia}, ${departamento}, Peru; ${lat}, ${lng}`;
    formPayload.append("ubicacion", ubicacion);
    formPayload.append("foto_perfil_url", fotoPerfil || "null");

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/register", {
        method: "POST",
        credentials: "include",
        body: formPayload,
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.msg) {
          alert(data.msg);
        } else {
          alert("Ocurrió un error al registrar.");
        }
        return;
      }
      if (formData.tipoUsuario === "transportista") {
        const documentosPayload = new FormData();
        const vehiculoPayload = new FormData();

        try {
          vehiculoPayload.append("id_usuario", data.usuario.id_usuario);
          vehiculoPayload.append("placa", formData.placa);
          vehiculoPayload.append("id_tipo_vehiculo", formData.tipoVehiculo);
          const VehResponse = await fetch("http://127.0.0.1:5000/vehiculos/me", {
            method: "POST",
            credentials: "include",
            body: vehiculoPayload,
          });

          const vehData = await VehResponse.json();

          if (!VehResponse.ok) {
            console.error("Error al registrar vehículo:", vehData);
            alert("Ocurrió un error al registrar el vehículo.");
            return; // ❌ Detiene el flujo
          }
        } catch (error) {
          console.error("Error al conectar con la API de vehículo:", error);
          alert("Ocurrió un error al enviar los datos del vehículo.");
          return;
        }

        try {
          documentosPayload.append("licencia_conducir_url", documentos.licencia_conducir);
          documentosPayload.append("tarjeta_propiedad_url", documentos.tarjeta_propiedad);
          documentosPayload.append("certificado_itv_url", documentos.certificado_itv);
          documentosPayload.append("id_usuario", data.usuario.id_usuario);

          const docResponse = await fetch("http://127.0.0.1:5000/transportistas/me/documentos", {
            method: "POST",
            credentials: "include",
            body: documentosPayload,
          });

          const docData = await docResponse.json();

          if (!docResponse.ok) {
            console.error("Error al subir documentos:", docData);
            alert("Ocurrió un error al subir los documentos.");
            return;
          }
        } catch (error) {
          console.error("Error al conectar con la API de documentos:", error);
          alert("Ocurrió un error al enviar los documentos.");
          return;
        }

        try {
          const tarifaPayload = {
            id_transportista: data.usuario.id_usuario,
            precio_por_m3: parseFloat(tarifas.precio_por_m3),
            precio_por_kg: parseFloat(tarifas.precio_por_kg),
            precio_por_km: parseFloat(tarifas.precio_por_km),
            recargo_fragil: parseFloat(tarifas.recargo_fragil) || 0.0,
            recargo_embalaje: parseFloat(tarifas.recargo_embalaje) || 0.0,
          };

          const tarifaResponse = await fetch("http://127.0.0.1:5000/transportistas/me/tarifa", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(tarifaPayload),
          });

          const tarifaData = await tarifaResponse.json();

          if (!tarifaResponse.ok) {
            console.error("Error al registrar tarifas:", tarifaData);
            alert("Ocurrió un error al registrar las tarifas.");
            return;
          }
        } catch (error) {
          console.error("Error al conectar con la API de tarifas:", error);
          alert("Ocurrió un error al enviar los datos de tarifas.");
          return;
        }
      }
      setUserData(data.usuario);
      onNavigate("registroExitoso");
    } catch (error) {
      console.error("Error al conectar con la API:", error);
      alert("Error de red o servidor.");
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
            <p className="text-gray-600 mb-2">Bienvenido a QUIVE</p>
            <h1 className="text-3xl font-bold text-blue-600 mb-6">CREAR CUENTA</h1>
            
            {/* User Type Toggle */}
            <div className="flex bg-blue-50 rounded-full p-1 mb-8">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipoUsuario: 'cliente' })}
                className={`flex-1 py-3 px-6 rounded-full transition-colors ${
                  formData.tipoUsuario === 'cliente' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-blue-400 hover:text-blue-600'
                }`}
              >
                CLIENTE
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, tipoUsuario: 'transportista' })}
                className={`flex-1 py-3 px-6 rounded-full transition-colors ${
                  formData.tipoUsuario === 'transportista' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-blue-400 hover:text-blue-600'
                }`}
              >
                TRANSPORTISTA
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <SubirImagen
              defaultPreview={null}
              onFotoSeleccionada={(file) => setFotoPerfil(file)}
              id_imagen={"fotoPerfil"}
              imgClassName="w-28 h-28 rounded-full object-cover border-4 border-blue-300 shadow-md bg-white"
            />

            <div>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre y Apellidos"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo Electrónico"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              <div>
                <input
                  type="tel"
                  name="telefono"
                  placeholder="Teléfono"
                  value={formData.telefono}
                  maxlength="9"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {  // Solo permite números
                      handleInputChange(e);
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.telefono ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
              </div>
            </div>

            <div>
              <input
                type="text"
                name="dni"
                placeholder="DNI"
                value={formData.dni}
                maxlength="8"
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {  // Solo permite números
                    handleInputChange(e);
                  }
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dni ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni}</p>}
            </div>

            <div>
                <UbicacionPeru direccion ={direccion } setUbicacion={setUbicacion} />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="relative mt-4">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {formData.tipoUsuario === 'transportista' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="placa"
                      placeholder="Placa (ej: ABC-123)"
                      value={formData.placa}
                      onChange={(e) => {
                        let raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); // Solo letras y números
                        let letters = raw.slice(0, 3).replace(/[^A-Z]/g, ""); // Solo letras en los primeros 3
                        let numbers = raw.slice(3).replace(/[^0-9]/g, "");   // Solo números después

                        let value = letters;
                        if (letters.length === 3 && numbers.length > 0) {
                          value += '-' + numbers.slice(0, 3); // Agrega guion y hasta 3 números
                        }

                        handleInputChange({ target: { name: 'placa', value } });
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.placa ? 'border-red-500' : 'border-gray-200'
                      }`}
                      maxLength={7}
                    />
                    {errors.placa && <p className="text-red-500 text-sm mt-1">{errors.placa}</p>}
                  </div>
                  <div>
                    <select
                      name="tipoVehiculo"
                      value={formData.tipoVehiculo}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.tipoVehiculo ? 'border-red-500' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Selecciona un tipo de vehículo</option>
                        {tiposVehiculo.map(tipo => (
                          <option key={tipo.id_tipo_vehiculo} value={tipo.id_tipo_vehiculo}>
                            {tipo.nombre}
                          </option>
                        ))}
                    </select>
                    {errors.tipoVehiculo && <p className="text-red-500 text-sm mt-1">{errors.tipoVehiculo}</p>}
                  </div>
                </div>
                <div>
                    <SubidaDocumentos documentos={documentos} setDocumentos={setDocumentos} />
                    {/* Puedes agregar botones para enviar o validar documentos aquí */}
                </div>
                <div>
                    <TarifasForm tarifas={tarifas} setTarifas={setTarifas} />
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              REGISTRARSE
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-600">¿Ya tienes una cuenta?</p>
            <button
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
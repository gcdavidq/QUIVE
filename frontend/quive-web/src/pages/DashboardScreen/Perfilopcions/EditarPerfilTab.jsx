import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import SubirImagen from '../../utils/SubirImagen';
import UbicacionPeru from '../../Registerutils/address';
import { useNavigate } from 'react-router-dom';
import { parseUbicacion } from '../../utils/ubicacion';
import API_URL from '../../../api';

const EditarPerfilScreen = ({ userData, setUserData}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_usuario: userData.id_usuario || '',
    nombre: userData.nombre_completo || '',
    email: userData.email || '',
    telefono: userData.telefono || '',
    dni: userData.dni || '',
    contrasena: userData.contrasena || '',
    tipo_usuario: userData.tipo_usuario,
    ubicacion: userData.Ubicacion || '',
    fotoPerfil: userData.foto_perfil_url,
  });
  const [direccion, setUbicacion] = useState(() => {
    if (userData.Ubicacion) {
      return parseUbicacion(userData.Ubicacion);
    }
    return {departamento: "",
    provincia: "",
    distrito: "",
    tipoVia: "",
    nombreVia: "",
    numero: ""};
  });



  const [showPassword, setShowPassword] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [preview, setPreview] = useState(userData.foto_perfil_url);
  console.log(preview)

  const handleInputChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formPayload = new FormData();
    formPayload.append("id_usuario", formData.id_usuario);
    formPayload.append("nombre_completo", formData.nombre);
    formPayload.append("email", formData.email);
    formPayload.append("telefono", formData.telefono);
    formPayload.append("dni", parseInt(formData.dni));
    formPayload.append("tipo_usuario", formData.tipo_usuario);
    formPayload.append("contrasena", formData.contrasena);
    formPayload.append("foto_perfil_url", fotoPerfil ?? formData.fotoPerfil);
    

    // ubicación nueva si se modificó
    if (Object.keys(direccion).length > 0) {
      const { departamento, provincia, distrito, tipoVia, nombreVia, numero, lat, lng } = direccion;
      const ubicacion = `${tipoVia} ${nombreVia} ${numero}, ${distrito}, ${provincia}, ${departamento}, Peru; ${lat}, ${lng}`;
      formPayload.append("ubicacion", ubicacion);
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        body: formPayload,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.msg || "Error al actualizar perfil.");
        return;
      }

      const usuario = data.usuario;
      setUserData(prev => ({
        ...prev,
        ...usuario
      }));// actualiza el estado global
      navigate('..');

    } catch (error) {
      console.error("Error al conectar con API:", error);
      alert("Error de red.");
    }
  };

  return (
    <div className="min-h-screen theme-bg-primary">
      <header className="theme-card p-6 flex items-center shadow-sm">
        <button
          onClick={() => navigate('..')}
          className="mr-4 p-2 theme-text-secondary hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-2xl font-bold theme-title-primary">Editar Perfil</div>
      </header>

      <div className="flex items-center justify-center py-12">
        <div className="theme-card rounded-2xl shadow-xl p-8 w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-6">
              <SubirImagen
                defaultPreview={preview}
                onFotoSeleccionada={(file) => {
                  setFotoPerfil(file);
                  setPreview(URL.createObjectURL(file));
                }}
                id_imagen="fotoPerfil"
                imgClassName="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-md"
              />
            </div>

            <input
              type="text"
              name="nombre"
              placeholder="Nombre y Apellidos"
              value={formData.nombre}
              onChange={handleInputChange}
              className="form-input"
            />

            <input
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
            />

            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              maxLength={9}
              value={formData.telefono}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) handleInputChange(e);
              }}
              className="form-input"
            />

            <input
              type="text"
              name="dni"
              placeholder="DNI"
              maxLength={8}
              value={formData.dni}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) handleInputChange(e);
              }}
              className="form-input"
            />

            <UbicacionPeru direccion={direccion} setUbicacion={setUbicacion} />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="contrasena"
                placeholder="Nueva Contraseña (opcional)"
                value={formData.contrasena}
                onChange={handleInputChange}
                className="form-input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 theme-text-secondary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 rounded-lg font-semibold"
            >
              GUARDAR CAMBIOS
            </button>
          </form>
        </div>
      </div>
    </div>
  );

};

export default EditarPerfilScreen;

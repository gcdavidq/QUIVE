import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Save } from 'lucide-react';
import SubirImagen from '../../utils/SubirImagen';
import UbicacionPeru from '../../Registerutils/address';
import { useNavigate } from 'react-router-dom';
import { parseUbicacion } from '../../utils/ubicacion';
import API_URL, { apiFetch } from '../../../api';

const EditarPerfilScreen = ({ userData, setUserData }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_usuario: userData.id_usuario || '',
    nombre: userData.nombre_completo || '',
    email: userData.email || '',
    telefono: userData.telefono || '',
    dni: userData.dni || '',
    contrasena: '',
    tipo_usuario: userData.tipo_usuario,
    ubicacion: userData.ubicacion || '',
    fotoPerfil: userData.foto_perfil_url,
  });
  const [direccion, setUbicacion] = useState(() => {
    if (userData.ubicacion && userData.ubicacion.includes(';')) {
      return parseUbicacion(userData.ubicacion);
    }
    return {
      departamento: "",
      provincia: "",
      distrito: "",
      tipoVia: "",
      nombreVia: "",
      numero: ""
    };
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [preview, setPreview] = useState(userData.foto_perfil_url);
  const [guardando, setGuardando] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);

    const formPayload = new FormData();
    formPayload.append("id_usuario", formData.id_usuario);
    formPayload.append("nombre_completo", formData.nombre);
    formPayload.append("email", formData.email);
    formPayload.append("telefono", formData.telefono);
    formPayload.append("dni", parseInt(formData.dni));
    formPayload.append("tipo_usuario", formData.tipo_usuario);
    formPayload.append("contrasena", formData.contrasena);
    formPayload.append("foto_perfil_url", fotoPerfil ?? formData.fotoPerfil);

    if (direccion.lat && direccion.lng) {
      const { departamento, provincia, distrito, tipoVia, nombreVia, numero, lat, lng } = direccion;
      const ubicacion = `${tipoVia} ${nombreVia} ${numero}, ${distrito}, ${provincia}, ${departamento}, Peru; ${lat}, ${lng}`;
      formPayload.append("ubicacion", ubicacion);
    } else {
      formPayload.append("ubicacion", formData.ubicacion);
    }

    try {
      const response = await apiFetch(`${API_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        body: formPayload,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.msg || "Error al actualizar perfil.");
        setGuardando(false);
        return;
      }

      const usuario = data.usuario;
      setUserData(prev => ({
        ...prev,
        ...usuario
      }));
      navigate('..');

    } catch (error) {
      console.error("Error al conectar con API:", error);
      alert("Error de red.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="surface-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('..')}
            className="p-2.5 rounded-xl border border-[var(--color-border)] hover:border-[#4d93f5] text-[#345273] dark:text-white transition-all"
            aria-label="Regresar a perfil"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="section-kicker">ACTUALIZACIÓN DE CUENTA</span>
            <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white mt-0.5">
              Editar Datos de Perfil
            </h1>
          </div>
        </div>
      </div>

      <div className="surface-card p-6 sm:p-8 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center justify-center mb-6">
            <SubirImagen
              defaultPreview={preview}
              onFotoSeleccionada={(file) => {
                setFotoPerfil(file);
                setPreview(URL.createObjectURL(file));
              }}
              id_imagen="fotoPerfil"
              imgClassName="w-28 h-28 rounded-2xl object-cover border-2 border-[#4d93f5]/40 shadow-lg"
            />
            <span className="text-[11px] text-[#8da3bd] mt-2 font-medium">Haz clic en la imagen para cambiar tu foto</span>
          </div>

          <div>
            <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre y apellidos"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              className="w-full text-xs font-medium py-3 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="email"
                placeholder="usuario@ejemplo.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full text-xs font-medium py-3 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                name="telefono"
                placeholder="9 dígitos"
                maxLength={9}
                value={formData.telefono}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) handleInputChange(e);
                }}
                required
                className="w-full text-xs font-medium py-3 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5">
              DNI / Documento de Identidad
            </label>
            <input
              type="text"
              name="dni"
              placeholder="8 dígitos"
              maxLength={8}
              value={formData.dni}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) handleInputChange(e);
              }}
              required
              className="w-full text-xs font-medium py-3 px-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors"
            />
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-2">
              Dirección Principal Registrada
            </span>
            <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136]">
              <UbicacionPeru direccion={direccion} setUbicacion={setUbicacion} />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#16365f] dark:text-white uppercase tracking-wider block mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="contrasena"
                placeholder="Ingresa nueva contraseña para cambiarla"
                value={formData.contrasena}
                onChange={handleInputChange}
                className="w-full text-xs font-medium py-3 pl-4 pr-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] theme-text-primary focus:outline-none focus:border-[#4d93f5] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8da3bd] hover:text-[#4d93f5]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="primary-button w-full !py-3.5 text-xs font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-6"
          >
            <Save size={16} />
            <span>{guardando ? 'Guardando cambios...' : 'Guardar Actualización de Perfil'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditarPerfilScreen;

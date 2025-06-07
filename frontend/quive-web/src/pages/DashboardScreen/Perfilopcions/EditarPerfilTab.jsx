import React, { useState, useEffect  } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import ImagenPerfil from '../../utils/ImagenPerfil';
import UbicacionPeru from '../../Registerutils/address';
import { useNavigate } from 'react-router-dom';

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

  const [direccion, setUbicacion] = useState({
    departamento: "",
    provincia: "",
    distrito: "",
    tipoVia: "",
    nombreVia: "",
    numero: ""
  });


  const parseUbicacion = (ubicacionString) => {
    if (!ubicacionString) {
      return {
        departamento: "",
        provincia: "",
        distrito: "",
        tipoVia: "",
        nombreVia: "",
        numero: "",
        lat: "",
        lng: ""
      };
    }

    const [parteDireccion, parteCoordenaas] = ubicacionString.split(";");
    const [lat, lng] = parteCoordenaas.split(",").map(parseFloat);
    const trozos = parteDireccion.split(",").map((s) => s.trim());
    const primeraParte = trozos[0] || "";
    const segmento = primeraParte.split(" ").filter((x) => x.length > 0);
    let tipoVia = "";
    let numero = "";
    let nombreVia = "";

    if (segmento.length >= 2) {
      tipoVia = segmento[0];                                   // "Calle"
      numero = segmento[segmento.length - 1];                  // "205"
      nombreVia = segmento.slice(1, segmento.length - 1).join(" "); // "Independencia"
    } else {
      nombreVia = primeraParte;
    }
    const distrito = trozos[1] || "";
    const provincia = trozos[2] || "";
    const departamento = trozos[3] || "";

    return { departamento, provincia, distrito, tipoVia, nombreVia, numero, lat, lng};
  };

  useEffect(() => {
    const nuevaDireccion = parseUbicacion(formData.ubicacion);
    setUbicacion(nuevaDireccion);
  }, [formData.ubicacion]);

  const [showPassword, setShowPassword] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [preview, setPreview] = useState(userData.foto_perfil_url);

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
    if (fotoPerfil) formPayload.append("foto_perfil_url", fotoPerfil);
    

    // ubicación nueva si se modificó
    if (Object.keys(direccion).length > 0) {
      const { departamento, provincia, distrito, tipoVia, nombreVia, numero, lat, lng } = direccion;
      const ubicacion = `${tipoVia} ${nombreVia} ${numero}, ${distrito}, ${provincia}, ${departamento}, Peru; ${lat}, ${lng}`;
      formPayload.append("ubicacion", ubicacion);
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/register", {
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
      setUserData(usuario);// actualiza el estado global
      navigate('..');

    } catch (error) {
      console.error("Error al conectar con API:", error);
      alert("Error de red.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm p-6 flex items-center">
        <button
          onClick={() => navigate('..')}
          className="mr-4 p-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-2xl font-bold text-blue-600">Editar Perfil</div>
      </header>

      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-6">
              <label htmlFor="fotoPerfil" className="cursor-pointer">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 shadow-md relative">
                  {preview || formData.fotoPerfil ? (
                    <ImagenPerfil fotoUrl={preview || formData.fotoPerfil} />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      Sin imagen
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-20 hover:bg-opacity-30 transition-opacity flex items-center justify-center text-white text-sm">
                    Cambiar
                  </div>
                </div>
                <input
                  id="fotoPerfil"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFotoPerfil(file);                      // archivo para enviar
                      setPreview(URL.createObjectURL(file));    // vista previa en local
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <input
              type="text"
              name="nombre"
              placeholder="Nombre y Apellidos"
              value={formData.nombre}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Correo Electrónico"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              maxLength={9}
              value={formData.telefono}
              onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {  // Solo permite números
                    handleInputChange(e);
                  }
                }}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              name="dni"
              placeholder="DNI"
              maxLength={8}
              value={formData.dni}
              onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*$/.test(value)) {  // Solo permite números
                    handleInputChange(e);
                  }
                }}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <UbicacionPeru direccion={direccion} setUbicacion={setUbicacion} />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="contrasena"
                placeholder="Nueva Contraseña (opcional)"
                value={formData.contrasena}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
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

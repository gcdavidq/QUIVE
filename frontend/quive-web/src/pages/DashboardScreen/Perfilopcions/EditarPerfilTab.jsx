import React, { useState } from 'react';
import ImagenPerfil from '../../utils/ImagenPerfil';
const EditarPerfilTab = ({ userData }) => {
  const [formData, setFormData] = useState({
    nombre: userData.nombre_completo || '',
    email: userData.email || '',
    telefono: userData.telefono || '',
    dni: userData.dni || '',
    password: '',
    tipo_usuario: userData.tipo_usuario || '',
    ubicacion: userData.Ubicacion || '',
    // Ahora asumimos que `fotoPerfil` es el ID de Google Drive
    fotoPerfil: userData.foto_perfil_url,
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    const formPayload = new FormData();
    formPayload.append('nombre_completo', formData.nombre);
    formPayload.append('email', formData.email);
    formPayload.append('telefono', formData.telefono);
    formPayload.append('dni', parseInt(formData.dni, 10));
    formPayload.append('contrasena', formData.password);
    formPayload.append('tipo_usuario', formData.tipo_usuario);
    formPayload.append('ubicacion', formData.ubicacion);
    // Guardamos el ID de Drive en lugar de URL
    formPayload.append('foto_perfil_id', formData.fotoPerfil || '');

    // Aquí podrías enviar `formPayload` a tu API:
    // fetch('/api/actualizar-perfil', { method: 'POST', body: formPayload })
    //   .then(...)
    //   .catch(...);
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold text-blue-700 mb-6 text-center">
        Editar Perfil
      </h2>

      {/* Vista previa de imagen */}
      <div className="flex flex-col items-center mb-6">
        {formData.fotoPerfil ? (
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 mb-4">
           <ImagenPerfil fotoUrl={formData.fotoPerfil} />
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          </div>
        )}
        <input
          name="fotoPerfil"
          value={formData.fotoPerfil}
          onChange={handleChange}
          className="w-full md:w-2/3 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="ID de Google Drive de la foto"
        />
      </div>
      {/* Fin vista previa */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-2">
          <label htmlFor="nombre" className="text-gray-700 font-medium">
            Nombre completo
          </label>
          <input
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Ingresa tu nombre"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-gray-700 font-medium">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="usuario@ejemplo.com"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="telefono" className="text-gray-700 font-medium">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Ej: +51 912345678"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="dni" className="text-gray-700 font-medium">
            DNI
          </label>
          <input
            id="dni"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Ej: 12345678"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="password" className="text-gray-700 font-medium">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Nueva contraseña"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="tipo_usuario" className="text-gray-700 font-medium">
            Tipo de Usuario
          </label>
          <input
            id="tipo_usuario"
            name="tipo_usuario"
            value={formData.tipo_usuario}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Ej: Administrador, Cliente"
          />
        </div>

        <div className="flex flex-col space-y-2 md:col-span-2">
          <label htmlFor="ubicacion" className="text-gray-700 font-medium">
            Ubicación
          </label>
          <input
            id="ubicacion"
            name="ubicacion"
            value={formData.ubicacion}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Ciudad, País"
          />
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-200"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default EditarPerfilTab;

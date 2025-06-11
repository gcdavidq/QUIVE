import React, { useState } from 'react';

const SubirImagen = ({ defaultPreview, onFotoSeleccionada, id_imagen = "fotoPerfil", imgClassName }) => {
  const [preview, setPreview] = useState(defaultPreview || null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFotoSeleccionada(file);
    }
  };

  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        <label htmlFor={id_imagen} className="cursor-pointer">
          <img
            src={preview || "https://www.w3schools.com/howto/img_avatar.png"}
            alt="Foto de perfil"
            className={imgClassName || "w-28 h-28 rounded-full object-cover"} // ← configurable
          />
        </label>
        <input
          id={id_imagen}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default SubirImagen;
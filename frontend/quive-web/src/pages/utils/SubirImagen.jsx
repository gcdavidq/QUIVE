import React, { useEffect, useState } from "react";

const SubirImagen = ({
  defaultPreview,
  onFotoSeleccionada,
  id_imagen = "imagen",
  imgClassName,
  editable = true,
}) => {
  const [preview, setPreview] = useState(defaultPreview || null);

  useEffect(() => {
    setPreview(defaultPreview || null);
  }, [defaultPreview]);

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
        {editable ? (
          <>
            <label htmlFor={id_imagen} className="cursor-pointer">
              <img
                src={preview || "https://www.w3schools.com/howto/img_avatar.png"}
                alt="Foto de perfil"
                className={imgClassName || "w-28 h-28 rounded-full object-cover"}
              />
            </label>
            <input
              id={id_imagen}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
          </>
        ) : (
          <img
            src={preview || "https://www.w3schools.com/howto/img_avatar.png"}
            alt={id_imagen}
            className={imgClassName || "w-28 h-28 rounded-full object-cover"}
          />
        )}
      </div>
    </div>
  );
};

export default SubirImagen;

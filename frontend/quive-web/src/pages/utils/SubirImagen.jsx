import React, { useEffect, useState } from "react";
import { User, Camera } from 'lucide-react';

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
      setPreview(URL.createObjectURL(file));
      onFotoSeleccionada(file);
    }
  };

  const clases = imgClassName || "w-28 h-28 rounded-2xl object-cover";

  // Sin foto se muestra un marcador neutro, no una imagen externa de otra persona.
  const imagen = preview ? (
    <img src={preview} alt="Foto de perfil" className={clases} onError={() => setPreview(null)} />
  ) : (
    <div className={`${clases} stat-blue flex items-center justify-center`}>
      {editable ? <Camera size={28} /> : <User size={28} />}
    </div>
  );

  if (!editable) return imagen;

  return (
    <div className="flex justify-center">
      <label htmlFor={id_imagen} className="cursor-pointer">{imagen}</label>
      <input id={id_imagen} type="file" accept="image/*" onChange={handleChange} className="hidden" />
    </div>
  );
};

export default SubirImagen;

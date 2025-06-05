import React from "react";

function ImagenPerfil({ fotoUrl }) {
  if (!fotoUrl) return null;

  // Convertir ?dl=0 a ?raw=1 para mostrar directamente la imagen
  const imagenUrl = fotoUrl
  .replace("www.dropbox.com", "dl.dropboxusercontent.com")
  .replace("?dl=0", "");

  return (
      <img
        src={imagenUrl}
        alt="Foto de perfil"
        className="object-cover w-full h-full"
      />
  );
}

export default ImagenPerfil;

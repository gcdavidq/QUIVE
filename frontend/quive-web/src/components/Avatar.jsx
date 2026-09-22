import React, { useState } from 'react';

// La foto es la del usuario en la base de datos. Si no tiene, se muestran sus iniciales:
// nunca una foto de stock de otra persona haciéndose pasar por él.
const iniciales = (nombre) => {
  const partes = (nombre || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
};

const Avatar = ({ foto, nombre, className = 'w-10 h-10 rounded-full text-xs' }) => {
  const [rota, setRota] = useState(false);

  if (foto && !rota) {
    return (
      <img
        src={foto}
        alt={nombre || 'Usuario'}
        onError={() => setRota(true)}
        className={`${className} object-cover border border-[var(--color-border)] flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${className} stat-blue font-bold flex items-center justify-center flex-shrink-0`} aria-label={nombre || 'Usuario'}>
      {iniciales(nombre)}
    </div>
  );
};

export default Avatar;

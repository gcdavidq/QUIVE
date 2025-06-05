import React from 'react';

const Configuracion = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Configuración</h2>
      <ul className="space-y-4">
        <li className="bg-white p-4 rounded shadow">Idioma: Español</li>
        <li className="bg-white p-4 rounded shadow">Notificaciones: Activadas</li>
      </ul>
    </div>
  );
};

export default Configuracion;

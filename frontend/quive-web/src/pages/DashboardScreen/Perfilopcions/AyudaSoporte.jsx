import React from 'react';

const AyudaSoporte = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Ayuda y Soporte</h2>
      <p className="mb-4">¿Tienes alguna duda o problema?</p>
      <div className="bg-white p-4 rounded shadow">
        Escríbenos a: <a href="mailto:soporte@quive.com" className="text-blue-600">soporte@quive.com</a>
      </div>
    </div>
  );
};

export default AyudaSoporte;

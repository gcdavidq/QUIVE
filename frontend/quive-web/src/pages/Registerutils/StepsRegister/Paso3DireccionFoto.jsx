import React from 'react';
import UbicacionPeru from '../address';
import SubirImagen from '../../utils/SubirImagen';

const Paso3DireccionFoto = ({ direccion, setUbicacion, setFotoPerfil, setCurrentStep, formData }) => {
  const puedeContinuar = () => {
    const { departamento, provincia, distrito, tipoVia, nombreVia, numero } = direccion;
    return departamento && tipoVia && (provincia || distrito || nombreVia || numero);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-600 text-center">Ubicación y Foto de Perfil</h2>

      <div className="flex justify-center">
        <SubirImagen
          defaultPreview={null}
          onFotoSeleccionada={(file) => setFotoPerfil(file)}
          id_imagen="fotoPerfil"
          imgClassName="w-28 h-28 rounded-full object-cover border-4 border-blue-300 shadow-md theme-bg-primary"
        />
      </div>

      <UbicacionPeru direccion={direccion} setUbicacion={setUbicacion} />

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="px-6 py-3 theme-bg-secondary theme-text-primary rounded-lg hover:opacity-80 font-semibold transition-opacity"
        >
          Volver
        </button>

        <button
          type="button"
          onClick={() => {
            if (formData.tipoUsuario === 'transportista') {
              setCurrentStep(4);
            } else {
              setCurrentStep(6);
            }
          }}
          disabled={!puedeContinuar()}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
            puedeContinuar() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default Paso3DireccionFoto;
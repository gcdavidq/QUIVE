import React from 'react';
import { ArrowRight } from 'lucide-react';
import UbicacionPeru from '../address';
import SubirImagen from '../../utils/SubirImagen';
import PasoRegistro from './PasoRegistro';

const Paso3DireccionFoto = ({ direccion, setUbicacion, setFotoPerfil, setCurrentStep, formData }) => {
  const esTransportista = formData.tipoUsuario === 'transportista';
  // Las coordenadas son obligatorias: con ellas se calcula la distancia del transportista
  // al origen de cada solicitud. Sin ellas el transportista nunca aparecería como candidato.
  const puedeContinuar = Boolean(direccion.lat && direccion.lng);

  return (
    <PasoRegistro
      kicker="PASO 3 · UBICACIÓN Y FOTO"
      titulo="¿Dónde te encuentras?"
      descripcion={esTransportista
        ? 'Tu ubicación se usa para calcular la distancia a las mudanzas que te asignen.'
        : 'Tu dirección se usará como origen sugerido al solicitar una mudanza.'}
      anterior={{ onClick: () => setCurrentStep(1) }}
      siguiente={{ onClick: () => setCurrentStep(esTransportista ? 4 : 6), disabled: !puedeContinuar, Icon: ArrowRight }}
    >
      <div className="flex flex-col items-center gap-2">
        <SubirImagen
          defaultPreview={null}
          onFotoSeleccionada={(file) => setFotoPerfil(file)}
          id_imagen="fotoPerfil"
          imgClassName="w-24 h-24 rounded-2xl object-cover border-2 border-[#4d93f5]/40"
        />
        <span className="text-[11px] text-[#8da3bd]">Foto de perfil (opcional)</span>
      </div>

      <div>
        <span className="field-label">Dirección</span>
        <UbicacionPeru direccion={direccion} setUbicacion={setUbicacion} />
        {!puedeContinuar && (
          <p className="text-[11px] text-[#8da3bd] mt-1.5">Busca tu dirección y selecciónala en el mapa para continuar.</p>
        )}
      </div>
    </PasoRegistro>
  );
};

export default Paso3DireccionFoto;

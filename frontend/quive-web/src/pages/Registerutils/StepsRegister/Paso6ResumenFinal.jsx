import React, { useState } from 'react';
import { Check } from 'lucide-react';
import API_URL, { apiFetch, setAuthToken } from "../../../api";
import PasoRegistro from './PasoRegistro';

const Dato = ({ etiqueta, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-3 text-xs">
    <span className="font-bold text-[#16365f] dark:text-white sm:w-28 flex-shrink-0">{etiqueta}</span>
    <span className="theme-text-secondary break-words">{children}</span>
  </div>
);

const exigirOk = async (respuesta, mensaje) => {
  if (respuesta.ok) return;
  const data = await respuesta.json().catch(() => ({}));
  throw new Error(data.msg || mensaje);
};

const Paso6ResumenFinal = ({ formData, direccion, fotoPerfil, documentos, tarifas, onNavigate, setCurrentStep }) => {
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const esTransportista = formData.tipoUsuario === "transportista";

  const enviarRegistro = async () => {
    const { departamento, provincia, distrito, tipoVia, nombreVia, numero, lat, lng } = direccion;
    const formPayload = new FormData();
    formPayload.append("nombre_completo", formData.nombre);
    formPayload.append("email", formData.email);
    formPayload.append("telefono", formData.telefono);
    formPayload.append("dni", formData.dni);
    formPayload.append("contrasena", formData.password);
    formPayload.append("tipo_usuario", formData.tipoUsuario);
    formPayload.append("ubicacion", `${tipoVia} ${nombreVia} ${numero}, ${distrito}, ${provincia}, ${departamento}, Peru; ${lat}, ${lng}`);
    if (fotoPerfil) formPayload.append("foto_perfil_url", fotoPerfil);

    try {
      setEnviando(true);
      setError('');
      const response = await apiFetch(`${API_URL}/auth/register`, { method: "POST", body: formPayload });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || "Error al registrar usuario.");

      if (esTransportista) {
        // Vehículo, documentos y tarifa se registran ya autenticado como el nuevo transportista:
        // el backend toma el id de la sesión, no del formulario.
        setAuthToken(data.token);

        const vehiculoPayload = new FormData();
        vehiculoPayload.append("placa", formData.placa);
        vehiculoPayload.append("id_tipo_vehiculo", formData.tipoVehiculo);
        await exigirOk(
          await apiFetch(`${API_URL}/vehiculos/me`, { method: "POST", body: vehiculoPayload }),
          "Tu cuenta se creó, pero no se pudo registrar el vehículo.");

        const documentosPayload = new FormData();
        documentosPayload.append("licencia_conducir_url", documentos.licencia_conducir);
        documentosPayload.append("tarjeta_propiedad_url", documentos.tarjeta_propiedad);
        documentosPayload.append("certificado_itv_url", documentos.certificado_itv);
        await exigirOk(
          await apiFetch(`${API_URL}/transportistas/me/documentos`, { method: "POST", body: documentosPayload }),
          "Tu cuenta se creó, pero no se pudieron subir los documentos.");

        await exigirOk(
          await apiFetch(`${API_URL}/transportistas/me/tarifa`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_transportista: data.usuario.id_usuario,
              precio_por_m3: parseFloat(tarifas.precio_por_m3),
              precio_por_kg: parseFloat(tarifas.precio_por_kg),
              precio_por_km: parseFloat(tarifas.precio_por_km),
              recargo_fragil: parseFloat(tarifas.recargo_fragil) || 0.0,
              recargo_embalaje: parseFloat(tarifas.recargo_embalaje) || 0.0,
            }),
          }),
          "Tu cuenta se creó, pero no se pudieron guardar las tarifas.");
      }

      onNavigate("/registroExitoso");
    } catch (err) {
      console.error("Error en el registro final:", err);
      setError(err.message || "Ocurrió un error al registrar. Intenta nuevamente.");
    } finally {
      setAuthToken(null);
      setEnviando(false);
    }
  };

  return (
    <PasoRegistro
      kicker="ÚLTIMO PASO · RESUMEN"
      titulo="Revisa tus datos"
      error={error}
      anterior={{ onClick: () => setCurrentStep(esTransportista ? 5 : 3) }}
      siguiente={{ texto: enviando ? 'Creando cuenta...' : 'Confirmar registro', onClick: enviarRegistro, disabled: enviando, Icon: Check }}
    >
      <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136] space-y-2.5">
        <Dato etiqueta="Tipo de cuenta"><span className="capitalize">{formData.tipoUsuario}</span></Dato>
        <Dato etiqueta="Nombre">{formData.nombre}</Dato>
        <Dato etiqueta="Email">{formData.email}</Dato>
        <Dato etiqueta="Teléfono">{formData.telefono}</Dato>
        <Dato etiqueta="DNI">{formData.dni}</Dato>
        <Dato etiqueta="Dirección">
          {direccion.tipoVia} {direccion.nombreVia} {direccion.numero}, {direccion.distrito}, {direccion.provincia}, {direccion.departamento}
        </Dato>
      </div>

      {esTransportista && (
        <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[#fbfdff] dark:bg-[#112136] space-y-2.5">
          <Dato etiqueta="Vehículo">{formData.tipoVehiculoNombre} · Placa {formData.placa}</Dato>
          <Dato etiqueta="Documentos">Licencia, tarjeta de propiedad y certificado ITV adjuntos</Dato>
          <Dato etiqueta="Tarifas">
            S/ {tarifas.precio_por_km} por km · S/ {tarifas.precio_por_m3} por m³ · S/ {tarifas.precio_por_kg} por kg
            {tarifas.recargo_fragil && ` · frágil S/ ${tarifas.recargo_fragil}`}
            {tarifas.recargo_embalaje && ` · embalaje S/ ${tarifas.recargo_embalaje}`}
          </Dato>
        </div>
      )}
    </PasoRegistro>
  );
};

export default Paso6ResumenFinal;

import React from 'react';

const Paso6ResumenFinal = ({ formData, direccion, fotoPerfil, documentos, tarifas, setUserData, onNavigate }) => {
  const enviarRegistro = async () => {
    const { departamento, provincia, distrito, tipoVia, nombreVia, numero, lat, lng } = direccion;
    const formPayload = new FormData();
    formPayload.append("nombre_completo", formData.nombre);
    formPayload.append("email", formData.email);
    formPayload.append("telefono", formData.telefono);
    formPayload.append("dni", parseInt(formData.dni));
    formPayload.append("contrasena", formData.password);
    formPayload.append("tipo_usuario", formData.tipoUsuario);
    const ubicacion = `${tipoVia} ${nombreVia} ${numero}, ${distrito}, ${provincia}, ${departamento}, Peru; ${lat || ''}, ${lng || ''}`;
    formPayload.append("ubicacion", ubicacion);
    formPayload.append("foto_perfil_url", fotoPerfil || "null");

    try {
      const response = await fetch("http://127.0.0.1:5000/auth/register", {
        method: "POST",
        credentials: "include",
        body: formPayload,
      });

      const data = await response.json();
      if (!response.ok) return alert(data.msg || "Error al registrar usuario.");

      if (formData.tipoUsuario === "transportista") {
        const vehiculoPayload = new FormData();
        vehiculoPayload.append("id_usuario", data.usuario.id_usuario);
        vehiculoPayload.append("placa", formData.placa);
        vehiculoPayload.append("id_tipo_vehiculo", formData.tipoVehiculo);
        await fetch("http://127.0.0.1:5000/vehiculos/me", {
          method: "POST",
          credentials: "include",
          body: vehiculoPayload,
        });

        const documentosPayload = new FormData();
        documentosPayload.append("licencia_conducir_url", documentos.licencia_conducir);
        documentosPayload.append("tarjeta_propiedad_url", documentos.tarjeta_propiedad);
        documentosPayload.append("certificado_itv_url", documentos.certificado_itv);
        documentosPayload.append("id_usuario", data.usuario.id_usuario);
        await fetch("http://127.0.0.1:5000/transportistas/me/documentos", {
          method: "POST",
          credentials: "include",
          body: documentosPayload,
        });

        const tarifaPayload = {
          id_transportista: data.usuario.id_usuario,
          precio_por_m3: parseFloat(tarifas.precio_por_m3),
          precio_por_kg: parseFloat(tarifas.precio_por_kg),
          precio_por_km: parseFloat(tarifas.precio_por_km),
          recargo_fragil: parseFloat(tarifas.recargo_fragil) || 0.0,
          recargo_embalaje: parseFloat(tarifas.recargo_embalaje) || 0.0,
        };

        await fetch("http://127.0.0.1:5000/transportistas/me/tarifa", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tarifaPayload),
        });
      }

      setUserData(data.usuario);
      onNavigate("registroExitoso");
    } catch (error) {
      console.error("Error en el registro final:", error);
      alert("Ocurrió un error al registrar. Intente nuevamente.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-600 text-center">Resumen Final</h2>

      <div className="text-sm text-gray-700 space-y-2">
        <p><strong>Nombre:</strong> {formData.nombre}</p>
        <p><strong>Email:</strong> {formData.email}</p>
        <p><strong>Teléfono:</strong> {formData.telefono}</p>
        <p><strong>DNI:</strong> {formData.dni}</p>
        <p><strong>Dirección:</strong> {direccion.tipoVia} {direccion.nombreVia} {direccion.numero}, {direccion.distrito}, {direccion.provincia}, {direccion.departamento}</p>
        <p><strong>Tipo Usuario:</strong> {formData.tipoUsuario}</p>
        {formData.tipoUsuario === 'transportista' && (
          <>
            <p><strong>Placa:</strong> {formData.placa}</p>
            <p><strong>Tipo Vehículo:</strong> {formData.tipoVehiculo}</p>
            <p><strong>Tarifas:</strong> S/{tarifas.precio_por_m3}/m³, S/{tarifas.precio_por_kg}/kg, S/{tarifas.precio_por_km}/km</p>
            <p><strong>Recargo Frágil:</strong> S/{tarifas.recargo_fragil || '0.00'}</p>
            <p><strong>Recargo Embalaje:</strong> S/{tarifas.recargo_embalaje || '0.00'}</p>
          </>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={() => setUserData(null) || onNavigate('landing')}
          className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={enviarRegistro}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Confirmar Registro
        </button>
      </div>
    </div>
  );
};

export default Paso6ResumenFinal;

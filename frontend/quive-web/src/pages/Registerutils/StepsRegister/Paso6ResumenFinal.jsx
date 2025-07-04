import React from 'react';
import API_URL from "../../../api";

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
      const response = await fetch(`${API_URL}/auth/register`, {
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
        await fetch(`${API_URL}/vehiculos/me`, {
          method: "POST",
          credentials: "include",
          body: vehiculoPayload,
        });

        const documentosPayload = new FormData();
        documentosPayload.append("licencia_conducir_url", documentos.licencia_conducir);
        documentosPayload.append("tarjeta_propiedad_url", documentos.tarjeta_propiedad);
        documentosPayload.append("certificado_itv_url", documentos.certificado_itv);
        documentosPayload.append("id_usuario", data.usuario.id_usuario);
        await fetch(`${API_URL}/transportistas/me/documentos`, {
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

        await fetch(`${API_URL}/transportistas/me/tarifa`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tarifaPayload),
        });
      }

      onNavigate("registroExitoso");
    } catch (error) {
      console.error("Error en el registro final:", error);
      alert("Ocurrió un error al registrar. Intente nuevamente.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-blue-600 text-center">Resumen Final</h2>

      <div className="theme-card p-6 rounded-lg space-y-4">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-semibold theme-text-primary min-w-24">Nombre:</span>
            <span className="theme-text-secondary">{formData.nombre}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-semibold theme-text-primary min-w-24">Email:</span>
            <span className="theme-text-secondary">{formData.email}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-semibold theme-text-primary min-w-24">Teléfono:</span>
            <span className="theme-text-secondary">{formData.telefono}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-semibold theme-text-primary min-w-24">DNI:</span>
            <span className="theme-text-secondary">{formData.dni}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="font-semibold theme-text-primary min-w-24">Dirección:</span>
            <span className="theme-text-secondary">
              {direccion.tipoVia} {direccion.nombreVia} {direccion.numero}, {direccion.distrito}, {direccion.provincia}, {direccion.departamento}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="font-semibold theme-text-primary min-w-24">Tipo Usuario:</span>
            <span className="theme-text-secondary capitalize">{formData.tipoUsuario}</span>
          </div>
          
          {formData.tipoUsuario === 'transportista' && (
            <>
              <div className="theme-border border-t pt-4 mt-4">
                <h3 className="font-semibold theme-text-primary mb-3 text-lg">Información del Vehículo</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium theme-text-primary text-sm">Placa:</span>
                    <span className="theme-text-secondary">{formData.placa}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="font-medium theme-text-primary text-sm">Tipo Vehículo:</span>
                    <span className="theme-text-secondary">{formData.tipoVehiculo}</span>
                  </div>
                </div>
              </div>
              
              <div className="theme-border border-t pt-4 mt-4">
                <h3 className="font-semibold theme-text-primary mb-3 text-lg">Tarifas</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="theme-bg-secondary p-3 rounded-lg">
                    <span className="font-medium theme-text-primary text-sm block mb-1">Por m³:</span>
                    <span className="theme-text-secondary font-semibold">S/{tarifas.precio_por_m3}</span>
                  </div>
                  
                  <div className="theme-bg-secondary p-3 rounded-lg">
                    <span className="font-medium theme-text-primary text-sm block mb-1">Por kg:</span>
                    <span className="theme-text-secondary font-semibold">S/{tarifas.precio_por_kg}</span>
                  </div>
                  
                  <div className="theme-bg-secondary p-3 rounded-lg">
                    <span className="font-medium theme-text-primary text-sm block mb-1">Por km:</span>
                    <span className="theme-text-secondary font-semibold">S/{tarifas.precio_por_km}</span>
                  </div>
                </div>
                
                {(tarifas.recargo_fragil || tarifas.recargo_embalaje) && (
                  <div className="mt-4 pt-3 theme-border border-t">
                    <h4 className="font-medium theme-text-primary mb-2 text-sm">Recargos Adicionales:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tarifas.recargo_fragil && (
                        <div className="theme-bg-secondary p-2 rounded">
                          <span className="font-medium theme-text-primary text-sm block">Frágil:</span>
                          <span className="theme-text-secondary">S/{tarifas.recargo_fragil}</span>
                        </div>
                      )}
                      
                      {tarifas.recargo_embalaje && (
                        <div className="theme-bg-secondary p-2 rounded">
                          <span className="font-medium theme-text-primary text-sm block">Embalaje:</span>
                          <span className="theme-text-secondary">S/{tarifas.recargo_embalaje}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
        <button
          type="button"
          onClick={() => setUserData(null) || onNavigate('landing')}
          className="px-6 py-3 theme-bg-secondary theme-text-primary rounded-lg hover:opacity-80 font-semibold transition-all duration-200 theme-border border"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={enviarRegistro}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Confirmar Registro
        </button>
      </div>
    </div>
  );
};

export default Paso6ResumenFinal;

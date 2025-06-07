import React from "react";
import UbicacionPeru from "../pages/Registerutils/address";
import SubidaDocumentos from "../pages/Registerutils/documentos";
import TarifasForm from "../pages/Registerutils/tarifas";

const FormularioPerfil = ({
  modo = "registro",
  userType,
  setUserType,
  formData,
  setFormData,
  direccion,
  setUbicacion,
  documentos,
  setDocumentos,
  tarifas,
  setTarifas,
  errores = {},
  setErrores = () => {},
}) => {
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errores[e.target.name]) {
      setErrores({ ...errores, [e.target.name]: "" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <label htmlFor="fotoPerfil" className="cursor-pointer">
            <img
              src={formData.preview || formData.fotoPerfil || "https://www.w3schools.com/howto/img_avatar.png"}
              alt="Foto de perfil"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-300 shadow-md bg-white"
            />
          </label>
          <input
            id="fotoPerfil"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setFormData({
                  ...formData,
                  fotoPerfil: file,
                  preview: URL.createObjectURL(file),
                });
              }
            }}
            className="hidden"
          />
        </div>
      </div>

      <input
        type="text"
        name="nombre"
        placeholder="Nombre y Apellidos"
        value={formData.nombre}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border rounded-lg"
      />

      <input
        type="email"
        name="email"
        placeholder="Correo Electrónico"
        value={formData.email}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border rounded-lg"
      />

      <input
        type="tel"
        name="telefono"
        placeholder="Teléfono"
        value={formData.telefono}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border rounded-lg"
      />

      <input
        type="text"
        name="dni"
        placeholder="DNI"
        value={formData.dni}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border rounded-lg"
      />

      <UbicacionPeru direccion={direccion} setUbicacion={setUbicacion} />

      {modo === "registro" && (
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border rounded-lg"
        />
      )}

      {userType === "transportista" && (
        <>
          <input
            type="text"
            name="placa"
            placeholder="Placa"
            value={formData.placa}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg"
          />

          <select
            name="tipoVehiculo"
            value={formData.tipoVehiculo}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border rounded-lg"
          >
            <option value="">Selecciona tipo de vehículo</option>
            {(formData.opcionesVehiculo || []).map((tipo) => (
              <option key={tipo.id_tipo_vehiculo} value={tipo.id_tipo_vehiculo}>
                {tipo.nombre}
              </option>
            ))}
          </select>

          <SubidaDocumentos documentos={documentos} setDocumentos={setDocumentos} />
          <TarifasForm tarifas={tarifas} setTarifas={setTarifas} />
        </>
      )}
    </div>
  );
};

export default FormularioPerfil;

// src/components/ubicacion.jsx

export const parseUbicacion = (ubicacionString) => {
  if (!ubicacionString) {
    return {
      departamento: "",
      provincia: "",
      distrito: "",
      tipoVia: "",
      nombreVia: "",
      numero: "",
      lat: "",
      lng: ""
    };
  }

  const [parteDireccion, parteCoordenaas] = ubicacionString.split(";");
  const [lat, lng] = parteCoordenaas.split(",").map(parseFloat);
  const trozos = parteDireccion.split(",").map((s) => s.trim());
  const primeraParte = trozos[0] || "";
  const segmento = primeraParte.split(" ").filter((x) => x.length > 0);

  let tipoVia = "", numero = "", nombreVia = "";

  if (segmento.length >= 2) {
    tipoVia = segmento[0];
    numero = segmento[segmento.length - 1];
    nombreVia = segmento.slice(1, segmento.length - 1).join(" ");
  } else {
    nombreVia = primeraParte;
  }

  const distrito = trozos[1] || "";
  const provincia = trozos[2] || "";
  const departamento = trozos[3] || "";

  return { departamento, provincia, distrito, tipoVia, nombreVia, numero, lat, lng };
};

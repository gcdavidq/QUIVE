import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const useUbicacionDesdeExcel = () => {
  const [datosUbicacion, setDatosUbicacion] = useState({});

  useEffect(() => {
    const fetchExcel = async () => {
      const response = await fetch("/distrito.xlsx");
      const data = await response.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const ubicacion = {};

      rows.forEach((row) => {
        const departamento = row["departamento"]?.trim();
        const provincia = row["provincia"]?.trim();
        const distrito = row["distrito"]?.trim();

        if (departamento && provincia && distrito) {
          if (!ubicacion[departamento]) ubicacion[departamento] = {};
          if (!ubicacion[departamento][provincia]) ubicacion[departamento][provincia] = [];

          if (!ubicacion[departamento][provincia].includes(distrito)) {
            ubicacion[departamento][provincia].push(distrito);
          }
        }
      });

      setDatosUbicacion(ubicacion);
    };

    fetchExcel();
  }, []);

  return datosUbicacion;
};

export default useUbicacionDesdeExcel;
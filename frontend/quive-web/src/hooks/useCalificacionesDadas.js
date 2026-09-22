import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';

// Ids de asignación que el usuario autenticado ya calificó.
const useCalificacionesDadas = (userData) => {
  const [calificadas, setCalificadas] = useState(new Set());

  const recargar = useCallback(async () => {
    if (!userData?.id_usuario) return;
    try {
      const res = await axios.get(`${API_URL}/calificaciones/me`);
      const propias = (Array.isArray(res.data) ? res.data : []).filter((c) => c.calificador === userData.id_usuario);
      setCalificadas(new Set(propias.map((c) => c.id_asignacion)));
    } catch (err) {
      console.error('Error al cargar calificaciones:', err);
    }
  }, [userData?.id_usuario]);

  useEffect(() => { recargar(); }, [recargar]);

  return { calificadas, recargar };
};

export default useCalificacionesDadas;

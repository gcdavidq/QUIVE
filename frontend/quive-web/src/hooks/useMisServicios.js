import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';

// Servicios (asignaciones) del usuario autenticado. El backend valida que el id y el
// rol de la URL coincidan con la sesión, así que cada rol solo puede ver los suyos.
const useMisServicios = (userData, { intervaloMs = 0 } = {}) => {
  const [servicios, setServicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    if (!userData?.id_usuario || !userData?.tipo_usuario) return;
    try {
      const res = await axios.get(`${API_URL}/asignaciones/${userData.id_usuario}/${userData.tipo_usuario}`);
      setServicios(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('Error al cargar servicios:', err);
      setError('No se pudieron cargar tus servicios. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  }, [userData?.id_usuario, userData?.tipo_usuario]);

  useEffect(() => {
    recargar();
    if (!intervaloMs) return undefined;
    const id = setInterval(recargar, intervaloMs);
    return () => clearInterval(id);
  }, [recargar, intervaloMs]);

  return { servicios, cargando, error, recargar };
};

export default useMisServicios;

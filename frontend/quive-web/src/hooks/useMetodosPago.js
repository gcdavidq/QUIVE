import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../api';

// Métodos de pago del usuario, siempre desde la base de datos. Antes se cacheaban en
// localStorage sin distinguir usuario: al cambiar de cuenta en el mismo navegador se
// veían (y se usaban para cobrar) los métodos de la cuenta anterior.
const useMetodosPago = (userData) => {
  const [metodos, setMetodos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const recargar = useCallback(async () => {
    if (!userData?.id_usuario) return;
    try {
      const res = await axios.get(`${API_URL}/metodos_pago/${userData.id_usuario}`);
      setMetodos(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('Error al cargar métodos de pago:', err);
      setError('No se pudieron cargar tus métodos de pago.');
    } finally {
      setCargando(false);
    }
  }, [userData?.id_usuario]);

  useEffect(() => { recargar(); }, [recargar]);

  return { metodos, cargando, error, recargar };
};

export const nombreMetodo = (metodo) => {
  const d = metodo?.detalle || {};
  switch (metodo?.tipo) {
    case 'Tarjeta': return `Tarjeta •••• ${d.ultimos4 || ''}`.trim();
    case 'Yape': return `Yape · ${d.codigo || ''}`.trim();
    case 'PayPal': return `PayPal · ${d.correo || ''}`.trim();
    default: return metodo?.tipo || 'Método';
  }
};

export default useMetodosPago;

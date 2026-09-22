import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Token de sesión emitido por el backend en login / registro. El backend deriva de él
// el usuario y su rol real; el frontend ya no es quien "decide" el rol.
let authToken = null;
const EVENTO_SESION_EXPIRADA = 'quive:sesion-expirada';

export const setAuthToken = (token) => {
  authToken = token || null;
};

const esLlamadaApi = (url) => typeof url === 'string' && url.startsWith(API_URL);

const avisarSesionExpirada = () => window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));

export const onSesionExpirada = (callback) => {
  window.addEventListener(EVENTO_SESION_EXPIRADA, callback);
  return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, callback);
};

// fetch con credenciales. Solo adjunta el token a llamadas al backend propio,
// nunca a servicios externos (Nominatim, OpenRouteService...).
export const apiFetch = async (url, options = {}) => {
  const headers = new Headers(options.headers || {});
  if (authToken && esLlamadaApi(url)) headers.set('Authorization', `Bearer ${authToken}`);
  const respuesta = await fetch(url, { ...options, headers });
  if (respuesta.status === 401 && authToken && esLlamadaApi(url)) avisarSesionExpirada();
  return respuesta;
};

axios.interceptors.request.use((config) => {
  if (authToken && esLlamadaApi(config.url)) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

axios.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401 && authToken && esLlamadaApi(error.config?.url)) {
      avisarSesionExpirada();
    }
    return Promise.reject(error);
  }
);

export default API_URL;

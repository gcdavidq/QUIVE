import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ userData, children }) => {
  // Aquí puedes comprobar la propiedad que uses para saber
  // si el usuario está autenticado. Por ejemplo userData.token
  const isLoggedIn = Boolean(userData.nombre_completo);
  return isLoggedIn
    ? <Navigate to="/dashboard" replace />
    : children;
};

export default PublicRoute;
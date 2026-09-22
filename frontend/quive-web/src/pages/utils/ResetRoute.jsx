import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ userData, children }) => {
  const isLoggedIn = Boolean(userData?.token && userData?.id_usuario);
  return isLoggedIn
    ? <Navigate to="/dashboard" replace />
    : children;
};

export default PublicRoute;

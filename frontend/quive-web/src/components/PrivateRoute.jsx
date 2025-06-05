import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ userData, children }) => {
  if (!userData || !userData.email) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default PrivateRoute;

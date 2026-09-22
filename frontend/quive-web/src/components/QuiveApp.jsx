
import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import PublicRoute from '../pages/utils/ResetRoute';
import LandingScreen from '../pages/LandingScreen';
import RegisterScreen from '../pages/RegisterScreen';
import LoginScreen from '../pages/LoginScreen';
import RegistroExitosoScreen from '../pages/RegistroExitosoScreen';
import DashboardScreen from '../pages/DashboardScreen';
import { setAuthToken, onSesionExpirada } from '../api';

import PrivateRoute from '../pages/utils/PrivateRoute';

// Una sesión guardada sin token es de antes de que el backend exigiera autenticación:
// no sirve para ninguna llamada, así que se descarta y se pide iniciar sesión de nuevo.
const leerSesionGuardada = () => {
  try {
    const guardada = JSON.parse(localStorage.getItem('userData') || '{}');
    return guardada?.token ? guardada : {};
  } catch {
    return {};
  }
};

const AppRoutes = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(leerSesionGuardada);

  // Se fija durante el render (no en un efecto) para que las peticiones que lanzan
  // los efectos de las pantallas hijas ya salgan con el token.
  setAuthToken(userData?.token);

  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(userData || {}));
  }, [userData]);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('userData');
    // Restos de versiones anteriores que cacheaban métodos de pago sin distinguir usuario.
    localStorage.removeItem('metodosPago');
    localStorage.removeItem('metodosSeleccionados');
    setUserData({});
  }, []);

  useEffect(() => onSesionExpirada(() => {
    cerrarSesion();
    navigate('/login');
  }), [cerrarSesion, navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={
          <PublicRoute userData={userData}>
            <LandingScreen onNavigate={navigate} />
          </PublicRoute>
        }
        />
        <Route
          path="/register"
          element={
            <PublicRoute userData={userData}>
              <RegisterScreen
                onNavigate={navigate}
                setUserData={setUserData}
              />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute userData={userData}>
              <LoginScreen
                onNavigate={navigate}
                setUserData={setUserData}
              />
            </PublicRoute>
          }
        />
        <Route
          path="/registroExitoso"
          element={<RegistroExitosoScreen onNavigate={navigate} />}
        />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute userData={userData}>
              <DashboardScreen
                userData={userData}
                setUserData={setUserData}
                onNavigate={navigate}
                onLogout={cerrarSesion}
              />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

const QuiveApp = () => {
  return (
    <Router>
      <div className="min-h-screen theme-bg-primary theme-text-primary">
        <AppRoutes />
      </div>
    </Router>
  );
};

export default QuiveApp;

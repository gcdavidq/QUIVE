
import React, { useState, useEffect } from 'react';
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

import PrivateRoute from '../pages/utils/PrivateRoute';

const AppRoutes = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(() => {
  
    const storedData = localStorage.getItem('userData');
    return storedData ? JSON.parse(storedData) : {};
  });

  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(userData));
  }, [userData]);

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
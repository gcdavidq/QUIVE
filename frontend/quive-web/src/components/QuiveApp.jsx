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
import DashboardScreenTransportistas from '../pages/DashboardScreenTransportista';

import PrivateRoute from '../pages/utils/PrivateRoute';

const AppRoutes = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(() => localStorage.getItem('userType') || '');
  const [userData, setUserData] = useState(() => {
  
    const storedData = localStorage.getItem('userData');
    return storedData ? JSON.parse(storedData) : {};
  });

  useEffect(() => {
    localStorage.setItem('userType', userType);
  }, [userType]);

  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(userData));
  }, [userData]);

  return (
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
              userType={userType}
              setUserType={setUserType}
            />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={<PublicRoute userData={userData}>
          <LoginScreen 
            onNavigate={navigate} 
            setUserData={setUserData} />
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
            {
              userData?.tipo_usuario === 'transportista' ? (
                <DashboardScreenTransportistas
                  userData={userData}
                  setUserData={setUserData}
                  onNavigate={navigate}
                  userType={userType}
                />
              ) : (
                <DashboardScreen
                  userData={userData}
                  setUserData={setUserData}
                  onNavigate={navigate}
                  userType={userType}
                />
              )
            }
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const QuiveApp = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
      </div>
    </Router>
  );
};

export default QuiveApp;

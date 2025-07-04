import React from "react";
import { Truck, Clock, Shield } from "lucide-react";

const LandingScreen = ({onNavigate}) => {
  return ( 
    <div className="min-h-screen theme-bg-primary transition-all duration-300">
      {/* Gradiente de fondo que cambia con el tema */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-500 dark:to-slate-500 dark:opacity-10"></div>
      
      {/* Header */}
      <header className="relative flex justify-between items-center p-6 theme-bg-primary/80 backdrop-blur-sm border-b theme-border">
        <div className="text-2xl font-bold text-blue-600">QUIVE</div>
        <nav className="hidden md:flex space-x-8">
          <button className="theme-text-secondary hover:text-blue-600 transition-colors">Nosotros</button>
          <button className="theme-text-secondary hover:text-blue-600 transition-colors">Servicios</button>
          <button className="theme-text-secondary hover:text-blue-600 transition-colors">Contacto</button>
        </nav>
        <div className="flex space-x-4">
          <button 
            onClick={() => onNavigate('login')}
            className="px-6 py-2 text-blue-600 border border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
          >
            Iniciar Sesión
          </button>
          <button 
            onClick={() => onNavigate('register')}
            className="px-6 py-2 text-blue-600 border border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors"
          >
            Registrarse
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-20">
        <div className="max-w-4xl">
          <h1 className="text-6xl font-bold text-blue-600 mb-8 leading-tight">
            QUIVE, UNA<br />
            MUDANZA SIN<br />
            ESTRÉS
          </h1>
          <p className="text-xl theme-text-secondary mb-12 max-w-md">
            Somos tu solución a una mudanza rápida y segura. Conectamos usuarios con transportistas confiables.
          </p>
          <button 
            onClick={() => onNavigate('login')}
            className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            INICIAR UNA MUDANZA
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-12">¿Por qué elegir QUIVE?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center theme-card rounded-lg p-6 backdrop-blur-sm">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Transportistas Verificados</h3>
            <p className="theme-text-secondary">Todos nuestros transportistas están verificados y cuentan con seguro</p>
          </div>
          <div className="text-center theme-card rounded-lg p-6 backdrop-blur-sm">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Servicio Rápido</h3>
            <p className="theme-text-secondary">Encuentra transportistas disponibles en minutos</p>
          </div>
          <div className="text-center theme-card rounded-lg p-6 backdrop-blur-sm">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Seguro y Confiable</h3>
            <p className="theme-text-secondary">Tu mudanza está protegida con nuestro seguro integral</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingScreen;
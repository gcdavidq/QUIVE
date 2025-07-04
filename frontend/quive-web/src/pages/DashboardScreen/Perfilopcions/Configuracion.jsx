import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Laptop, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../../ThemeContext';

const Configuracion = () => {
  const navigate = useNavigate();
  const { theme, resolvedTheme, setThemePreference } = useTheme();

  const [preferencias, setPreferencias] = useState({
    miniatura: true,
    subtitulos: true,
    velocidad: true,
  });

  const toggle = (key) => {
    setPreferencias((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSelected = (value) => theme === value;

  return (
    <div className="min-h-screen theme-card p-4">
      <header className="theme-bg-primary shadow-sm p-4 flex items-center gap-4 rounded-lg">
        <button
          onClick={() => navigate('..')}
          className="p-2 rounded-full theme-text-secondary hover:text-blue-600"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold theme-title-dark">Configuración</h1>
      </header>

      <section className="mt-6">
        <h2 className="font-semibold mb-2 theme-text-primary">Aspecto</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setThemePreference('light')}
            className={`p-4 rounded-lg border text-sm flex flex-col items-center space-y-2 transition-all theme-border ${isSelected('light') ? 'ring-2 ring-blue-500' : ''}`}
          >
            <Sun className="w-6 h-6" />
            <span>Claro</span>
          </button>
          <button
            onClick={() => setThemePreference('dark')}
            className={`p-4 rounded-lg border text-sm flex flex-col items-center space-y-2 transition-all theme-border ${isSelected('dark') ? 'ring-2 ring-blue-500' : ''}`}
          >
            <Moon className="w-6 h-6" />
            <span>Oscuro</span>
          </button>
          <button
            onClick={() => setThemePreference('system')}
            className={`p-4 rounded-lg border text-sm flex flex-col items-center space-y-2 transition-all theme-border ${isSelected('system') ? 'ring-2 ring-blue-500' : ''}`}
          >
            <Laptop className="w-6 h-6" />
            <span>Automático</span>
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold mb-2 theme-text-primary">Accesibilidad</h2>
        <div className="space-y-4">
          {[
            { key: 'miniatura', label: 'Miniatura animada' },
            { key: 'subtitulos', label: 'Subtítulos' },
            { key: 'velocidad', label: 'Mayor velocidad de desplazamiento' },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 rounded-lg theme-card"
            >
              <span className="theme-text-primary text-sm font-medium">{label}</span>
              <button
                onClick={() => toggle(key)}
                className={`w-12 h-6 rounded-full transition-colors duration-200 relative ${preferencias[key] ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${preferencias[key] ? 'translate-x-6' : 'translate-x-0'}`}
                ></span>
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 text-sm theme-text-secondary">
        <p>Preferencia elegida: <strong>{theme}</strong></p>
        <p>Tema aplicado real: <strong>{resolvedTheme}</strong></p>
      </div>
    </div>
  );
};

export default Configuracion;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Laptop, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../../ThemeContext';

const Configuracion = () => {
  const navigate = useNavigate();
  const { theme, setThemePreference } = useTheme();

  const isSelected = (value) => theme === value;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="surface-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('..')}
            className="p-2.5 rounded-xl border border-[var(--color-border)] hover:border-[#4d93f5] text-[#345273] dark:text-white transition-all"
            aria-label="Regresar a perfil"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="section-kicker">PREFERENCIAS</span>
            <h1 className="font-display text-2xl font-bold text-[#16365f] dark:text-white mt-0.5">
              Configuración de la Cuenta
            </h1>
          </div>
        </div>
      </div>

      {/* Tema y Apariencia */}
      <div className="surface-card p-6 sm:p-8">
        <span className="section-kicker">APARIENCIA DEL SISTEMA</span>
        <h3 className="font-display text-lg font-bold text-[#16365f] dark:text-white mt-1 mb-4">
          Tema Visual
        </h3>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => setThemePreference('light')}
            className={`p-4 rounded-xl border text-sm flex flex-col items-center space-y-2.5 transition-all ${
              isSelected('light') 
                ? 'border-[#4d93f5] bg-blue-50/50 dark:bg-blue-950/40 text-[#4d93f5] font-bold shadow-sm' 
                : 'border-[var(--color-border)] hover:border-[#4d93f5]/50 theme-text-secondary'
            }`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-xs">Claro</span>
          </button>
          <button
            onClick={() => setThemePreference('dark')}
            className={`p-4 rounded-xl border text-sm flex flex-col items-center space-y-2.5 transition-all ${
              isSelected('dark') 
                ? 'border-[#4d93f5] bg-blue-50/50 dark:bg-blue-950/40 text-[#4d93f5] font-bold shadow-sm' 
                : 'border-[var(--color-border)] hover:border-[#4d93f5]/50 theme-text-secondary'
            }`}
          >
            <Moon className="w-6 h-6" />
            <span className="text-xs">Oscuro</span>
          </button>
          <button
            onClick={() => setThemePreference('system')}
            className={`p-4 rounded-xl border text-sm flex flex-col items-center space-y-2.5 transition-all ${
              isSelected('system') 
                ? 'border-[#4d93f5] bg-blue-50/50 dark:bg-blue-950/40 text-[#4d93f5] font-bold shadow-sm' 
                : 'border-[var(--color-border)] hover:border-[#4d93f5]/50 theme-text-secondary'
            }`}
          >
            <Laptop className="w-6 h-6" />
            <span className="text-xs">Automático</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default Configuracion;
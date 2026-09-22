import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const RegistroExitosoScreen = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-app-bg)] p-4">
      <div className="surface-card p-8 sm:p-10 rounded-3xl text-center max-w-md w-full shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} />
        </div>

        <span className="section-kicker">CUENTA CREADA</span>
        <h1 className="font-display text-2xl font-extrabold text-[#16365f] dark:text-white mt-1 mb-2">
          ¡Registro exitoso!
        </h1>
        <p className="text-sm theme-text-secondary mb-8">
          Tu cuenta fue creada correctamente. Inicia sesión para comenzar a usar QUIVE.
        </p>

        <button onClick={() => onNavigate('/login')} className="primary-button w-full justify-center !py-3">
          <span>Iniciar sesión</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default RegistroExitosoScreen;

import React from 'react';
import { Check, MapPin, Boxes, UserCheck, ShieldCheck, CreditCard } from 'lucide-react';

const stepDetails = [
  { step: 1, label: "Ruta & Fecha", icon: MapPin },
  { step: 2, label: "Cubicaje", icon: Boxes },
  { step: 3, label: "Transportista", icon: UserCheck },
  { step: 4, label: "Revisión", icon: ShieldCheck },
  { step: 5, label: "Confirmación", icon: CreditCard },
];

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-2">
      <div className="flex items-center justify-between relative">
        {stepDetails.map(({ step, label, icon: Icon }, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-[#4d93f5] text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100 dark:ring-blue-950/60 scale-110'
                      : 'bg-[#edf3f8] dark:bg-[#16273e] text-[#8ea4be] border border-[var(--color-border)]'
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={2.5} /> : <Icon size={16} />}
                </div>
                <span 
                  className={`text-[11px] font-bold mt-2 hidden sm:block transition-colors ${
                    isCurrent 
                      ? 'text-[#4d93f5]' 
                      : isCompleted 
                      ? 'text-[#16365f] dark:text-white' 
                      : 'text-[#8ea4be]'
                  }`}
                >
                  {label}
                </span>
              </div>

              {index < stepDetails.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-[#e8f0f8] dark:bg-[#1a2c44] rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-[#4d93f5] transition-all duration-500"
                    style={{ 
                      width: step < currentStep ? '100%' : '0%' 
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;

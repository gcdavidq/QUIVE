import React from 'react';
import { Check } from 'lucide-react';

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              step <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600 dark:from-slate-600 dark:to-slate-700 dark:text-gray-300'
            }`}
          >
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 5 && (
            <div
              className={`w-12 h-0.5 transition-colors ${
                step < currentStep
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-slate-600'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>

  );
};

export default StepIndicator;

import React from 'react';

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  activeStep: number; // 0-indexed
  onStepClick?: (idx: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onStepClick,
  className = '',
}) => {
  return (
    <nav aria-label="Progress" className={`w-full ${className}`}>
      <ol className="flex items-center justify-between w-full">
        {steps.map((step, idx) => {
          const isComplete = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <li
              key={step.id}
              className={`relative flex flex-col items-center flex-1 ${
                idx !== steps.length - 1 ? 'pr-4 sm:pr-8' : ''
              }`}
            >
              <div className="flex items-center w-full">
                <button
                  type="button"
                  disabled={!onStepClick || idx > activeStep}
                  onClick={() => onStepClick?.(idx)}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border text-xs font-mono font-bold transition-all z-10 shrink-0 ${
                    isComplete
                      ? 'bg-[#c8f542] border-[#c8f542] text-[#0a2a12]'
                      : isCurrent
                      ? 'border-[#c8f542] text-[#c8f542] bg-[#c8f542]/15 shadow-lime-glow'
                      : 'border-white/20 text-white/40 bg-white/5'
                  }`}
                >
                  {isComplete ? (
                    // @ts-expect-error solar icon
                    <iconify-icon icon="solar:check-circle-bold" width="16" height="16" />
                  ) : (
                    idx + 1
                  )}
                </button>

                {idx !== steps.length - 1 && (
                  <div
                    className={`h-0.5 w-full ml-2 sm:ml-4 transition-colors ${
                      isComplete ? 'bg-[#c8f542]' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>

              <div className="mt-2 text-center w-full">
                <div
                  className={`text-xs font-heading font-medium tracking-tight truncate ${
                    isCurrent ? 'text-[#c8f542]' : isComplete ? 'text-white/80' : 'text-white/40'
                  }`}
                >
                  {step.title}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

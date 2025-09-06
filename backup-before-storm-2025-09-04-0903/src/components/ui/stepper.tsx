// Composant Stepper pour navigation entre étapes
import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
  completedSteps: number[];
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  completedSteps
}) => {
  return (
    <nav aria-label="Progress" className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index);
          const isCurrent = index === currentStep;
          const isClickable = index <= Math.max(currentStep, Math.max(...completedSteps, -1) + 1);
          
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex flex-col items-center cursor-pointer transition-all duration-200",
                  isClickable ? "hover:scale-105" : "cursor-not-allowed opacity-50"
                )}
                onClick={() => isClickable && onStepClick(index)}
                role="button"
                tabIndex={isClickable ? 0 : -1}
                aria-current={isCurrent ? "step" : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onStepClick(index);
                  }
                }}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground border-2 border-muted-foreground/20"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center max-w-24">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <ChevronRight
                  className={cn(
                    "w-5 h-5 mx-2 flex-shrink-0",
                    isCompleted ? "text-primary" : "text-muted-foreground"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Barre de progression */}
      <div className="mt-6 bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500 ease-out"
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`
          }}
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-label={`Étape ${currentStep + 1} sur ${steps.length}`}
        />
      </div>
    </nav>
  );
};
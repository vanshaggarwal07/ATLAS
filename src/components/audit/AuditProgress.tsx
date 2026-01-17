import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
  status: string;
}

interface AuditProgressProps {
  steps: Step[];
  currentStep: number;
}

export function AuditProgress({ steps, currentStep }: AuditProgressProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol role="list" className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              'relative flex-1',
              index !== steps.length - 1 && 'pr-8 sm:pr-20'
            )}
          >
            <div className="flex items-center">
              <div
                className={cn(
                  'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  index < currentStep
                    ? 'border-primary bg-primary text-primary-foreground'
                    : index === currentStep
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted bg-background text-muted-foreground'
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="font-medium">{step.id}</span>
                )}
              </div>
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-5 left-10 -ml-px h-0.5 w-full',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
            <div className="mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.name}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

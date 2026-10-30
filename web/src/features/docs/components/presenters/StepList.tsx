import { stepId, stepNumber } from '@/features/docs/lib/sections.ts';
import type { Step } from '@/features/docs/types.ts';
import '@/features/docs/styles/steps.css';

type Props = {
  steps: Step[];
  prefix: string;
};

export function StepList({ steps, prefix }: Props) {
  return (
    <div className="documentation-steps">
      {steps.map((step, i) => (
        <article key={step.title} id={stepId(prefix, i)} className="documentation-step">
          <div className="documentation-text">
            <p className="documentation-step-label">
              <span>{stepNumber(i)}</span>
              {step.label}
            </p>
            <h3>{step.title}</h3>
            {step.children}
          </div>
          {step.aside}
        </article>
      ))}
    </div>
  );
}

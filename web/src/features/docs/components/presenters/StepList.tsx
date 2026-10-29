import { stepId, stepNumber } from '@/features/docs/lib/sections.ts';
import type { Step } from '@/features/docs/types.ts';
import '@/features/docs/styles/steps.css';

type Props = {
  steps: Step[];
  prefix: string;
};

export function StepList({ steps, prefix }: Props) {
  return (
    <div className="doc-fns">
      {steps.map((s, i) => (
        <article key={s.title} id={stepId(prefix, i)} className="doc-fn">
          <div className="doc-text">
            <p className="doc-step">
              <span>{stepNumber(i)}</span>
              {s.label}
            </p>
            <h3>{s.title}</h3>
            {s.children}
          </div>
          {s.aside}
        </article>
      ))}
    </div>
  );
}

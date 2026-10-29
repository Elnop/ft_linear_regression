import { stepId, stepNumber, type TocSection } from '@/features/docs/lib/sections.ts';
import '@/features/docs/styles/toc.css';

type Props = {
  sections: TocSection[];
  prefix: string;
};

export function DocToc({ sections, prefix }: Props) {
  return (
    <nav className="doc-toc" aria-label="Sommaire">
      <p className="label">Sommaire</p>
      <div className="doc-toc-sections">
        {sections.map((sec) => (
          <div key={sec.title}>
            <p className="doc-toc-title">{sec.title}</p>
            <ol>
              {sec.items.map(({ step, i }) => (
                <li key={step.title}>
                  <a
                    href={`#${stepId(prefix, i)}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(stepId(prefix, i))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <span>{stepNumber(i)}</span>
                    {step.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </nav>
  );
}

import { stepId, stepNumber } from '@/features/docs/lib/sections.ts';
import { scrollToElement } from '@/shared/lib/scrollToElement.ts';
import '@/features/docs/styles/table-of-contents.css';
import type { TableOfContentsSection } from '@/features/docs/DocsTypes.ts';

type TableOfContentsProps = {
  sections: TableOfContentsSection[];
  prefix: string;
};

export function TableOfContents({ sections, prefix }: TableOfContentsProps) {
  return (
    <nav className="table-of-contents" aria-label="Sommaire">
      <p className="label">Sommaire</p>
      <div className="table-of-contents-sections">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="table-of-contents-title">{section.title}</p>
            <ol>
              {section.items.map(({ step, index }) => (
                <li key={step.title}>
                  <a
                    href={`#${stepId(prefix, index)}`}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToElement(stepId(prefix, index));
                    }}
                  >
                    <span>{stepNumber(index)}</span>
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

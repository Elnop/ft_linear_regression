import '@/features/docs/styles/code.css';

type FormulaProps = { children: string };

export function Formula({ children }: FormulaProps) {
  return <pre className="documentation-code documentation-math">{children}</pre>;
}

import '@/features/docs/styles/code.css';

export function Formula({ children }: { children: string }) {
  return <pre className="documentation-code documentation-math">{children}</pre>;
}

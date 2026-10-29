import '@/features/docs/styles/code.css';

export function Formula({ children }: { children: string }) {
  return <pre className="doc-code doc-math">{children}</pre>;
}

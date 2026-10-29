import { tokenize } from '@/features/docs/lib/source.ts';

export function Code({ code }: { code: string }) {
  return (
    <pre className="doc-code">
      <code>
        {tokenize(code).map((t, i) =>
          t.kind === 'text' ? t.text : (
            <span key={i} className={`tk-${t.kind}`}>
              {t.text}
            </span>
          ),
        )}
      </code>
    </pre>
  );
}

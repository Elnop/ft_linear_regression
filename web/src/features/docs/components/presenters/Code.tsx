import { tokenize } from '@/features/docs/lib/source.ts';
import '@/features/docs/styles/code.css';

export function Code({ code }: { code: string }) {
  return (
    <pre className="documentation-code">
      <code>
        {tokenize(code).map((token, i) =>
          token.kind === 'text' ? token.text : (
            <span key={i} className={`token-${token.kind}`}>
              {token.text}
            </span>
          ),
        )}
      </code>
    </pre>
  );
}

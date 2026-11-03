import { tokenize } from '@/features/docs/lib/tokenize.ts';
import '@/features/docs/styles/code.css';

type CodeProps = { code: string };

export function Code({ code }: CodeProps) {
  return (
    <pre className="documentation-code" tabIndex={0}>
      <code>
        {tokenize(code).map((token, i) =>
          token.kind === 'text' ? (
            token.text
          ) : (
            <span key={i} className={`token-${token.kind}`}>
              {token.text}
            </span>
          ),
        )}
      </code>
    </pre>
  );
}

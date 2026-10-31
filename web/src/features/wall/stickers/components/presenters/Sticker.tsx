import type { PlacedSticker } from '@/features/wall/stickers/types.ts';
import { peelGeometry, tornEdge } from '@/features/wall/stickers/lib/damage.ts';

type Props = PlacedSticker & { id: string };

export function Sticker({ id, art, damage, width, x, y, rotation }: Props) {
  const { viewWidth, viewHeight } = art;
  const peel = damage.peel && peelGeometry(viewWidth, viewHeight, damage.peel);
  const tearX = damage.tear !== undefined ? damage.tear * viewWidth : undefined;
  const scrape = damage.scrape;
  return (
    <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} width={width} height={(width * viewHeight) / viewWidth} style={{ left: x, top: y, transform: `rotate(${rotation}deg)` }}>
      <defs>
        <filter id={`${id}-wear`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed={damage.seed} result="big" />
          <feColorMatrix in="big" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  16 0 0 0 ${-16 * scrape}`} result="blob" />
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed={damage.seed + 7} result="fine" />
          <feColorMatrix in="fine" type="matrix" values="0 0 0 0.16 0.8  0 0 0 0.16 0.78  0 0 0 0.16 0.74  0 0 0 0 1" result="grain" />
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" result="tinted" />
          <feComposite in="tinted" in2="SourceGraphic" operator="in" result="print" />
          <feComposite in="print" in2="blob" operator="out" result="kept" />
          <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="3" seed={damage.seed + 13} result="soft" />
          <feColorMatrix in="soft" type="matrix" values="0.35 0 0 0 0.6  0.35 0 0 0 0.58  0.35 0 0 0 0.54  -6 0 0 0 4.6" result="residue" />
          <feComposite in="residue" in2="blob" operator="in" result="residue-blob" />
          <feComposite in="residue-blob" in2="SourceGraphic" operator="in" result="residue-print" />
          <feMerge result="merged">
            <feMergeNode in="residue-print" />
            <feMergeNode in="kept" />
          </feMerge>
          <feColorMatrix in="fine" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -14 0 0 0 11" result="holes" />
          <feComposite in="merged" in2="holes" operator="in" />
        </filter>
        <filter id={`${id}-residue`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="3" seed={damage.seed + 3} />
          <feColorMatrix type="matrix" values="0.35 0 0 0 0.6  0.35 0 0 0 0.58  0.35 0 0 0 0.54  -6 0 0 0 4.4" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id={`${id}-back`} x="-20%" y="-20%" width="140%" height="140%">
          <feFlood floodColor="#ece7dc" />
          <feComposite in2="SourceAlpha" operator="in" />
          <feDropShadow dx="0" dy="0" stdDeviation="1.6" floodOpacity="0.6" />
        </filter>
        {peel && (
          <>
            <clipPath id={`${id}-keep`}>
              <polygon points={peel.keep} />
            </clipPath>
            <clipPath id={`${id}-cut`}>
              <polygon points={peel.cut} />
            </clipPath>
          </>
        )}
        {tearX !== undefined && (
          <>
            <clipPath id={`${id}-keep`}>
              <polygon points={tornEdge(viewWidth, viewHeight, tearX, damage.seed)} />
            </clipPath>
            <clipPath id={`${id}-strip`}>
              <polygon points={tornEdge(viewWidth, viewHeight, tearX, damage.seed + 1, 0.12 * viewWidth)} />
            </clipPath>
          </>
        )}
      </defs>
      {tearX !== undefined && (
        <g clipPath={`url(#${id}-strip)`}>
          <g filter={`url(#${id}-residue)`}>{art.body}</g>
        </g>
      )}
      <g clipPath={peel || tearX !== undefined ? `url(#${id}-keep)` : undefined}>
        <g filter={`url(#${id}-wear)`}>{art.body}</g>
      </g>
      {peel && (
        <g transform={peel.matrix}>
          <g clipPath={`url(#${id}-cut)`}>
            <g filter={`url(#${id}-back)`}>{art.body}</g>
          </g>
        </g>
      )}
    </svg>
  );
}

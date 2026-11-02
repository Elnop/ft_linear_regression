import type { Rectangle } from '@/shared/types/GeometryTypes.ts';
import { titleLetters } from '@/shared/lib/titleLetters.ts';
import type { TitleLayout } from '@/shared/types/TitleTypes.ts';
import { WIDE_EM } from '@/shared/configs/SceneConfig.ts';
import { STROKE } from '@/shared/configs/TitleConfig.ts';

const TITLE = 'ft_linear_regression';
const SPLIT_TITLE_BELOW_REM = 43.75;
const ASCENT = 1.72;
const DESCENT = 0.66;
const LINE_GAP = 0.12;

const TITLE_GAP_BELOW_REM = 3.75;
const ASIDE_ROOM_REM = 26.25;
const LINE_HEIGHT = ASCENT + DESCENT + LINE_GAP;

export function titleLayout(width: number, height: number, padding: number, chartTop: number, rem: number): TitleLayout {
  const top = Math.max(14, Math.min(28, height * 0.025));
  const texts = width < SPLIT_TITLE_BELOW_REM * rem ? ['ft_linear_', 'regression'] : [TITLE];
  const maxWidth = width >= WIDE_EM * rem ? Math.min(width * 0.6, 920, width - 2 * padding - ASIDE_ROOM_REM * rem) : width - 2 * padding;
  const maxHeight = chartTop - top - TITLE_GAP_BELOW_REM * rem;
  const unit = measure(texts);
  const em = Math.max(8, Math.min(52, maxWidth / unit.width, maxHeight / unit.height));
  return {
    rectangle: { x: padding, y: top, width: unit.width * em, height: unit.height * em },
    em,
    lines: texts.map((text, k) => ({ text, x: padding - unit.x * em, baseline: top + (k * LINE_HEIGHT - unit.y) * em })),
  };
}

function measure(texts: string[]): Rectangle {
  const lines = texts.map((text, k) => ({ text, x: 0, baseline: k * LINE_HEIGHT }));
  const points = titleLetters({ em: 1, lines }, () => 0.5)
    .flat(2)
    .flatMap((stroke) => stroke.points);
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const margin = STROKE / 2 + 0.08;
  const x = Math.min(...xs) - margin;
  const y = Math.min(...ys) - margin;
  return { x, y, width: Math.max(...xs) + margin - x, height: Math.max(...ys) + margin - y };
}

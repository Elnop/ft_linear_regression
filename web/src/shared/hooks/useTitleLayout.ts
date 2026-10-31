import { useMemo } from 'react';
import { titleLayout } from '@/shared/lib/title/layout.ts';
import { useViewport } from '@/shared/stores/viewportStore.ts';
import type { TitleLayout } from '@/shared/types/TitleTypes.ts';

export function useTitleLayout(): TitleLayout {
  const { width, height } = useViewport();
  return useMemo(() => titleLayout(width, height), [width, height]);
}

import { useMemo } from 'react';
import { titleLayout } from '@/features/wall/shared/lib/titleLayout.ts';
import { useViewport } from '@/shared/stores/viewportStore.ts';
import type { TitleLayout } from '@/features/wall/shared/types/TitleTypes.ts';

export function useTitleLayout(): TitleLayout {
  const { width, height } = useViewport();
  return useMemo(() => titleLayout(width, height), [width, height]);
}

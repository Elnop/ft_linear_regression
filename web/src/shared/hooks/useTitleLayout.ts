import { useMemo } from 'react';
import { titleLayout, type TitleLayout } from '@/shared/lib/title/layout.ts';
import { useViewport } from '@/shared/stores/viewportStore.ts';

export function useTitleLayout(): TitleLayout {
  const { width, height } = useViewport();
  return useMemo(() => titleLayout(width, height), [width, height]);
}

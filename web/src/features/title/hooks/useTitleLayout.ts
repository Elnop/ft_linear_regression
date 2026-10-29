import { useMemo } from 'react';
import { titleLayout, type TitleLayout } from '@/features/title/lib/layout.ts';
import { useViewport } from '@/lib/viewport/viewportStore.ts';

export function useTitleLayout(): TitleLayout {
  const { width, height } = useViewport();
  return useMemo(() => titleLayout(width, height), [width, height]);
}

import { DOCUMENTATION_ID } from '@/shared/configs/DocumentationConfig.ts';
import type { TabId } from '@/features/docs/DocsTypes.ts';

export function tabFromHash(hash: string, tabs: readonly { id: TabId }[]): TabId | null {
  const prefix = `#${DOCUMENTATION_ID}-`;
  if (!hash.startsWith(prefix)) return null;
  const candidate = hash.slice(prefix.length).split('-')[0];
  return tabs.find((tab) => tab.id === candidate)?.id ?? null;
}

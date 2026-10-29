export const TABS = [
  { id: 'theory', label: 'Théorie' },
  { id: 'code', label: 'Code' },
] as const;

export type TabId = (typeof TABS)[number]['id'];

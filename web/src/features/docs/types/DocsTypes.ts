import type { ReactNode } from 'react';
import type { TABS } from '@/features/docs/lib/tabs.ts';

export type DocStep = {
  section: string;
  label: string;
  title: string;
  aside: ReactNode;
  children: ReactNode;
};

export type TabId = (typeof TABS)[number]['id'];

export type TableOfContentsSection = { title: string; items: { step: DocStep; index: number }[] };

export type Token = { kind: 'string' | 'number' | 'keyword' | 'type' | 'call' | 'text'; text: string };

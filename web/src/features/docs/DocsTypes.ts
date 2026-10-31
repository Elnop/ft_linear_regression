import type { ReactNode } from 'react';

export type Step = {
  section: string;
  label: string;
  title: string;
  aside: ReactNode;
  children: ReactNode;
};

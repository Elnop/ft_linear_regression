import type { ReactNode } from 'react';
import type { Sample, Thetas } from '@core/types/CoreTypes.ts';
import type { TABS } from '@/features/docs/configs/TabsConfig.ts';

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

export type DocFigures = {
  sampleCount: number;
  samples: Sample[];
  kmMin: number;
  kmMax: number;
  meanSquaredKm: number;
  learningRate: number;
  iterations: number;
  descent: Thetas & { cost: number };
  leastSquares: Thetas;
  r2: number;
  rmse: number;
  mae: number;
  meanPrice: number;
  exampleMileage: number;
  examplePrice: number;
  divergentLearningRate: number;
  divergenceIteration: number;
};

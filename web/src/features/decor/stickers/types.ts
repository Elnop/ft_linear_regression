import type { ReactNode } from 'react';

export type Art = { vw: number; vh: number; body: ReactNode };
export type Corner = 'tl' | 'tr' | 'br' | 'bl';
export type Damage = { seed: number; scrape: number; peel?: [Corner, number]; tear?: number };
export type Item = { art: Art; dx: number; dy: number; w: number; rot: number; dmg: Damage };
export type Cluster = { u: number; v: number; items: Item[] };
export type PlacedSticker = { art: Art; dmg: Damage; w: number; x: number; y: number; rot: number };

import type { ReactNode } from 'react';

export type Art = { viewWidth: number; viewHeight: number; body: ReactNode };
export type Corner = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft';
type Wear = { seed: number; scrape: number };
export type Damage = Wear & ({ peel?: never; tear?: never } | { peel: [Corner, number]; tear?: never } | { tear: number; peel?: never });
type Item = { art: Art; offsetX: number; offsetY: number; width: number; rotation: number; damage: Damage };
export type Cluster = { u: number; v: number; items: Item[] };
export type PlacedSticker = { art: Art; damage: Damage; width: number; x: number; y: number; rotation: number };
